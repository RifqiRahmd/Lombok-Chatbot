# 🍽️ Resto Assistant Chatbot - Lombok

Chatbot untuk menemukan restoran terbaik di Lombok berdasarkan data TripAdvisor.

---

## 🚀 Cara Menjalankan

### 1. Install dependencies
```bash
npm install
```

### 2. Jalankan development server
```bash
npm run dev
```

### 3. Buka di browser
```
http://localhost:3000
```

---

## 📁 Struktur Project

```
resto-chatbot/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Layout utama Next.js
│   │   ├── page.tsx            # Halaman utama
│   │   └── api/
│   │       └── chat/
│   │           └── route.ts   # ⚠️ API endpoint chatbot (perlu dikustomisasi)
│   └── components/
│       └── Chatbot.tsx         # Komponen chatbot utama
├── package.json
├── tsconfig.json
├── next.config.js
└── README.md
```

---

## ⚙️ Kustomisasi API

File yang perlu kamu ubah sesuai backend kamu:

**`src/app/api/chat/route.ts`**

Endpoint ini menerima POST request dengan body:
```json
{ "question": "rekomendasi restoran murah di Senggigi" }
```

Dan harus mengembalikan response dengan format:
```json
{
  "answer": "Berikut rekomendasinya...",
  "result": [
    {
      "nama_resto": "Nama Restoran",
      "rating": 4.5,
      "harga": "$$",
      "daerah": "Senggigi",
      "alamat": "Jl. Raya Senggigi No. 10",
      "latitude": -8.495,
      "longitude": 116.054
    }
  ],
  "type": "resto"
}
```

### Tipe response yang tersedia:
| `type`       | Keterangan                           |
|--------------|--------------------------------------|
| `resto`      | Menampilkan card list restoran       |
| `daerah`     | Menampilkan chip/tombol per daerah   |
| `suggestion` | Menampilkan tombol saran pertanyaan  |
| `statistik`  | (Custom, bisa dikembangkan sendiri)  |

---

## 🛠️ Tech Stack

- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Material UI** (untuk FAB button)
- **hugeicons-react** (untuk icon)

---

## 📝 Catatan

- Data dummy sudah disediakan di `route.ts` untuk keperluan testing
- Hubungkan ke database atau AI model kamu di file `route.ts`
- Komponen chatbot sudah siap dipakai, tinggal sesuaikan logic API-nya
