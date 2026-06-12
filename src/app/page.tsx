'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Chatbot from '@/components/Chatbot';
import BannerSlider from '@/components/BannerSlider'; 

type Restoran = {
  nama_resto: string;
  gambar: string;
  tentang: string;
  daerah: string;
};

export default function HomePage() {
  const [restaurants, setRestaurants] = useState<Restoran[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDaerah, setFilterDaerah] = useState('');
  const [selected, setSelected] = useState<Restoran | null>(null);

  const toTitleCase = (text: string) => {
    return text
      ?.toLowerCase()
      .trim()
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  useEffect(() => {
    fetch('/api/restaurants')
      .then((res) => res.json())
      .then((data) => { setRestaurants(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const daerahList = Array.from(
    new Set(restaurants.map((r) => r.daerah).filter((d): d is string => Boolean(d)))
  );

  const filtered = restaurants.filter((r) => {
    const matchSearch = r.nama_resto.toLowerCase().includes(search.toLowerCase());
    const matchDaerah = filterDaerah ? r.daerah === filterDaerah : true;
    return matchSearch && matchDaerah;
  });

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", minHeight: '100vh', background: '#fdf6ee' }}>

      {/* Navbar */}
      <nav
        className="nav-container"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.2rem 2.5rem',
          position: 'fixed',   // ← fixed biar selalu di atas
          top: 0,
          left: 0,
          right: 0,
          zIndex: 20,
          transition: 'background 1.0s ease, box-shadow 1.0s ease, border-color 1.0s ease',
          background: scrolled
            ? 'linear-gradient(135deg, #fffaf4 0%, #fdebd0 100%)'  
            : 'transparent', 
          boxShadow: scrolled ? '0 4px 20px rgba(59,31,14,0.08)' : 'none',          
        }}
      >
        {/* Logo */}    
        <span
          className="nav-logo"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          style={{
            fontSize: '1.2rem',
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'color 0.3s ease',            
            background: 'linear-gradient(135deg, #c1440e, #d4a84b)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          LOMBOK
        </span>

        {/* Filter & Search */}
        <div className="nav-search-container" style={{ display: 'flex', gap: '0.8rem', flex: 1, maxWidth: '750px', margin: '0 2rem' }}>
          
          <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center', width: '100%' }}>
            <input
              type="text"
              placeholder="Cari restoran..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%', padding: '0.5rem 2.5rem 0.5rem 1.2rem',
                border: '1px solid rgba(224, 201, 166, 0.5)', borderRadius: '20px',
                background: 'rgba(255, 250, 244, 0.7)', fontSize: '0.9rem', color: '#3b1f0e',
                outline: 'none', fontFamily: 'inherit', backdropFilter: 'blur(4px)',
                transition: 'background 0.3s, border-color 0.3s'
              }}
              onFocus={(e) => {
                e.currentTarget.style.background = '#fffaf4';
                e.currentTarget.style.borderColor = '#c1440e';
              }}
              onBlur={(e) => {
                e.currentTarget.style.background = 'rgba(255, 250, 244, 0.7)';
                e.currentTarget.style.borderColor = 'rgba(224, 201, 166, 0.5)';
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{
                  position: 'absolute', right: '10px',
                  background: 'transparent', border: 'none',
                  fontSize: '1rem', color: '#b5651d', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '24px', height: '24px', borderRadius: '50%',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#c1440e')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#b5651d')}
              >
                ✕
              </button>
            )}
          </div>

          <select
            value={filterDaerah}
            onChange={(e) => setFilterDaerah(e.target.value)}
            style={{
              padding: '0.5rem 2.5rem 0.5rem 1.2rem',
              border: '1px solid rgba(224, 201, 166, 0.5)', borderRadius: '20px',
              background: 'rgba(255, 250, 244, 0.7) url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%23b5651d\' d=\'M6 8L1 3h10z\'/%3E%3C/svg%3E") no-repeat right 1rem center',
              fontSize: '0.9rem', color: '#3b1f0e',
              fontFamily: 'inherit', cursor: 'pointer',
              appearance: 'none' as any, backdropFilter: 'blur(4px)',
              transition: 'background 0.3s, border-color 0.3s', minWidth: '160px'
            }}
            onFocus={(e) => {
              e.currentTarget.style.background = '#fffaf4 url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%23b5651d\' d=\'M6 8L1 3h10z\'/%3E%3C/svg%3E") no-repeat right 1rem center';
              e.currentTarget.style.borderColor = '#c1440e';
            }}
            onBlur={(e) => {
              e.currentTarget.style.background = 'rgba(255, 250, 244, 0.7) url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%23b5651d\' d=\'M6 8L1 3h10z\'/%3E%3C/svg%3E") no-repeat right 1rem center';
              e.currentTarget.style.borderColor = 'rgba(224, 201, 166, 0.5)';
            }}
          >
            <option value="">Semua Daerah</option>
            {[...daerahList].sort((a, b) => a.localeCompare(b)).map((d) => (
              <option key={d} value={d}>{toTitleCase(d)}</option>
            ))}
          </select>
        </div>

        {/* Menu */}
        <span
          className="nav-menu"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.7';
            e.currentTarget.style.background = '#f5d7b2';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.background = 'transparent';
          }}
          style={{
            fontSize: '0.9rem',
            color:'#b5651d',
            padding: '6px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'color 0.3s ease, background 0.2s', 
          }}
        >
          HOME
        </span>
      </nav>


      {/* Hero */}
      <section className="hero-section" style={{
        textAlign: 'center', padding: '5rem 2rem 2rem',
        background: 'linear-gradient(135deg, #c1440e22 0%, #d4a84b22 60%, #fdf6ee 100%)',                
      }}>
        <p style={{ fontSize: '0.8rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: '#b5651d', marginBottom: '1rem' }}>
          Welcome
        </p>
        <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', fontWeight: 700, color: '#3b1f0e', lineHeight: 1.15, margin: '0 auto 1.2rem', maxWidth: '700px' }}>
          Discover The Culinary of Lombok
        </h1>
        <p style={{ color: '#7a4f2e', fontSize: '1.05rem' }}>
          Temukan beberapa rekomendasi restoran di Pulau Lombok, Indonesia.          
        </p>
      </section>

      {/* Banner Slider — taruh di sini */}
      {!loading && restaurants.length > 0 && (
        <BannerSlider
          restaurants={restaurants.slice(0, 5)}
          onSelect={setSelected}
        />
      )}



      {/* Cards */}
      <section style={{ padding: '2rem 2.5rem 6rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 600, color: '#3b1f0e', marginBottom: '1.5rem' }}>
          Restaurants
        </h2>

        {loading ? (
          <p style={{ color: '#9c8a6e', textAlign: 'center', padding: '3rem' }}>Memuat data...</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: '#9c8a6e', textAlign: 'center', padding: '3rem' }}>Tidak ada restoran ditemukan.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {filtered.map((resto) => (
              <div
                key={resto.nama_resto}
                onClick={() => setSelected(resto)}
                style={{
                  background: '#fffaf4', borderRadius: '12px', overflow: 'hidden',
                  border: '1px solid #e8d5b7', transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(59,31,14,0.12)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ position: 'relative', width: '100%', height: '200px', background: '#f0e6d3' }}>
                  {resto.gambar && (
                    <Image
                      src={`/ASSET/${encodeURIComponent(resto.gambar)}`}
                      alt={resto.nama_resto}
                      fill
                      style={{ objectFit: 'cover' }}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  )}
                </div>
                <div style={{ padding: '1rem 1.2rem 1.2rem' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#3b1f0e', margin: '0 0 0.3rem' }}>
                    {toTitleCase(resto.nama_resto)}
                  </h3>
                  {resto.daerah && (
                    <span style={{
                      display: 'inline-block', fontSize: '0.72rem', letterSpacing: '0.1em',
                      textTransform: 'uppercase', color: '#9c5a1d',
                      background: '#fdebd0', padding: '2px 8px', borderRadius: '4px'
                    }}>
                      {toTitleCase(resto.daerah)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal Popup */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(59,31,14,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1.5rem',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fffaf4', borderRadius: '20px',
              width: '100%', maxWidth: '680px',
              overflow: 'hidden',
              boxShadow: '0 32px 80px rgba(59,31,14,0.25)',
              animation: 'popIn 0.2s ease',
            }}
          >
            <div style={{ position: 'relative', width: '100%', height: '300px', background: '#f0e6d3' }}>
              {selected.gambar && (
                <Image
                  src={`/ASSET/${encodeURIComponent(selected.gambar)}`}
                  alt={selected.nama_resto}
                  fill
                  style={{ objectFit: 'cover' }}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              )}
              <button
                onClick={() => setSelected(null)}
                style={{
                  position: 'absolute', top: '1rem', right: '1rem',
                  background: 'rgba(253,246,238,0.92)', border: 'none',
                  borderRadius: '50%', width: '36px', height: '36px',
                  fontSize: '1.1rem', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, color: '#3b1f0e',
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '1.8rem 2rem 2rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#3b1f0e', margin: 0 }}>
                  {toTitleCase(selected.nama_resto)}
                </h2>
                {selected.daerah && (
                  <span style={{
                    fontSize: '0.72rem', letterSpacing: '0.1em',
                    textTransform: 'uppercase', color: '#9c5a1d',
                    background: '#fdebd0', padding: '4px 10px',
                    borderRadius: '4px', whiteSpace: 'nowrap', marginLeft: '1rem'
                  }}>
                    {toTitleCase(selected.daerah)}
                  </span>
                )}
              </div>

              {selected.tentang && (
                <>
                  <p style={{ fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#b5651d', marginBottom: '0.5rem' }}>
                    Tentang
                  </p>
                  <p style={{ fontSize: '0.95rem', color: '#5c3317', lineHeight: 1.75, margin: 0 }}>
                    {selected.tentang}
                  </p>                  
                </>                
              )} 
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  selected.nama_resto
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  marginTop: '1.2rem',
                  padding: '0.6rem 1.2rem',
                  background: 'linear-gradient(135deg, #c1440e 0%, #d4a84b 100%)',
                  color: '#fffaf4',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                    fill="#fffaf4"
                  />
                </svg>
                Buka di Google Maps
              </a>                                         
            </div>
          </div>          
        </div>
      )}

      <Chatbot />

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
          background: linear-gradient(160deg, #fdf6ee 0%, #faf0e4 50%, #f5e6d3 100%);
          min-height: 100vh;
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        /* Responsive Navbar */
        @media (max-width: 768px) {
          .nav-container {
            flex-wrap: wrap !important;
            padding: 1rem 1.5rem !important;
            gap: 1rem !important;
          }
          .nav-logo {
            order: 1;
          }
          .nav-menu {
            order: 2;
            margin-left: auto;
          }
          .nav-search-container {
            order: 3;
            width: 100% !important;
            margin: 0 !important;
            flex-direction: column !important;
            max-width: none !important;
            flex: none !important;
          }
          .hero-section {
            padding-top: 11rem !important;
          }
        }
      `}</style>
    </main>
  );
}