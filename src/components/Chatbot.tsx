"use client";

import { useState, useEffect, useRef } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
  data?: any[];
  type?: "resto" | "daerah" | "suggestion" | "statistik";
};

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const suggestionPool = [
    "Rekomendasi restoran murah di Lombok",
    "Tempat makan dengan rating tinggi",
    "Restoran terbaik di Gili Trawangan",
    "Cafe hits di Lombok",
    "Tempat makan makanan laut enak",
    "Restoran dengan review terbanyak",
    "Tempat makan sushi di Lombok",
    "Kuliner italia di Lombok",
    "Resto dengan harga yang murah",
    "Tempat makan dekat pantai",
  ];

  const getRandomSuggestions = (count = 3) => {
    const shuffled = [...suggestionPool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "🍽️ Lagi pengen makan apa hari ini? 😋\n\nAku bisa bantu, coba pilih ini 👇",
      data: getRandomSuggestions().map((s) => ({ suggestion: s })),
      type: "suggestion",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (customInput?: string) => {
    const text = customInput || input;
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Dapatkan pesan user sebelumnya sebagai memori konteks
      // Abaikan pesan pendek/kelanjutan ("lainnya", "terdekat") agar history selalu menyimpan kueri utama
      const userMessages = messages.filter((m) => m.role === "user" && !/^(lainn?ya|lagi|yang lain|ada lagi|sini|terdekat|sekitar|tengah kota|pusat kota|pantai)$/i.test(m.content.trim()));
      const lastUserMsg = userMessages.length > 0 ? userMessages[userMessages.length - 1].content : "";

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          question: text,
          history: lastUserMsg
        }),
      });

      const data = await res.json();
      const isEmpty = !data.result || data.result.length === 0;
      const suggestions = data.suggestions || getRandomSuggestions();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer || "😔 Maaf, aku belum nemuin yang cocok.\nCoba pilih ini ya 👇",
          data: isEmpty
            ? suggestions.map((s) => ({ suggestion: s }))
            : data.result || [],
          type: isEmpty ? "suggestion" : data.type,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Server error, coba lagi ya." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatHarga = (harga: string) => {
    if (!harga) return "-";
    if (harga.includes("$$$")) return "Mahal";
    if (harga.includes("$$")) return "Sedang";
    if (harga.includes("$")) return "Murah";
    return harga;
  };

  const toTitleCase = (text: string) => {
    return text
      ?.toLowerCase()
      .trim()
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <>
      {/* FLOAT BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed",
          bottom: "clamp(16px, 4dvh, 24px)",
          right: "clamp(16px, 4vw, 24px)",
          zIndex: 50,
          width: "58px",
          height: "58px",
          borderRadius: "50%",
          border: "none",
          background: "linear-gradient(135deg, #c1440e 0%, #d4a84b 100%)",
          color: "#fffaf4",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 24px rgba(193,68,14,0.35)",
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.08)";
          e.currentTarget.style.boxShadow = "0 12px 32px rgba(193,68,14,0.45)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 8px 24px rgba(193,68,14,0.35)";
        }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.527 3.66 1.438 5.168L2 22l4.832-1.438A9.956 9.956 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2Z" fill="#fffaf4"/>
          <circle cx="8" cy="12" r="1.2" fill="#c1440e"/>
          <circle cx="12" cy="12" r="1.2" fill="#c1440e"/>
          <circle cx="16" cy="12" r="1.2" fill="#c1440e"/>
        </svg>
      </button>

      {/* CHAT WINDOW */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "clamp(84px, 12dvh, 96px)",
            right: "clamp(16px, 4vw, 24px)",
            width: "min(450px, calc(100vw - 32px))",
            height: "min(650px, calc(100dvh - 120px))",
            borderRadius: "22px",
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(59,31,14,0.22)",
            display: "flex",
            flexDirection: "column",
            background: "#fffaf4",
            border: "1px solid #e8d5b7",
            zIndex: 50,
          }}
        >
          {/* HEADER */}
          <div
            style={{
              padding: "16px 20px",
              background: "linear-gradient(135deg, #c1440e 0%, #d4a84b 100%)",
              color: "#fffaf4",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>🍽️ Resto Assistant</h3>
                <p style={{ margin: "2px 0 0", fontSize: 12, opacity: 0.85 }}>
                  Temukan restoran terbaik di Lombok
                </p>
              </div>
              <span
                style={{ cursor: "pointer", fontSize: 18, opacity: 0.85, lineHeight: 1 }}
                onClick={() => setOpen(false)}
              >
                ✕
              </span>
            </div>
          </div>

          {/* CHAT AREA */}
          <div
            style={{
              flex: 1,
              padding: 14,
              overflowY: "auto",
              background: "#fdf6ee",
            }}
          >
            {messages.map((m, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      background: m.role === "user"
                        ? "linear-gradient(135deg, #c1440e 0%, #d4a84b 100%)"
                        : "#fffaf4",
                      color: m.role === "user" ? "#fffaf4" : "#3b1f0e",
                      padding: "12px 14px",
                      borderRadius: 14,
                      maxWidth: "85%",
                      fontSize: 14,
                      whiteSpace: "pre-wrap",
                      border: m.role === "assistant" ? "1px solid #e8d5b7" : "none",
                      boxShadow: "0 2px 8px rgba(59,31,14,0.07)",
                    }}
                  >
                    {m.content && <div>{m.content}</div>}

                    {/* SUGGESTION */}
                    {m.role === "assistant" && m.type === "suggestion" && m.data && m.data.length > 0 && (
                      <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {m.data.map((s: any, idx: number) => (
                          <button
                            key={idx}
                            onClick={() => sendMessage(s.suggestion)}
                            style={{
                              padding: "6px 10px",
                              borderRadius: 20,
                              border: "1px solid #c1440e",
                              background: "#fdebd0",
                              color: "#9c3d0e",
                              fontSize: 12,
                              cursor: "pointer",
                              fontFamily: "inherit",
                            }}
                          >
                            💡 {s.suggestion}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* CARD RESTO */}
                    {m.role === "assistant" && m.type === "resto" && m.data && m.data.length > 0 && (
                      <div style={{ marginTop: 10 }}>
                        {m.data.map((r: any, idx: number) => (
                          <div
                            key={idx}
                            style={{
                              background: "#fffaf4",
                              border: "1px solid #e8d5b7",
                              borderRadius: 12,
                              padding: 12,
                              marginTop: 8,
                              boxShadow: "0 4px 12px rgba(59,31,14,0.08)",
                              cursor: "pointer",
                              transition: "0.2s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                            onClick={() => {
                              const query = encodeURIComponent(r.nama_resto || "restoran di lombok");
                              window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
                            }}
                          >
                            <div style={{ fontWeight: 600, fontSize: 13, color: "#3b1f0e" }}>
                              🍽️ {toTitleCase(r.nama_resto || "")}
                            </div>
                            <div style={{ fontSize: 12, color: "#9c5a1d", marginTop: 2 }}>
                              ⭐ {r.rating} {r.jumlah_review ? `(${r.jumlah_review} ulasan)` : ""} | 💰 {formatHarga(r.harga)} | 📍 {toTitleCase(r.daerah || "")}
                            </div>
                            <div style={{ fontSize: 12, color: "#7a4f2e", marginTop: 2 }}>
                              {toTitleCase(r.alamat)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* CHIP DAERAH */}
                    {m.role === "assistant" && m.type === "daerah" && m.data && m.data.length > 0 && (
                      <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {m.data.map((d: any, idx: number) => {
                          const count = d.jumlah_restoran ?? d.count ?? d.count_id;
                          return (
                            <button
                              key={idx}
                              onClick={() => sendMessage(`rekomendasi restoran di ${toTitleCase(d.daerah)}`)}
                              style={{
                                padding: "6px 10px",
                                borderRadius: 20,
                                border: "1px solid #c1440e",
                                background: "#fdebd0",
                                color: "#9c3d0e",
                                fontSize: 12,
                                cursor: "pointer",
                                fontFamily: "inherit",
                              }}
                            >
                              📍 {toTitleCase(d.daerah)} {count ? <span>— <b>{count} restoran</b></span> : null}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "flex-start" }}>
                  <div style={{
                    background: "#fffaf4",
                    padding: "12px 16px",
                    borderRadius: 14,
                    border: "1px solid #e8d5b7",
                    boxShadow: "0 2px 8px rgba(59,31,14,0.07)",
                    display: "flex",
                    alignItems: "center",
                    gap: 4
                  }}>
                    <style>{`
                      @keyframes typingBounce {
                        0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
                        40% { transform: scale(1); opacity: 1; }
                      }
                      .typing-dot {
                        width: 6px; height: 6px; background-color: #c1440e; border-radius: 50%;
                        animation: typingBounce 1.4s infinite ease-in-out both;
                      }
                      .typing-dot:nth-child(1) { animation-delay: -0.32s; }
                      .typing-dot:nth-child(2) { animation-delay: -0.16s; }
                    `}</style>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* INPUT */}
          <div
            style={{
              padding: 12,
              display: "flex",
              gap: 10,
              borderTop: "1px solid #e8d5b7",
              background: "#fffaf4",
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
              placeholder="Cari restoran, cafe, makanan..."
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 10,
                border: "1px solid #e0c9a6",
                fontSize: 16,
                background: "#fdf6ee",
                color: "#3b1f0e",
                outline: "none",
                fontFamily: "inherit",
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading}
              style={{
                padding: "10px 16px",
                borderRadius: 10,
                border: "none",
                background: "linear-gradient(135deg, #c1440e 0%, #d4a84b 100%)",
                color: "#fffaf4",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Kirim
            </button>
          </div>
        </div>
      )}
    </>
  );
}