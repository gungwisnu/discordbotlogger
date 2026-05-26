import React from 'react';
import { useApp } from '../App';

export default function Landing() {
  const { loginDemo } = useApp();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative Nebula Glowing Circles */}
      <div className="glow-ambient" style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, hsla(var(--primary-glow), 0.15) 0%, transparent 70%)',
        top: '-10%',
        left: '-10%',
        pointerEvents: 'none'
      }} />
      <div className="glow-ambient" style={{
        position: 'absolute',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, hsla(var(--secondary-glow), 0.12) 0%, transparent 70%)',
        bottom: '-15%',
        right: '-10%',
        pointerEvents: 'none'
      }} />

      {/* Main Core Container */}
      <div className="glass-panel" style={{
        maxWidth: '900px',
        width: '100%',
        padding: '60px 40px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '40px'
      }}>
        {/* Title Logo Group */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            fontSize: '4.5rem',
            animation: 'float 4s ease-in-out infinite'
          }}>🤖</div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '3.5rem',
            background: 'linear-gradient(135deg, white 30%, hsl(var(--text-secondary)) 60%, hsl(var(--primary-glow)) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.03em',
            lineHeight: '1.1'
          }}>
            PANDU LOGGER & ANALYTICS
          </h1>
          <p style={{
            color: 'hsl(var(--text-secondary))',
            fontSize: '1.2rem',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6',
            fontWeight: '300'
          }}>
            Bot Logging multifungsi premium dengan pelacakan aktivitas bermain game yang terperinci, grafik analisis Voice, server wrapped, serta lencana pencapaian.
          </p>
        </div>

        {/* Call to Actions Buttons */}
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <a href="/api/auth/login" style={{ textDecoration: 'none' }}>
            <button className="btn-primary" style={{ fontSize: '1.05rem', padding: '16px 36px' }}>
              🔌 Hubungkan ke Discord
            </button>
          </a>
          <button 
            className="btn-secondary" 
            onClick={loginDemo} 
            style={{ fontSize: '1.05rem', padding: '16px 36px' }}
          >
            🧪 Coba Mode Demo (Tanpa Login)
          </button>
        </div>

        {/* Bullet features grid showcases */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '24px',
          width: '100%',
          marginTop: '20px',
          borderTop: '1px solid hsl(var(--border-glass))',
          paddingTop: '40px'
        }}>
          {/* Card 1 */}
          <div className="glass-panel" style={{ padding: '24px', textAlign: 'left', background: 'rgba(255, 255, 255, 0.02)' }}>
            <span style={{ fontSize: '2rem' }}>📝</span>
            <h3 style={{ marginTop: '12px', fontSize: '1.2rem', color: 'white' }}>Log Moderasi & Keamanan</h3>
            <p style={{ marginTop: '8px', fontSize: '0.88rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.5' }}>
              Pantau pemblokiran (ban), pengeluaran (kick), timeout, pesan dihapus, serta pengeditan saluran langsung dari Audit Logs Discord secara real-time.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel" style={{ padding: '24px', textAlign: 'left', background: 'rgba(255, 255, 255, 0.02)' }}>
            <span style={{ fontSize: '2rem' }}>🎙️</span>
            <h3 style={{ marginTop: '12px', fontSize: '1.2rem', color: 'white' }}>Analisis Voice & Game</h3>
            <p style={{ marginTop: '8px', fontSize: '0.88rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.5' }}>
              Catat durasi aktivitas anggota di Voice Channel serta akumulasi waktu bermain game favorit di server Anda.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel" style={{ padding: '24px', textAlign: 'left', background: 'rgba(255, 255, 255, 0.02)' }}>
            <span style={{ fontSize: '2rem' }}>🏆</span>
            <h3 style={{ marginTop: '12px', fontSize: '1.2rem', color: 'white' }}>Lencana Pencapaian Otomatis</h3>
            <p style={{ marginTop: '8px', fontSize: '0.88rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.5' }}>
              Lencana pencapaian otomatis yang terbuka saat anggota aktif berkomunikasi atau melakukan streaming game pada dini hari.
            </p>
          </div>
        </div>
      </div>

      <footer style={{
        marginTop: '40px',
        color: 'hsl(var(--text-muted))',
        fontSize: '0.85rem',
        zIndex: 2
      }}>
        Dibuat khusus untuk paired programming showcase • © 2026 Antigravity
      </footer>

      {/* Embedded Floating Keyframes */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}} />
    </div>
  );
}
