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
            NEON LOGGER & ANALYTICS
          </h1>
          <p style={{
            color: 'hsl(var(--text-secondary))',
            fontSize: '1.2rem',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: '1.6',
            fontWeight: '300'
          }}>
            Bot Logging multifungsi premium dengan pelacakan aktivitas gaming terperinci, grafik analytics VC, server wrapped, dan gamified lencana prestasi.
          </p>
        </div>

        {/* Call to Actions Buttons */}
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <a href="/api/auth/login" style={{ textDecoration: 'none' }}>
            <button className="btn-primary" style={{ fontSize: '1.05rem', padding: '16px 36px' }}>
              🔌 Hubungkan dengan Discord
            </button>
          </a>
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
            <h3 style={{ marginTop: '12px', fontSize: '1.2rem', color: 'white' }}>Moderation & Security Log</h3>
            <p style={{ marginTop: '8px', fontSize: '0.88rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.5' }}>
              Pantau ban, kick, timeout, pesan dihapus, dan edit channel langsung dari Audit Logs Discord secara realtime.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel" style={{ padding: '24px', textAlign: 'left', background: 'rgba(255, 255, 255, 0.02)' }}>
            <span style={{ fontSize: '2rem' }}>🎙️</span>
            <h3 style={{ marginTop: '12px', fontSize: '1.2rem', color: 'white' }}>Analytics VC & Game</h3>
            <p style={{ marginTop: '8px', fontSize: '0.88rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.5' }}>
              Catat durasi member nongkrong di Voice Channel dan hitung jam bermain game favorit server Anda.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel" style={{ padding: '24px', textAlign: 'left', background: 'rgba(255, 255, 255, 0.02)' }}>
            <span style={{ fontSize: '2rem' }}>🏆</span>
            <h3 style={{ marginTop: '12px', fontSize: '1.2rem', color: 'white' }}>Gamified Achievements</h3>
            <p style={{ marginTop: '8px', fontSize: '0.88rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.5' }}>
              Lencana prestasi (badges) otomatis yang terbuka saat member aktif mengobrol atau streaming game di malam kalong.
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
