'use client';

import { useState, useEffect, useCallback } from 'react';
import Img from 'next/image';

type Restoran = {
  nama_resto: string;
  gambar: string;
  tentang: string;
  daerah: string;
};

const toTitleCase = (text: string) =>
  text?.toLowerCase().trim().split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

export default function BannerSlider({
  restaurants,
  onSelect,
}: {
  restaurants: Restoran[];
  onSelect: (r: Restoran) => void;
}) {
  const [cur, setCur] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback((i: number) => {
    setCur((i + restaurants.length) % restaurants.length);
  }, [restaurants.length]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => goTo(cur + 1), 4500);
    return () => clearInterval(t);
  }, [cur, paused, goTo]);

  if (!restaurants.length) return null;
  const r = restaurants[cur];

  return (
    <section
    style={{
        maxWidth: '100%',   // ← full width
        margin: '0',        // ← hapus margin
        padding: '0',       // ← hapus padding
    }}
    >
    <div
        style={{
        position: 'relative',
        height: '380px',        // ← lebih tinggi biar impactful
        borderRadius: '0',      // ← hapus border radius
        overflow: 'hidden',
        cursor: 'pointer',
        }}
        onClick={() => onSelect(r)}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Gambar background */}
        {r.gambar ? (
          <Img
            src={`/ASSET/${encodeURIComponent(r.gambar)}`}
            alt={r.nama_resto}
            fill
            style={{ objectFit: 'cover', transition: 'opacity 0.5s ease' }}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #c1440e, #d4a84b)' }} />
        )}

        {/* Overlay gradient */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(30,10,0,0.88) 0%, rgba(30,10,0,0.35) 55%, rgba(30,10,0,0.05) 100%)',
        }} />

        {/* Arrow kiri */}
        <button
          onClick={(e) => { e.stopPropagation(); goTo(cur - 1); }}
          style={{
            position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.35)',
            borderRadius: '50%', width: '38px', height: '38px', cursor: 'pointer',
            color: '#fff', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 3, transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.32)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.18)')}
          aria-label="Sebelumnya"
        >
          ‹
        </button>

        {/* Arrow kanan */}
        <button
          onClick={(e) => { e.stopPropagation(); goTo(cur + 1); }}
          style={{
            position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.35)',
            borderRadius: '50%', width: '38px', height: '38px', cursor: 'pointer',
            color: '#fff', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 3, transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.32)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.18)')}
          aria-label="Berikutnya"
        >
          ›
        </button>

        {/* Teks konten */}
        <div style={{ position: 'absolute', bottom: '2rem', left: '2rem', zIndex: 2, maxWidth: '65%' }}>
          <span style={{
            display: 'inline-block', fontSize: '0.68rem', letterSpacing: '0.2em',
            textTransform: 'uppercase', color: '#f5c842',
            background: 'rgba(0,0,0,0.3)', padding: '3px 10px',
            borderRadius: '20px', marginBottom: '0.6rem',
          }}>
            ✦ Featured
          </span>
          <h2 style={{
            color: '#fff', fontSize: 'clamp(1.4rem, 3vw, 2rem)',
            fontWeight: 700, margin: '0 0 0.35rem',
            textShadow: '0 2px 16px rgba(0,0,0,0.5)',
            lineHeight: 1.2,
          }}>
            {toTitleCase(r.nama_resto)}
          </h2>
          {r.daerah && (
            <p style={{ color: 'rgba(255,230,190,0.9)', margin: '0 0 1rem', fontSize: '0.9rem' }}>
              📍 {toTitleCase(r.daerah)}
            </p>
          )}
          <span style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #c1440e, #d4a84b)',
            color: '#fff', fontSize: '0.82rem', fontWeight: 600,
            padding: '6px 16px', borderRadius: '8px',
          }}>
            Lihat detail →
          </span>
        </div>

        {/* Dots */}
        <div style={{
          position: 'absolute', bottom: '1.1rem', right: '1.5rem',
          display: 'flex', gap: '7px', zIndex: 3,
        }}>
          {restaurants.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setCur(i); }}
              style={{
                width: i === cur ? '22px' : '8px',
                height: '8px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
                background: i === cur ? '#fff' : 'rgba(255,255,255,0.4)',
                transition: 'all 0.3s ease',
                padding: 0,
              }}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}