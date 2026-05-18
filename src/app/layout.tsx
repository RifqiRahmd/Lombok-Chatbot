import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resto Assistant - Temukan Restoran Terbaik di Lombok",
  description: "Chatbot untuk menemukan restoran terbaik di Lombok berdasarkan data TripAdvisor",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body style={{ margin: 0, padding: 0, fontFamily: "sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
