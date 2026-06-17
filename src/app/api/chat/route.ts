import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import { TYPO_MAP, KNOWN_WORDS } from "./constants";

export const runtime = "nodejs";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

// ===================================================
// SUPABASE CLIENT — server-side only (service role key bypasses RLS)
// ===================================================
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  
);

// ===================================================
// SCHEMA — hardcoded (stable; avoids querying information_schema)
// Update this if you add/remove columns in your table.
// ===================================================
const HARDCODED_SCHEMA = `Tables:
- restoran (id: uuid, nama_resto: text, daerah: text, alamat: text, rating: float, jumlah_review: int, harga: text, tipe_makanan: text, jenis_tempat: text, latitude: float, longitude: float)
`;

let cachedSchema: string | null = null;

function getSchema(): string {
  if (!cachedSchema) {
    cachedSchema = HARDCODED_SCHEMA;
    console.log("Schema loaded:\n", cachedSchema);
  }
  return cachedSchema;
}

// ===================================================
// RAW SQL EXECUTOR — via Supabase RPC function exec_sql
// Requires this function to exist in your Supabase project:
//
// CREATE OR REPLACE FUNCTION exec_sql(query text)
// RETURNS json
// LANGUAGE plpgsql
// SECURITY DEFINER
// AS $$
// DECLARE result json;
// BEGIN
//   EXECUTE 'SELECT json_agg(row_to_json(t)) FROM (' || query || ') t' INTO result;
//   RETURN COALESCE(result, '[]'::json);
// END;
// $$;
// ===================================================
async function runSQL(sql: string): Promise<any[]> {
  const { data, error } = await supabase.rpc("exec_sql", { query: sql });

  if (error) {
    console.error("Supabase RPC error:", error);
    throw new Error(error.message);
  }

  // data is already a JSON array (or null)
  if (!data) return [];
  if (Array.isArray(data)) return data;
  // Sometimes Supabase wraps it — unwrap if needed
  return data as any[];
}

// ===================================================
// SIMILARITY (Levenshtein)
// ===================================================
function similarity(x: string, y: string): number {
  const [a, b] = x.length >= y.length ? [x, y] : [y, x];
  const longer = a.length;
  const shorter = b.length;

  if (longer === 0) return 1.0;

  const costs = Array.from({ length: shorter + 1 }, (_, i) => i);

  for (let i = 1; i <= longer; i++) {
    let lastValue = i;
    for (let j = 1; j <= shorter; j++) {
      let newValue = costs[j - 1];
      if (a[i - 1] !== b[j - 1]) {
        newValue = Math.min(newValue, lastValue, costs[j]) + 1;
      }
      costs[j - 1] = lastValue;
      lastValue = newValue;
    }
    costs[shorter] = lastValue;
  }

  return (longer - costs[shorter]) / longer;
}

// ===================================================
// TYPO CORRECTION — TYPO_MAP & KNOWN_WORDS ada di constants.ts
// ===================================================
function correctTypos(text: string): string {
  let corrected = text;

  // Pass 1a: multi-kata dulu (pakai includes biasa, bukan \b)
  // karena \b tidak bekerja untuk frasa multi-kata dengan spasi
  const multiWordEntries = Object.entries(TYPO_MAP).filter(([k]) => k.includes(" "));
  for (const [typo, correct] of multiWordEntries) {
    corrected = corrected.replace(new RegExp(typo, "gi"), correct);
  }

  // Pass 1b: single-kata pakai \b supaya tidak partial match
  const singleWordEntries = Object.entries(TYPO_MAP).filter(([k]) => !k.includes(" "));
  for (const [typo, correct] of singleWordEntries) {
    const regex = new RegExp(`\\b${typo}\\b`, "gi");
    corrected = corrected.replace(regex, correct);
  }

  // Pass 2: fuzzy match per token untuk typo yang tidak ada di map
  const tokens = corrected.split(/\s+/);
  const fixedTokens = tokens.map((token) => {
    if (token.length <= 3 || /^\d+$/.test(token)) return token;

    let bestMatch = token;
    let bestScore = 0.75;

    for (const word of KNOWN_WORDS) {
      const score = similarity(token.toLowerCase(), word);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = word;
      }
    }

    return bestMatch;
  });

  return fixedTokens.join(" ");
}

// ===================================================
// NORMALISASI NEGASI + EXTRACT HARGA FILTER
// ===================================================
function normalizeQuestion(text: string): { normalized: string; hargaFilter: string } {
  const negWords = "(tidak|nggak|gak|ga|bukan|tdk|gk)";
  let normalized = text.replace(/\bterlalu\b/gi, "").trim();

  // Double negation: "tidak murah dan tidak mahal" → sedang
  const doubleNegRegex = new RegExp(
    `${negWords}\\s+murah.*${negWords}\\s+mahal|${negWords}\\s+mahal.*${negWords}\\s+murah`,
    "gi"
  );

  if (doubleNegRegex.test(normalized)) {
    normalized = normalized.replace(doubleNegRegex, "sedang").trim();
  } else {
    normalized = normalized
      .replace(new RegExp(`${negWords}\\s+mahal`, "gi"), "murah")  // tidak mahal → murah ($)
      .replace(new RegExp(`${negWords}\\s+murah`, "gi"), "mahal"); // tidak murah → mahal ($$$)
  }

  // Extract harga filter dari kata SEBELUM dihapus
  // Urutan cek: mahal → sedang → murah (dari paling spesifik)
  let hargaFilter = "";
  if (/\bmahal\b/i.test(normalized)) {
    hargaFilter = "harga = '$$$'";
  } else if (/\bsedang\b/i.test(normalized)) {
    hargaFilter = "harga = '$$'";
  } else if (/\bmurah\b/i.test(normalized)) {
    hargaFilter = "harga = '$'";
  }

  // Hapus kata harga dari kalimat supaya LLM tidak salah interpretasi
  normalized = normalized
    .replace(/\bmahal\b/gi, "")
    .replace(/\bsedang\b/gi, "")
    .replace(/\bmurah\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  console.log("NORMALIZED  :", normalized);
  console.log("HARGA FILTER:", hargaFilter || "(none)");

  return { normalized, hargaFilter };
}

// ===================================================
// SQL SAFETY CHECK — blokir query berbahaya dari LLM
// ===================================================
function isSafeQuery(sql: string): boolean {
  const forbidden =
    /\b(drop|delete|update|insert|alter|truncate|create|grant|revoke|exec|execute|pg_|information_schema)\b/i;
  return !forbidden.test(sql);
}

// ===================================================
// GROQ API HELPER
// ===================================================
async function callGroq(prompt: string): Promise<string> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content?.trim() || "";
}

// ===================================================
// MAIN HANDLER
// ===================================================
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const question: string = (body?.question ?? "").trim();

    if (!question) {
      return NextResponse.json({ error: "question is required" }, { status: 400 });
    }

    if (!GROQ_API_KEY) {
      return NextResponse.json(
        { error: "GROQ_API_KEY tidak dikonfigurasi di .env.local" },
        { status: 500 }
      );
    }

    // ===================================================
    // STEP 1: TYPO CORRECTION
    // ===================================================
    const questionLower = question.toLowerCase().trim().replace(/[?!.,;]/g, " ");

    // Pre-fix "gil" → "gili" sebelum TYPO_MAP (hardcoded supaya pasti jalan)
    const preFixed = questionLower
      .replace(/\bgil\s+trawangan\b/gi, "gili trawangan")
      .replace(/\bgil\s+meno\b/gi, "gili meno")
      .replace(/\bgil\s+air\b/gi, "gili air")
      .replace(/\bgil\s+asahan\b/gi, "gili asahan")
      .replace(/\bgil\s+gede\b/gi, "gili gede")
      .replace(/\boleh2\b/gi, "oleh oleh")
      .replace(/\boleh"/gi, "oleh oleh")
      .replace(/\boleh-oleh\b/gi, "oleh oleh");

    const correctedQuestion = correctTypos(preFixed);
    console.log("ORIGINAL :", questionLower);
    console.log("CORRECTED:", correctedQuestion);

    // ===================================================
    // STEP 2 & 3: INTENT & GREETING DETECTION VIA LLM
    // ===================================================
    const intentPrompt = `
Kamu adalah "Resto Assistant", chatbot ramah yang membantu mencari restoran di Lombok.

Analisis pesan user berikut: "${question}"

Tentukan intent (tujuan) dari pesan tersebut ke dalam salah satu dari 3 kategori berikut:
1. "GREETING": Jika user hanya menyapa (contoh: halo, selamat pagi, hai, bro) atau basa-basi ringan (contoh: apa kabar, terima kasih) TANPA mencari restoran.
2. "RESTAURANT_SEARCH": Jika user mencari restoran, makanan, cafe, harga, rating, daerah, atau lokasi (contoh: rekomendasi makan siang, daerah mana saja, halo cari cafe).
3. "UNRELATED": Jika user membahas topik di luar pencarian restoran atau sapaan (contoh: jadwal pesawat, berita hari ini, rumus matematika).

Kembalikan HANYA dalam format JSON valid tanpa markdown (tanpa backticks \`\`\`json):
{
  "intent": "GREETING" | "RESTAURANT_SEARCH" | "UNRELATED",
  "reply": "Jika intent GREETING atau UNRELATED, tulis balasan ramah & natural di sini dalam bahasa Indonesia. Jika GREETING, balas sapaannya (misal 'Selamat pagi! 🌅'). Jika UNRELATED, tolak dengan sopan dan arahkan untuk mencari restoran. Jika RESTAURANT_SEARCH, kosongkan string ini.",
  "greeting_prefix": "Jika intent RESTAURANT_SEARCH tapi user juga menyisipkan sapaan (misal 'Halo, cari makanan'), tulis sapaan balasannya di sini (misal 'Halo! 👋 '). Jika tidak ada sapaan, kosongkan."
}
`;

    let intentData = { intent: "RESTAURANT_SEARCH", reply: "", greeting_prefix: "" };
    try {
      let intentResponse = await callGroq(intentPrompt);
      intentResponse = intentResponse.replace(/\`\`\`json/gi, "").replace(/\`\`\`/g, "").trim();
      intentData = JSON.parse(intentResponse);
    } catch (e) {
      console.error("Failed to parse intent JSON, falling back to RESTAURANT_SEARCH", e);
    }

    if (intentData.intent === "GREETING") {
      const askSuffix = intentData.reply.endsWith("?") ? "" : " Ada yang bisa aku bantu untuk cari makan hari ini?";
      return NextResponse.json({
        success: true,
        query: null,
        result: [],
        type: "suggestion",
        answer: (intentData.reply.trim() + " " + askSuffix).trim(),
      });
    }

    if (intentData.intent === "UNRELATED") {
      return NextResponse.json({
        success: false,
        warning: true,
        answer: intentData.reply || "⚠️ Pertanyaan tidak berkaitan dengan restoran. Silakan ajukan pertanyaan seputar restoran / kuliner di Lombok.",
        result: [],
        query: null,
        type: "suggestion",
      });
    }

    const greetingPrefix = intentData.greeting_prefix ? intentData.greeting_prefix.trim() + " " : "";

    // ===================================================
    // STEP 4: NORMALISASI + EXTRACT HARGA FILTER
    // ===================================================
    const { normalized, hargaFilter } = normalizeQuestion(correctedQuestion);

    // ===================================================
    // STEP 5: GET SCHEMA
    // ===================================================
    const schema = getSchema();

    // ===================================================
    // STEP 6: DETEKSI INTENT "LIST SEMUA DAERAH"
    // Bypass LLM — langsung query DB dengan COUNT supaya semua daerah tampil
    // ===================================================
    const daerahIntentKeywords = [
      "daerah mana saja", "daerah apa saja", "semua daerah",
      "ada daerah apa", "daerah yang tersedia", "wilayah mana saja",
      "ada di mana saja", "list daerah", "daerah apa",
    ];

    const isDaerahListIntent = daerahIntentKeywords.some((k) =>
      correctedQuestion.includes(k)
    );

    if (isDaerahListIntent) {
      const daerahSql = `
        SELECT daerah, COUNT(id) as jumlah_restoran
        FROM restoran
        GROUP BY daerah
        ORDER BY daerah ASC
      `;
      const daerahRows = await runSQL(daerahSql);

      return NextResponse.json({
        success: true,
        query: "SELECT daerah, COUNT(id) FROM restoran GROUP BY daerah ORDER BY daerah ASC",
        result: daerahRows,
        type: "daerah",
        answer: greetingPrefix + "Ini semua daerah yang tersedia di database aku 👇",
      });
    }

    // ===================================================
    // STEP 7: SQL GENERATION via LLM
    // ===================================================
    const sqlPrompt = `
You are an expert SQL generator for PostgreSQL.
Return ONLY the raw SQL query. No markdown. No explanation. No comments.
Always ORDER BY rating DESC (unless user asks for popular/viral).
Always LIMIT 5 if user asks about restaurants.
Use table name: restoran.
Do NOT use SELECT *.
Always include these columns in SELECT: nama_resto, rating, jumlah_review, harga, daerah, latitude, longitude, alamat, jenis_tempat.

Rules:
- All column names and string values in the database are lowercase.
- If user asks about "populer", "terkenal", "hits", or "viral", use: ORDER BY jumlah_review DESC, rating DESC
- If user asks about "oleh oleh", use: jenis_tempat LIKE '%oleh oleh%'
- If user asks about "cafe", use: jenis_tempat LIKE '%cafe%'
- If user mentions a restaurant name, use: nama_resto LIKE '%value%'
- If user asks for a list of regions ("daerah"), use: SELECT DISTINCT daerah FROM restoran ORDER BY daerah ASC
- If user asks for the count/number of restaurants, ALWAYS include 'daerah' in SELECT: SELECT daerah, COUNT(id) as jumlah_restoran FROM restoran [with optional WHERE clause] GROUP BY daerah ORDER BY daerah ASC
- For tipe_makanan filters, use: tipe_makanan LIKE '%value%'
- If user asks about "seafood", use: tipe_makanan LIKE '%makanan laut%'
- If user asks about "pantai" (beach) or similar locations, use: alamat LIKE '%pantai%'
- "lombok" is the general location. If user mentions "lombok" or "pulau lombok", ignore it completely. Do NOT add ANY filters for it (e.g. do NOT use daerah LIKE '%lombok%' or alamat LIKE '%lombok%').

${hargaFilter
  ? `- CRITICAL PRICE FILTER: You MUST include exactly "${hargaFilter}" in the WHERE clause.`
  : ""}

Database schema:
${schema}

User question:
${normalized}

SQL:
`;

    let query = await callGroq(sqlPrompt);
    query = query.replace(/```sql/gi, "").replace(/```/g, "").trim();
    console.log("FINAL SQL:", query);

    // ===================================================
    // STEP 8: SAFETY CHECK
    // ===================================================
    if (!isSafeQuery(query)) {
      console.error("Unsafe SQL blocked:", query);
      return NextResponse.json(
        { success: false, error: "Query tidak aman, ditolak.", result: [], type: "suggestion" },
        { status: 400 }
      );
    }

    // ===================================================
    // STEP 9: EXECUTE QUERY via Supabase RPC
    // ===================================================
    let result: any[] = await runSQL(query);

    const isRestoQuery = result.length > 0 && !!result[0].nama_resto;
    if (isRestoQuery && result.length > 5) {
      result = result.slice(0, 5);
    }

    if (result.length === 0) {
      return NextResponse.json({
        success: true,
        query,
        result: [],
        type: "suggestion",
        answer:
          greetingPrefix +
          "Maaf, belum ada restoran yang sesuai 😊 Mau cari rekomendasi lainnya?",
      });
    }

    // ===================================================
    // STEP 10: ANSWER GENERATION
    // ===================================================
    const answerPrompt = `
Jawab pertanyaan user HANYA berdasarkan hasil SQL di bawah.

ATURAN KETAT:
- DILARANG membuat list restoran
- DILARANG menyebutkan nama restoran satu per satu
- DILARANG menampilkan data detail (sudah ditampilkan di card UI)
- Tulis HANYA 1 kalimat pengantar singkat dan santai

Contoh jawaban yang benar:
- "Ini rekomendasi restoran murah di Senggigi yang aku temukan 👇"
- "Aku nemuin beberapa tempat makan yang cocok buat kamu 👇"
- "Ini dia beberapa rekomendasi yang match sama permintaan kamu 👇"

Pertanyaan: ${question}
Hasil: ${JSON.stringify(result)}

Jawaban (1 kalimat saja):
`;

    const answer = await callGroq(answerPrompt);
    const type: "resto" | "daerah" = result[0]?.nama_resto ? "resto" : "daerah";

    return NextResponse.json({
      success: true,
      query,
      result,
      type,
      answer: greetingPrefix + answer,
    });
  } catch (err: any) {
    console.error("API ERROR:", err);
    return NextResponse.json(
      { error: err?.message || "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
