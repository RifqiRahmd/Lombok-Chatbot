import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const GROQ_API_KEY = process.env.GROQ_API_KEY;

const schema = `Tables:
- restoran (id: uuid, nama_resto: text, daerah: text, alamat: text, rating: float, jumlah_review: int, harga: text, tipe_makanan: text, jenis_tempat: text, latitude: float, longitude: float)`;

const question = "restoran dengan review terbanyak";

const sqlPrompt = `
You are an expert SQL generator for PostgreSQL.
Return ONLY the raw SQL query. No markdown. No explanation. No comments.
Always ORDER BY rating DESC (unless user asks for popular/viral or "lainnya", "lainya").
- If user asks for "lainnya", "lainya", "lagi", or "yang lain" (meaning "more" or "other options"), you MUST use: ORDER BY RANDOM() LIMIT 5 (Do NOT use rating DESC).
Always LIMIT 5 if user asks about restaurants.
Use table name: restoran.
Do NOT use SELECT *.
Always include these columns in SELECT: nama_resto, rating, jumlah_review, harga, daerah, latitude, longitude, alamat, jenis_tempat.

Rules:
- All column names and string values in the database are lowercase.
- If user asks about "populer", "terkenal", "hits", or "viral", use: ORDER BY jumlah_review DESC, rating DESC
- CRITICAL: If the question contains the word "restoran" or "resto", you MUST add: jenis_tempat LIKE '%restoran%'
- CRITICAL: If the question contains the word "oleh oleh", you MUST add: jenis_tempat LIKE '%oleh oleh%'
- CRITICAL: If the question contains the word "cafe", you MUST add: jenis_tempat LIKE '%cafe%'
- If user mentions a specific name, brand, or an unknown word that is not a region, ASSUME it is a restaurant name and use: nama_resto LIKE '%word%'
- If user asks for the count/number of restaurants, ALWAYS include 'daerah' in SELECT: SELECT daerah, COUNT(id) as jumlah_restoran FROM restoran [with optional WHERE clause] GROUP BY daerah ORDER BY daerah ASC
- For tipe_makanan filters, use: tipe_makanan LIKE '%value%'
- If user asks about "seafood", use: tipe_makanan LIKE '%makanan laut%'
- If user asks about "pantai" (beach) or similar locations, use: alamat LIKE '%pantai%'
- "lombok" is the general location. If user mentions "lombok" or "pulau lombok", ignore it completely. Do NOT add ANY filters for it (e.g. do NOT use daerah LIKE '%lombok%' or alamat LIKE '%lombok%').
- CRITICAL REGION RULE: NEVER include words like "pantai", "desa", "kota", "kabupaten", "kecamatan", or "jalan" inside the 'daerah' filter! For example, if user says "pantai nipah", you MUST use ONLY the core name: daerah LIKE '%nipah%'. Do NOT use daerah LIKE '%pantai nipah%'.

Database schema:
${schema}

Question: ${question}
SQL Query:`;

async function main() {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: \`Bearer \${GROQ_API_KEY}\`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: sqlPrompt }],
      temperature: 0,
    }),
  });
  
  const data = await res.json();
  console.log(data.choices[0].message.content);
}

main();
