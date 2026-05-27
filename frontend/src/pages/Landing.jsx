import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../App';
import { Link } from 'react-router-dom';

/* ──────────────────────────────────────
   Hook: Intersection Observer scroll reveal
   ────────────────────────────────────── */
function useScrollReveal() {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    const targets = root.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return ref;
}

/* ──────────────────────────────────────
   Component: Subtle particle field
   ────────────────────────────────────── */
function ParticleField({ count = 14 }) {
  const particles = useRef(
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      bottom: `${-(Math.random() * 20)}%`,
      size: 1.5 + Math.random() * 1.5,
      duration: 14 + Math.random() * 18,
      delay: Math.random() * 12,
      opacity: 0.15 + Math.random() * 0.25,
    }))
  ).current;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            bottom: p.bottom,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ──────────────────────────────────────
   Main Landing Component
   ────────────────────────────────────── */
export default function Landing() {
  const { user, logout, selectedGuild, theme, setTheme } = useApp();
  const [showDropdown, setShowDropdown] = useState(false);
  const scrollRef = useScrollReveal();

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showDropdown) return;
    const handler = () => setShowDropdown(false);
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [showDropdown]);

  return (
    <div
      ref={scrollRef}
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        padding: '0 24px',
      }}
    >
      {/* Particle field background */}
      <ParticleField />

      {/* Decorative Aura Ambient Glow Blobs — now with pulse */}
      <div className="ambient-glow glow-pulse" style={{
        width: '550px',
        height: '550px',
        background: 'radial-gradient(circle, hsla(var(--primary-glow), 0.12) 0%, transparent 70%)',
        top: '-150px',
        left: '-150px',
      }} />
      <div className="ambient-glow glow-pulse-alt" style={{
        width: '650px',
        height: '650px',
        background: 'radial-gradient(circle, hsla(var(--accent-cyan), 0.08) 0%, transparent 70%)',
        bottom: '-200px',
        right: '-150px',
      }} />

      {/* ═══ Floating Header ═══ */}
      <header className="glass-panel hero-entrance hero-entrance-d1" style={{
        maxWidth: '1200px',
        width: '100%',
        margin: '24px auto 0 auto',
        padding: '14px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10,
        borderRadius: '16px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.03)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'hsl(var(--primary-glow))' }}>
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <span className="font-display shimmer-text" style={{
            fontSize: '1.2rem',
            fontWeight: '900',
            background: 'linear-gradient(135deg, hsl(var(--primary-glow)) 0%, hsl(var(--accent-cyan)) 50%, hsl(var(--primary-glow)) 100%)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
          }}>
            PANDU DISCORD BOT
          </span>
        </div>

        {/* Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Theme Toggler */}
          <button 
            onClick={() => {
              if (theme === 'system') setTheme('light');
              else if (theme === 'light') setTheme('dark');
              else setTheme('system');
            }}
            style={{
              background: 'hsla(var(--border-glass), 0.1)',
              border: '1px solid hsl(var(--border-glass))',
              cursor: 'pointer',
              color: 'hsl(var(--text-primary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              borderRadius: '12px',
              transition: 'all 0.2s ease',
              lineHeight: 1,
            }}
            className="sidebar-link-hover"
            title={`Tema saat ini: ${theme === 'system' ? 'Sistem' : theme === 'light' ? 'Terang' : 'Gelap'}`}
          >
            {theme === 'system' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.4s ease' }}>
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            ) : theme === 'light' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.4s ease' }}>
                <circle cx="12" cy="12" r="5" fill="currentColor"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.4s ease' }}>
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>

          {/* Auth */}
          {user ? (
            <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
              <div 
                onClick={() => setShowDropdown(!showDropdown)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  padding: '6px 14px',
                  borderRadius: '12px',
                  border: '1px solid hsl(var(--border-glass))',
                  backgroundColor: 'hsla(var(--border-glass), 0.1)',
                  transition: 'all 0.2s ease',
                  userSelect: 'none',
                }}
                className="sidebar-link-hover"
              >
                {user.avatar ? (
                  <img 
                    src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`} 
                    alt={user.username}
                    style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ 
                    width: '26px', height: '26px', borderRadius: '50%', 
                    backgroundColor: 'hsl(var(--primary-glow))', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    fontSize: '0.8rem', fontWeight: 'bold' 
                  }}>
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <span style={{ fontSize: '0.88rem', fontWeight: '600', color: 'hsl(var(--text-primary))' }}>
                  {user.username}
                </span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  style={{ color: 'hsl(var(--text-muted))', transform: showDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}
                >
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>

              {showDropdown && (
                <div 
                  className="glass-panel"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '180px',
                    padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    zIndex: 1000,
                    boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                    borderRadius: '12px',
                  }}
                >
                  <Link 
                    to={selectedGuild ? "/dashboard" : "/select-server"} 
                    onClick={() => setShowDropdown(false)}
                    style={{
                      textDecoration: 'none',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      color: 'hsl(var(--text-primary))',
                      fontSize: '0.88rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s ease',
                    }}
                    className="sidebar-link-hover"
                  >
                    Dashboard
                  </Link>
                  <button 
                    onClick={() => {
                      logout();
                      setShowDropdown(false);
                    }}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      color: 'hsl(var(--danger-crimson))',
                      fontSize: '0.88rem',
                      fontWeight: '600',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: '100%',
                      transition: 'all 0.2s ease',
                    }}
                    className="sidebar-link-hover"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <a 
              href="/api/auth/login" 
              style={{
                textDecoration: 'none',
                fontSize: '0.88rem',
                fontWeight: '700',
                color: 'hsl(var(--primary-glow))',
                padding: '8px 18px',
                borderRadius: '10px',
                border: '1px solid hsla(var(--primary-glow), 0.35)',
                backgroundColor: 'hsla(var(--primary-glow), 0.04)',
                transition: 'all 0.22s ease',
              }}
              className="sidebar-link-hover"
            >
              Login with Discord
            </a>
          )}
        </div>
      </header>

      {/* ═══ Hero Body ═══ */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: '1000px',
        width: '100%',
        margin: '0 auto',
        padding: '80px 0',
        zIndex: 2,
        textAlign: 'center',
        gap: '60px',
      }}>
        {/* ── Hero Title & Subtext ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
          {/* Badge pill */}
          <div className="glass-panel hero-entrance hero-entrance-d2" style={{
            padding: '8px 20px',
            borderRadius: '99px',
            fontSize: '0.78rem',
            fontWeight: '700',
            color: 'hsl(var(--primary-glow))',
            border: '1px solid hsla(var(--primary-glow), 0.22)',
            background: 'hsla(var(--primary-glow), 0.04)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '6px',
          }}>
            Premium Discord Analytics & Security
          </div>
          
          {/* Main headline with shimmer */}
          <h1 className="hero-entrance hero-entrance-d3 shimmer-text" style={{
            fontSize: window.innerWidth > 768 ? '4.2rem' : '2.8rem',
            fontWeight: '850',
            lineHeight: '1.15',
            letterSpacing: '-0.03em',
            maxWidth: '850px',
            background: 'linear-gradient(135deg, hsl(var(--text-primary)) 20%, hsl(var(--primary-glow)) 50%, hsl(var(--accent-cyan)) 80%, hsl(var(--text-primary)) 100%)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Kelola & Analisis Aktivitas Server Discord Anda secara Real-Time
          </h1>

          {/* Subtitle */}
          <p className="hero-entrance hero-entrance-d4" style={{
            color: 'hsl(var(--text-secondary))',
            fontSize: window.innerWidth > 768 ? '1.25rem' : '1.05rem',
            maxWidth: '680px',
            margin: '0 auto',
            lineHeight: '1.65',
            fontWeight: '400',
          }}>
            Bot logging tercanggih dengan pelacakan voice channel, grafik statistik bermain game favorit anggota, sistem welcome otomatis, serta papan peringkat pencapaian.
          </p>
        </div>

        {/* ── CTA Button ── */}
        <div className="hero-entrance hero-entrance-d5" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {user ? (
            <Link to="/select-server" style={{ textDecoration: 'none' }}>
              <button className="btn-primary cta-glow" style={{ padding: '16px 40px', fontSize: '1.02rem', borderRadius: '12px' }}>
                Buka Dashboard Server
              </button>
            </Link>
          ) : (
            <a href="/api/auth/login" style={{ textDecoration: 'none' }}>
              <button className="btn-primary cta-glow" style={{ padding: '16px 45px', fontSize: '1.05rem', borderRadius: '12px', letterSpacing: '0.02em' }}>
                Let's Join With Us
              </button>
            </a>
          )}
        </div>

        {/* ═══ FEATURES SECTION ═══ */}
        <div className="border-reveal" style={{
          width: '100%',
          marginTop: '60px',
          paddingTop: '60px',
          display: 'flex',
          flexDirection: 'column',
          gap: '80px',
          textAlign: 'left',
        }}>
          
          {/* ── Feature 1: AI Integration ── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth > 768 ? '1fr 1fr' : '1fr',
            gap: '40px',
            alignItems: 'center',
          }}>
            <div className="reveal-left" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <span style={{
                fontSize: '0.78rem',
                fontWeight: '700',
                color: 'hsl(var(--accent-cyan))',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}>
                Brain Integration
              </span>
              <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'hsl(var(--text-primary))', lineHeight: '1.2' }}>
                Otak Kecerdasan Buatan Cerdas (DeepSeek AI)
              </h2>
              <p style={{ color: 'hsl(var(--text-secondary))', lineHeight: '1.6', fontSize: '0.98rem' }}>
                Pandu dilengkapi dengan modul integrasi kecerdasan buatan (AI) terkemuka dari DeepSeek. Ini bukan sekadar bot pencatat, melainkan asisten pintar yang siap merespons percakapan, membantu memberikan analisis log, dan menjawab pertanyaan kompleks anggota server.
              </p>
              
              <div className="reveal" style={{
                transitionDelay: '0.15s',
                backgroundColor: 'hsla(var(--border-glass), 0.1)',
                border: '1px solid hsl(var(--border-glass))',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'hsl(var(--text-primary))' }}>Cara Menggunakan & Konfigurasi:</span>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', padding: 0, fontSize: '0.88rem', color: 'hsl(var(--text-secondary))' }}>
                  <li style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <span style={{ color: 'hsl(var(--primary-glow))' }}>•</span>
                    <span><strong>Interaksi Chat</strong>: Cukup mention <code>@Pandu Bot</code> di saluran teks mana saja, bot akan merespons menggunakan konteks AI.</span>
                  </li>
                  <li style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <span style={{ color: 'hsl(var(--primary-glow))' }}>•</span>
                    <span><strong>Pilihan Model</strong>: Pilih <code>deepseek-chat</code> di dashboard untuk balasan instan/ringan, atau <code>deepseek-reasoner</code> untuk analisis mendalam dengan proses penalaran matematis/pemrograman.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="reveal-right gentle-float" style={{
              transitionDelay: '0.2s',
            }}>
              <div className="glass-panel" style={{
                padding: '30px',
                borderRadius: '20px',
                backgroundColor: 'hsla(var(--border-glass), 0.08)',
                border: '1px solid hsl(var(--border-glass))',
              }}>
                <span style={{ fontSize: '0.72rem', color: 'hsl(var(--text-muted))', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '16px' }}>Simulasi Respon AI (Reasoner)</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '0.82rem', color: 'hsl(var(--text-muted))', fontWeight: '600' }}>Pengguna:</span>
                    <div style={{ backgroundColor: 'hsla(var(--border-glass), 0.15)', padding: '10px 14px', borderRadius: '10px 10px 10px 0', fontSize: '0.88rem', color: 'hsl(var(--text-primary))' }}>
                      @Pandu Bot tolong buatkan fungsi javascript fibonacci yang cepat.
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '0.82rem', color: 'hsl(var(--primary-glow))', fontWeight: '700' }}>Pandu Bot (AI DeepSeek):</span>
                    <div style={{ backgroundColor: 'hsla(var(--primary-glow), 0.04)', border: '1px solid hsla(var(--primary-glow), 0.15)', padding: '14px', borderRadius: '10px 10px 0 10px', fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.5' }}>
                      <div style={{ fontStyle: 'italic', fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginBottom: '8px' }}>Menggunakan proses berpikir mendalam (deepseek-reasoner)...</div>
                      Tentu! Menggunakan memoization untuk performa O(N):
                      <pre style={{ fontFamily: 'monospace', backgroundColor: 'rgba(0,0,0,0.15)', padding: '8px', borderRadius: '6px', marginTop: '6px', fontSize: '0.78rem', color: 'hsl(var(--accent-cyan))' }}>
{`const fib = (n, memo = {}) => {
  if (n in memo) return memo[n];
  if (n <= 2) return 1;
  return memo[n] = fib(n - 1, memo) + fib(n - 2, memo);
};`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Feature 2: Moderation & Security ── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth > 768 ? '1fr 1fr' : '1fr',
            gap: '40px',
            alignItems: 'center',
          }}>
            {/* Simulation on left */}
            <div className="reveal-left gentle-float-alt" style={{
              order: window.innerWidth > 768 ? 0 : 1,
            }}>
              <div className="glass-panel" style={{
                padding: '30px',
                borderRadius: '20px',
                backgroundColor: 'hsla(var(--border-glass), 0.08)',
                border: '1px solid hsl(var(--border-glass))',
              }}>
                <span style={{ fontSize: '0.72rem', color: 'hsl(var(--text-muted))', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '16px' }}>Simulasi Log Moderasi</span>
                <div style={{
                  backgroundColor: '#2b2d31',
                  borderRadius: '8px',
                  padding: '16px',
                  borderLeft: '4px solid hsl(var(--danger-crimson))',
                  fontFamily: 'sans-serif',
                  fontSize: '0.85rem',
                  color: '#dbdee1',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
                    Pesan Dihapus
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }}>
                    <div><strong>Pengirim:</strong> <span style={{ color: '#5865f2', backgroundColor: 'rgba(88, 101, 242, 0.15)', padding: '0 4px', borderRadius: '3px' }}>@dipa</span></div>
                    <div><strong>Saluran:</strong> <span style={{ color: '#5865f2', backgroundColor: 'rgba(88, 101, 242, 0.15)', padding: '0 4px', borderRadius: '3px' }}>#umum</span></div>
                    <div><strong>Isi Pesan Asli:</strong> Harap tidak mengirimkan link eksternal sembarangan di sini.</div>
                  </div>
                  <div style={{ marginTop: '12px', fontSize: '0.7rem', color: '#949ba4', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>
                    dipa: 333105200942546946 | #umum: 1486233076160925881 • Hari ini pukul 14:10
                  </div>
                </div>
              </div>
            </div>

            <div className="reveal-right" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <span style={{
                fontSize: '0.78rem',
                fontWeight: '700',
                color: 'hsl(var(--danger-crimson))',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}>
                Security & Protection
              </span>
              <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'hsl(var(--text-primary))', lineHeight: '1.2' }}>
                Log Moderasi & Keamanan Real-Time
              </h2>
              <p style={{ color: 'hsl(var(--text-secondary))', lineHeight: '1.6', fontSize: '0.98rem' }}>
                Lindungi integritas server Anda dari spammer atau penyusup dengan pemantauan aktivitas audit secara instan. Pandu menangkap setiap aksi penting dan mencatatnya ke basis data serta saluran log pilihan Anda.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', color: 'hsl(var(--text-secondary))' }}>
                {[
                  { label: 'Aktivitas Moderasi', desc: 'Mencatat hukuman ban, unban, kick, and pemberian/penghapusan timeout lengkap dengan nama moderator dan alasannya.' },
                  { label: 'Aktivitas Konten', desc: 'Menyimpan isi asli dari pesan teks yang terhapus (beserta lampirannya) dan melacak suntingan pesan (perbandingan teks sebelum & sesudah diedit).' },
                  { label: 'Struktur Server', desc: 'Melacak pembuatan atau penghapusan saluran (channels) teks/voice, peran (roles), dan emoji kustom.' },
                ].map((item, i) => (
                  <div key={i} className="reveal" style={{ transitionDelay: `${0.1 + i * 0.1}s`, display: 'flex', gap: '10px' }}>
                    <span style={{ color: 'hsl(var(--danger-crimson))' }}>✓</span>
                    <span><strong>{item.label}</strong>: {item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Feature 3: Voice & Gaming Analytics ── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth > 768 ? '1fr 1fr' : '1fr',
            gap: '40px',
            alignItems: 'center',
          }}>
            <div className="reveal-left" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <span style={{
                fontSize: '0.78rem',
                fontWeight: '700',
                color: 'hsl(var(--primary-glow))',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}>
                Engagement Analytics
              </span>
              <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'hsl(var(--text-primary))', lineHeight: '1.2' }}>
                Analisis Keaktifan Voice & Jam Bermain Game
              </h2>
              <p style={{ color: 'hsl(var(--text-secondary))', lineHeight: '1.6', fontSize: '0.98rem' }}>
                Ketahui apa saja aktivitas populer anggota komunitas Anda. Pandu mencatat akumulasi waktu bermain game favorit mereka secara otomatis, merekam durasi sesi saat masuk voice channel, hingga melacak lagu Spotify yang sering mereka putar.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem', color: 'hsl(var(--text-secondary))' }}>
                {[
                  { label: 'Pelacakan Game', desc: 'Mendeteksi aktivitas game terintegrasi (seperti Valorant, Minecraft, League of Legends) lalu memetakan diagram kepopuleran di dashboard.' },
                  { label: 'Sesi Voice', desc: 'Menghitung total durasi voice dan mengidentifikasi anggota server yang paling aktif mengobrol atau melakukan streaming layar.' },
                ].map((item, i) => (
                  <div key={i} className="reveal" style={{ transitionDelay: `${0.1 + i * 0.1}s`, display: 'flex', gap: '10px' }}>
                    <span style={{ color: 'hsl(var(--primary-glow))' }}>▶</span>
                    <span><strong>{item.label}</strong>: {item.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="reveal-right gentle-float" style={{ transitionDelay: '0.15s' }}>
              <div className="glass-panel" style={{
                padding: '30px',
                borderRadius: '20px',
                backgroundColor: 'hsla(var(--border-glass), 0.08)',
                border: '1px solid hsl(var(--border-glass))',
              }}>
                <span style={{ fontSize: '0.72rem', color: 'hsl(var(--text-muted))', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '16px' }}>Simulasi Visual Statistik</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[
                    { name: 'Valorant', hours: '148.5 jam', pct: '85%' },
                    { name: 'Minecraft', hours: '94.2 jam', pct: '55%' },
                  ].map((game, i) => (
                    <div key={i} className="reveal" style={{ transitionDelay: `${0.3 + i * 0.15}s`, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: '600' }}>
                        <span style={{ color: 'hsl(var(--text-primary))' }}>{game.name}</span>
                        <span style={{ color: 'hsl(var(--accent-cyan))', fontFamily: 'monospace' }}>{game.hours}</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', borderRadius: '10px', backgroundColor: 'hsla(var(--border-glass), 0.3)', overflow: 'hidden' }}>
                        <div className="chart-bar-fill" style={{ width: game.pct }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Feature 4: Achievements Badges ── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: window.innerWidth > 768 ? '1fr 1fr' : '1fr',
            gap: '40px',
            alignItems: 'center',
          }}>
            {/* Badge grid on left */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              order: window.innerWidth > 768 ? 0 : 1,
            }}>
              {[
                { emoji: '💬', title: 'First Word', desc: 'Kirim pesan pertama', delay: '0s' },
                { emoji: '🦉', title: 'Night Owl', desc: 'Voice jam 2 - 5 dini hari', delay: '0.1s' },
                { emoji: '🔥', title: 'Hardcore', desc: '10 jam main satu game', delay: '0.2s' },
                { emoji: '👑', title: 'Voice Deity', desc: '100 jam di voice channel', delay: '0.3s' },
              ].map((badge, i) => (
                <div key={i} className="glass-panel reveal-scale" style={{ transitionDelay: badge.delay, padding: '16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.5rem' }}>{badge.emoji}</span>
                  <div>
                    <h4 style={{ fontSize: '0.82rem', color: 'hsl(var(--text-primary))', fontWeight: '700' }}>{badge.title}</h4>
                    <span style={{ fontSize: '0.68rem', color: 'hsl(var(--text-muted))' }}>{badge.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="reveal-right" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <span style={{
                fontSize: '0.78rem',
                fontWeight: '700',
                color: 'hsl(var(--success-emerald))',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}>
                Gamification System
              </span>
              <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'hsl(var(--text-primary))', lineHeight: '1.2' }}>
                Sistem Lencana & Achievements Server Otomatis
              </h2>
              <p style={{ color: 'hsl(var(--text-secondary))', lineHeight: '1.6', fontSize: '0.98rem' }}>
                Tambahkan kegembiraan ekstra di server Anda! Pandu secara otomatis memberikan penghargaan lencana khusus (Achievements) kepada anggota berdasarkan tonggak aktivitas keaktifan chat, voice, atau bermain game mereka.
              </p>
              <p style={{ color: 'hsl(var(--text-secondary))', lineHeight: '1.6', fontSize: '0.95rem' }}>
                Ketika anggota berhasil membuka pencapaian baru, bot akan secara cerdas memposting pengumuman premium yang terformat indah di saluran yang ditentukan, mendorong keterlibatan dan interaksi sosial yang sehat.
              </p>
            </div>
          </div>

        </div>
      </main>

      {/* ═══ Footer ═══ */}
      <footer className="reveal" style={{
        margin: '40px auto 24px auto',
        textAlign: 'center',
        color: 'hsl(var(--text-muted))',
        fontSize: '0.85rem',
        zIndex: 2,
        maxWidth: '1200px',
        width: '100%',
        borderTop: '1px solid hsl(var(--border-glass))',
        paddingTop: '20px',
        fontWeight: '600',
      }}>
        © 2026 Pandu Bot
      </footer>
    </div>
  );
}
