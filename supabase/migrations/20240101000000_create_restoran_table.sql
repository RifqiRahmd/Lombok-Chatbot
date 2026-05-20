-- ============================================================
-- Migration: Create restoran table
-- Created: 2024-01-01
-- Description: Restaurant/cafe data for Lombok Chatbot
-- ============================================================

-- Create the restoran table
CREATE TABLE IF NOT EXISTS public.restoran (
  id              INTEGER PRIMARY KEY,
  nama_resto      TEXT,
  rating          NUMERIC,
  jumlah_review   INTEGER,
  harga           TEXT,          -- e.g. '$', '$$', '$$$', 'not available'
  tipe_makanan    TEXT,          -- comma-separated cuisine types
  alamat          TEXT,
  nomor_telepon   TEXT,
  longitude       TEXT,
  latitude        TEXT,
  daerah          TEXT,          -- area/region in Lombok
  jenis_tempat    TEXT,          -- e.g. 'restoran', 'cafe', 'bar', 'oleh oleh'
  gambar          VARCHAR(255),  -- image filename
  tentang         TEXT,          -- description/about
  review1         TEXT,
  review2         TEXT
);

-- ============================================================
-- Indexes for common query patterns
-- ============================================================

-- Filter by area (daerah) — most common chatbot filter
CREATE INDEX IF NOT EXISTS idx_restoran_daerah
  ON public.restoran (daerah);

-- Filter by place type (jenis_tempat)
CREATE INDEX IF NOT EXISTS idx_restoran_jenis_tempat
  ON public.restoran (jenis_tempat);

-- Sort/filter by rating
CREATE INDEX IF NOT EXISTS idx_restoran_rating
  ON public.restoran (rating DESC);

-- Full-text search on name, cuisine, address
CREATE INDEX IF NOT EXISTS idx_restoran_fts
  ON public.restoran
  USING GIN (
    to_tsvector(
      'indonesian',
      COALESCE(nama_resto, '') || ' ' ||
      COALESCE(tipe_makanan, '') || ' ' ||
      COALESCE(daerah, '') || ' ' ||
      COALESCE(jenis_tempat, '') || ' ' ||
      COALESCE(alamat, '')
    )
  );

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

-- Enable RLS (required by Supabase)
ALTER TABLE public.restoran ENABLE ROW LEVEL SECURITY;

-- Allow public read access (the chatbot is read-only for anonymous users)
CREATE POLICY "Allow public read access"
  ON public.restoran
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only authenticated service role can insert/update/delete
CREATE POLICY "Allow service role full access"
  ON public.restoran
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- Comments for documentation
-- ============================================================

COMMENT ON TABLE public.restoran IS
  'Daftar restoran, kafe, dan tempat makan di Lombok untuk chatbot rekomendasi';

COMMENT ON COLUMN public.restoran.harga IS
  'Indikator harga: $ (murah), $$ (menengah), $$$ (mahal), not available (tidak diketahui)';

COMMENT ON COLUMN public.restoran.daerah IS
  'Wilayah di Lombok: gili trawangan, gili air, senggigi, mataram, kuta, dll.';

COMMENT ON COLUMN public.restoran.jenis_tempat IS
  'Jenis tempat: restoran, cafe, bar, oleh oleh, restoran seafood, dll.';

COMMENT ON COLUMN public.restoran.gambar IS
  'Nama file gambar (tanpa path). Path lengkap disesuaikan di aplikasi.';
