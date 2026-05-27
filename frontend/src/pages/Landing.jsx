import React from 'react';
import { useApp } from '../App';

export default function Landing() {
  const { loginDemo, theme, setTheme } = useApp();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      padding: '0 24px'
    }}>
      {/* Decorative Aura Ambient Glow Blobs */}
      <div className="ambient-glow" style={{
        width: '550px',
        height: '550px',
        background: 'radial-gradient(circle, hsla(var(--primary-glow), 0.15) 0%, transparent 70%)',
        top: '-150px',
        left: '-150px',
      }} />
      <div className="ambient-glow" style={{
        width: '650px',
        height: '650px',
        background: 'radial-gradient(circle, hsla(var(--accent-cyan), 0.1) 0%, transparent 70%)',
        bottom: '-200px',
        right: '-150px',
      }} />

      {/* Floating Header */}
      <header className="glass-panel" style={{
        maxWidth: '1200px',
        width: '100%',
        margin: '24px auto 0 auto',
        padding: '14px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10,
        borderRadius: '16px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.05)'
      }}>
        {/* Logo Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.8rem', animation: 'float 3.5s ease-in-out infinite' }}>🤖</span>
          <span className="font-display" style={{
            fontSize: '1.25rem',
            fontWeight: '800',
            background: 'linear-gradient(135deg, hsl(var(--primary-glow)) 0%, hsl(var(--accent-cyan)) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em'
          }}>
            PANDU LOGGER
          </span>
        </div>

        {/* Small Landing Theme Toggler */}
        <div style={{ display: 'flex', gap: '4px', backgroundColor: 'hsla(var(--border-glass), 0.15)', padding: '2px', borderRadius: '10px', border: '1px solid hsl(var(--border-glass))' }}>
          <button 
            onClick={() => setTheme('system')}
            style={{
              background: theme === 'system' ? 'hsl(var(--panel-glass))' : 'transparent',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.78rem',
              fontWeight: '600',
              color: theme === 'system' ? 'hsl(var(--primary-glow))' : 'hsl(var(--text-secondary))',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            💻 <span style={{ display: window.innerWidth > 480 ? 'inline' : 'none' }}>Sistem</span>
          </button>
          <button 
            onClick={() => setTheme('light')}
            style={{
              background: theme === 'light' ? 'hsl(var(--panel-glass))' : 'transparent',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.78rem',
              fontWeight: '600',
              color: theme === 'light' ? 'hsl(var(--primary-glow))' : 'hsl(var(--text-secondary))',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            ☀️ <span style={{ display: window.innerWidth > 480 ? 'inline' : 'none' }}>Terang</span>
          </button>
          <button 
            onClick={() => setTheme('dark')}
            style={{
              background: theme === 'dark' ? 'hsl(var(--panel-glass))' : 'transparent',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.78rem',
              fontWeight: '600',
              color: theme === 'dark' ? 'hsl(var(--primary-glow))' : 'hsl(var(--text-secondary))',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            🌙 <span style={{ display: window.innerWidth > 480 ? 'inline' : 'none' }}>Gelap</span>
          </button>
        </div>
      </header>

      {/* Hero Body Content */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: '1000px',
        width: '100%',
        margin: '0 auto',
        padding: '60px 0',
        zIndex: 2,
        textAlign: 'center',
        gap: '48px'
      }}>
        {/* Hero Title & Subtext */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
          <div className="glass-panel" style={{
            padding: '8px 18px',
            borderRadius: '99px',
            fontSize: '0.8rem',
            fontWeight: '600',
            color: 'hsl(var(--primary-glow))',
            border: '1px solid hsla(var(--primary-glow), 0.25)',
            background: 'hsla(var(--primary-glow), 0.05)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
          }}>
            ✨ Premium Discord Analytics & Security
          </div>
          
          <h1 style={{
            fontSize: window.innerWidth > 768 ? '4rem' : '2.8rem',
            fontWeight: '800',
            lineHeight: '1.15',
            letterSpacing: '-0.03em',
            maxWidth: '850px',
            background: 'linear-gradient(135deg, hsl(var(--text-primary)) 20%, hsl(var(--primary-glow)) 65%, hsl(var(--accent-cyan)) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Kelola & Analisis Aktivitas Server Discord Anda secara Real-Time
          </h1>

          <p style={{
            color: 'hsl(var(--text-secondary))',
            fontSize: window.innerWidth > 768 ? '1.25rem' : '1.05rem',
            maxWidth: '650px',
            margin: '0 auto',
            lineHeight: '1.6',
            fontWeight: '400'
          }}>
            Bot logging tercanggih dengan pelacakan voice channel, grafik statistik bermain game favorit anggota, sistem welcome otomatis, serta papan peringkat pencapaian.
          </p>
        </div>

        {/* Action Button Controls */}
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <a href="/api/auth/login" style={{ textDecoration: 'none' }}>
            <button className="btn-primary" style={{ padding: '16px 36px', fontSize: '1.02rem', borderRadius: '12px' }}>
              <span style={{ fontSize: '1.2rem' }}>🔌</span> Hubungkan ke Discord
            </button>
          </a>
          
          <button 
            className="btn-secondary" 
            onClick={loginDemo} 
            style={{ padding: '16px 36px', fontSize: '1.02rem', borderRadius: '12px' }}
          >
            <span style={{ fontSize: '1.2rem' }}>🧪</span> Coba Mode Demo (Bypass)
          </button>
        </div>

        {/* Features Card Showcase */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: '30px',
          width: '100%',
          marginTop: '24px',
          borderTop: '1px solid hsl(var(--border-glass))',
          paddingTop: '50px'
        }}>
          {/* Card 1 */}
          <div className="glass-panel" style={{
            padding: '30px 24px',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            position: 'relative'
          }}>
            <div style={{
              fontSize: '2rem',
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              backgroundColor: 'hsla(var(--danger-crimson), 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid hsla(var(--danger-crimson), 0.2)'
            }}>
              📝
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: 'hsl(var(--text-primary))', fontWeight: '700' }}>Log Moderasi & Keamanan</h3>
              <p style={{ marginTop: '8px', fontSize: '0.9rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.5' }}>
                Pantau pemblokiran (ban), pengeluaran (kick), timeout, pesan terhapus (beserta isi aslinya), serta perubahan struktural saluran langsung secara real-time.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-panel" style={{
            padding: '30px 24px',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            position: 'relative'
          }}>
            <div style={{
              fontSize: '2rem',
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              backgroundColor: 'hsla(var(--accent-cyan), 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid hsla(var(--accent-cyan), 0.2)'
            }}>
              🎙️
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: 'hsl(var(--text-primary))', fontWeight: '700' }}>Analisis Voice & Gaming</h3>
              <p style={{ marginTop: '8px', fontSize: '0.9rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.5' }}>
                Kumpulkan data durasi sesi voice channel anggota serta log waktu kumulatif saat mereka memainkan game-game terpopuler di server Anda.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass-panel" style={{
            padding: '30px 24px',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            position: 'relative'
          }}>
            <div style={{
              fontSize: '2rem',
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              backgroundColor: 'hsla(var(--success-emerald), 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid hsla(var(--success-emerald), 0.2)'
            }}>
              🏆
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: 'hsl(var(--text-primary))', fontWeight: '700' }}>Lencana Pencapaian Otomatis</h3>
              <p style={{ marginTop: '8px', fontSize: '0.9rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.5' }}>
                Sistem memberikan penghargaan lencana secara otomatis saat anggota aktif mengobrol atau streaming game di waktu-waktu khusus (seperti dini hari).
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Clean Modern Footer */}
      <footer style={{
        margin: '40px auto 24px auto',
        textAlign: 'center',
        color: 'hsl(var(--text-muted))',
        fontSize: '0.85rem',
        zIndex: 2,
        maxWidth: '1200px',
        width: '100%',
        borderTop: '1px solid hsl(var(--border-glass))',
        paddingTop: '20px'
      }}>
        Dibuat secara profesional untuk paired programming • © 2026 Antigravity Bot Logger
      </footer>

      {/* Floating floating keyframes style */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}} />
    </div>
  );
}
