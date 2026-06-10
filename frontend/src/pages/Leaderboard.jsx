import React, { useState, useEffect } from 'react';
import { useApp } from '../App';

export default function Leaderboard() {
  const { selectedGuild } = useApp();
  const [analytics, setAnalytics] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [category, setCategory] = useState('voice'); // voice, messages, gaming
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingLeader, setLoadingLeader] = useState(true);

  // Fetch analytics summary counts
  useEffect(() => {
    if (!selectedGuild) return;
    setLoadingStats(true);
    
    fetch(`/api/guilds/${selectedGuild.id}/analytics`)
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        setAnalytics(data);
        setLoadingStats(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingStats(false);
      });
  }, [selectedGuild]);

  // Fetch leaderboard data when category or selected guild changes
  useEffect(() => {
    if (!selectedGuild) return;
    setLoadingLeader(true);
    
    fetch(`/api/guilds/${selectedGuild.id}/leaderboard?type=${category}`)
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        setLeaderboard(data || []);
        setLoadingLeader(false);
      })
      .catch(err => {
        console.error(err);
        setLoadingLeader(false);
      });
  }, [selectedGuild, category]);

  const formatScore = (score, cat) => {
    if (cat === 'messages') {
      return `${score.toLocaleString()} pesan`;
    }
    const hrs = Math.round((score / 3600) * 10) / 10;
    return `${hrs} jam`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Header Panel */}
      <div>
        <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', color: 'hsl(var(--text-primary))', fontWeight: '800' }}>Analisis & Keaktifan Server</h2>
        <p style={{ color: 'hsl(var(--text-secondary))', marginTop: '4px' }}>Analisis mendalam mengenai keaktifan obrolan, durasi voice, game terpopuler, dan pola aktivitas server.</p>
      </div>

      {/* Analytics Summary Stats Row cards (Clean, no floating emojis) */}
      {loadingStats ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '2px solid hsla(var(--primary-glow), 0.15)',
            borderTopColor: 'hsl(var(--primary-glow))',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        </div>
      ) : analytics ? (
        <div className="stats-card-container">
          <div className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
            <span style={{ color: 'hsl(var(--text-muted))', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Pesan Chat</span>
            <h2 style={{ fontSize: '2.2rem', color: 'hsl(var(--text-primary))', marginTop: '10px', fontFamily: 'var(--font-display)', fontWeight: '800' }}>
              {analytics.total_messages.toLocaleString()}
            </h2>
          </div>

          <div className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
            <span style={{ color: 'hsl(var(--text-muted))', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Durasi Voice</span>
            <h2 style={{ fontSize: '2.2rem', color: 'hsl(var(--text-primary))', marginTop: '10px', fontFamily: 'var(--font-display)', fontWeight: '800' }}>
              {analytics.total_voice_hours.toLocaleString()} <span style={{ fontSize: '1.25rem', fontWeight: '600' }}>jam</span>
            </h2>
          </div>

          <div className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
            <span style={{ color: 'hsl(var(--text-muted))', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sesi Voice Aktif</span>
            <h2 style={{ fontSize: '2.2rem', color: 'hsl(var(--success-emerald))', marginTop: '10px', fontFamily: 'var(--font-display)', fontWeight: '800' }}>
              {analytics.active_voice_count} <span style={{ fontSize: '1.25rem', fontWeight: '600', color: 'hsl(var(--text-muted))' }}>anggota</span>
            </h2>
          </div>

          <div className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
            <span style={{ color: 'hsl(var(--text-muted))', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Aksi Moderasi</span>
            <h2 style={{ fontSize: '2.2rem', color: 'hsl(var(--text-primary))', marginTop: '10px', fontFamily: 'var(--font-display)', fontWeight: '800' }}>
              {analytics.total_moderations}
            </h2>
          </div>
        </div>
      ) : null}

      {/* Grid: Popular Games and Leaderboard */}
      <div className="analytics-grid" style={{ alignItems: 'start' }}>
        
        {/* Leaderboard panel */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'hsl(var(--text-primary))', fontWeight: '750' }}>Peringkat Keaktifan Server</h3>
            
            {/* Ranks selection tabs */}
            <div style={{ display: 'flex', gap: '4px', backgroundColor: 'hsla(var(--border-glass), 0.15)', padding: '4px', borderRadius: '10px', border: '1px solid hsl(var(--border-glass))' }}>
              <button 
                onClick={() => setCategory('voice')}
                style={{
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: category === 'voice' ? 'hsl(var(--panel-glass))' : 'transparent',
                  color: category === 'voice' ? 'hsl(var(--primary-glow))' : 'hsl(var(--text-secondary))',
                  fontWeight: '600',
                  fontSize: '0.8rem',
                  transition: 'all 0.2s ease',
                  boxShadow: category === 'voice' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                Voice
              </button>
              <button 
                onClick={() => setCategory('messages')}
                style={{
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: category === 'messages' ? 'hsl(var(--panel-glass))' : 'transparent',
                  color: category === 'messages' ? 'hsl(var(--primary-glow))' : 'hsl(var(--text-secondary))',
                  fontWeight: '600',
                  fontSize: '0.8rem',
                  transition: 'all 0.2s ease',
                  boxShadow: category === 'messages' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                Chat
              </button>
              <button 
                onClick={() => setCategory('gaming')}
                style={{
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: category === 'gaming' ? 'hsl(var(--panel-glass))' : 'transparent',
                  color: category === 'gaming' ? 'hsl(var(--primary-glow))' : 'hsl(var(--text-secondary))',
                  fontWeight: '600',
                  fontSize: '0.8rem',
                  transition: 'all 0.2s ease',
                  boxShadow: category === 'gaming' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                Gamer
              </button>
            </div>
          </div>

          {loadingLeader ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
              <div style={{
                width: '28px',
                height: '28px',
                margin: '0 auto',
                border: '2px solid hsla(var(--primary-glow), 0.15)',
                borderTopColor: 'hsl(var(--primary-glow))',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            </div>
          ) : leaderboard.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {leaderboard.map((item, idx) => (
                <div 
                  key={idx} 
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 18px',
                    borderRadius: '12px',
                    background: idx === 0 ? 'hsla(var(--primary-glow), 0.06)' : 'hsla(var(--border-glass), 0.1)',
                    border: idx === 0 ? '1px solid hsla(var(--primary-glow), 0.3)' : '1px solid hsl(var(--border-glass))'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ 
                      fontSize: '0.95rem', 
                      fontWeight: '800',
                      color: idx === 0 ? 'gold' : idx === 1 ? 'silver' : idx === 2 ? '#cd7f32' : 'hsl(var(--text-muted))',
                      width: '24px'
                    }}>
                      #{idx + 1}
                    </span>
                    <span style={{ color: 'hsl(var(--text-primary))', fontWeight: idx === 0 ? '700' : '600' }}>{item.username}</span>
                  </div>
                  <span style={{ 
                    fontFamily: 'monospace', 
                    color: idx === 0 ? 'hsl(var(--accent-cyan))' : 'hsl(var(--text-primary))', 
                    fontWeight: '700',
                    fontSize: '0.9rem'
                  }}>
                    {formatScore(item.score, category)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: 'hsl(var(--text-muted))', fontWeight: '500' }}>
              Belum ada peringkat tercatat dalam kategori ini.
            </div>
          )}
        </div>

        {/* Popular games horizontal bar chart */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.25rem', color: 'hsl(var(--text-primary))', fontWeight: '750' }}>Jam Gaming Teraktif Server</h3>
          <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', marginTop: '-12px' }}>
            Judul game terpopuler yang dimainkan member di server ini.
          </p>

          {loadingStats ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{
                width: '28px',
                height: '28px',
                margin: '0 auto',
                border: '2px solid hsla(var(--primary-glow), 0.15)',
                borderTopColor: 'hsl(var(--primary-glow))',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            </div>
          ) : analytics?.popular_games?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {analytics.popular_games.map((g, idx) => {
                const maxVal = analytics.popular_games[0].hours || 1;
                const pct = Math.max(5, Math.min(100, (g.hours / maxVal) * 100));
                
                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: '600' }}>
                      <span style={{ color: 'hsl(var(--text-primary))' }}>{g.game}</span>
                      <span style={{ color: 'hsl(var(--accent-cyan))', fontFamily: 'monospace', fontWeight: '700' }}>{g.hours} jam</span>
                    </div>
                    {/* SVG/CSS Progress bar */}
                    <div style={{ width: '100%', height: '8px', borderRadius: '99px', backgroundColor: 'hsla(var(--border-glass), 0.25)', overflow: 'hidden' }}>
                      <div className="chart-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: 'hsl(var(--text-muted))', fontWeight: '500' }}>
              Belum ada data game terdeteksi di server.
            </div>
          )}
        </div>

      </div>

      {/* Detailed Server Analytics & Distributions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }} className="analytics-grid">
        
        {/* Rasio Komunikasi */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.25rem', color: 'hsl(var(--text-primary))', fontWeight: '750' }}>Rasio Aktivitas (Chat vs Voice)</h3>
          <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', marginTop: '-12px' }}>
            Rasio kontribusi keaktifan anggota berdasarkan pesan obrolan teks dan durasi panggilan suara.
          </p>

          {!loadingStats && analytics ? (() => {
            const totalMsgs = analytics.total_messages || 0;
            const totalVoiceHrs = analytics.total_voice_hours || 0;
            // 1 voice hour equates to ~20 messages in weight for community interaction
            const voiceWeight = totalVoiceHrs * 20;
            const combinedWeight = totalMsgs + voiceWeight;
            const chatPct = combinedWeight > 0 ? Math.round((totalMsgs / combinedWeight) * 100) : 50;
            const voicePct = 100 - chatPct;

            let insightText = "Keseimbangan aktivitas chat dan voice sangat baik! Komunitas terjalin aktif secara merata baik teks maupun suara.";
            if (chatPct > 75) {
              insightText = "Komunitas Anda sangat didominasi oleh obrolan teks! Anggota gemar berdiskusi tulisan, mengirimkan meme, dan berinteraksi secara asinkron.";
            } else if (voicePct > 60) {
              insightText = "Server didominasi oleh sesi mengobrol langsung di Voice Channel! Anggota menyukai mabar game, ngobrol santai, dan streaming audio.";
            }

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', fontWeight: '600' }}>Kerapatan Obrolan Teks</span>
                    <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'hsl(var(--primary-glow))' }}>{chatPct}%</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'right' }}>
                    <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', fontWeight: '600' }}>Kerapatan Voice Channel</span>
                    <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'hsl(var(--accent-cyan))' }}>{voicePct}%</span>
                  </div>
                </div>

                {/* Progress bar split */}
                <div style={{
                  width: '100%',
                  height: '14px',
                  borderRadius: '99px',
                  backgroundColor: 'hsla(var(--border-glass), 0.25)',
                  overflow: 'hidden',
                  display: 'flex'
                }}>
                  <div style={{
                    width: `${chatPct}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, hsl(var(--primary-glow)), hsla(var(--primary-glow), 0.85))',
                    transition: 'width 1s ease'
                  }} />
                  <div style={{
                    width: `${voicePct}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, hsla(var(--accent-cyan), 0.85), hsl(var(--accent-cyan)))',
                    transition: 'width 1s ease'
                  }} />
                </div>

                <div style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  backgroundColor: 'hsla(var(--border-glass), 0.12)',
                  border: '1px solid hsl(var(--border-glass))',
                  fontSize: '0.82rem',
                  lineHeight: '1.5',
                  color: 'hsl(var(--text-secondary))'
                }}>
                  💡 <strong>Analisis AI:</strong> {insightText}
                </div>
              </div>
            );
          })() : (
            <div style={{ padding: '40px', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
              Memuat data rasio...
            </div>
          )}
        </div>

        {/* Pola Waktu Keaktifan Harian */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.25rem', color: 'hsl(var(--text-primary))', fontWeight: '750' }}>Pola Waktu Keaktifan Server</h3>
          <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', marginTop: '-12px' }}>
            Estimasi tingkat kepadatan interaksi anggota berdasarkan pembagian waktu 24 jam sehari.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { label: 'Pagi (06:00 - 12:00)', pct: 25, status: 'Santai', color: 'hsl(var(--text-muted))', desc: 'Mulai bangun tidur dan bersiap beraktivitas.' },
              { label: 'Siang (12:00 - 18:00)', pct: 55, status: 'Stabil', color: 'hsl(var(--primary-glow))', desc: 'Sesi obrolan santai dan istirahat siang.' },
              { label: 'Malam (18:00 - 00:00)', pct: 95, status: 'Puncak', color: 'hsl(var(--accent-cyan))', desc: 'Sesi bermain game bersama, mabar, dan ngobrol voice.', peak: true },
              { label: 'Dini Hari (00:00 - 06:00)', pct: 40, status: 'Kalong', color: 'hsl(var(--warning-amber))', desc: 'Aktif obrolan bagi yang hobi begadang/insomnia.' }
            ].map((time, idx) => (
              <div key={idx} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                padding: '10px 14px',
                borderRadius: '12px',
                border: time.peak ? '1px solid hsla(var(--accent-cyan), 0.3)' : '1px solid transparent',
                backgroundColor: time.peak ? 'hsla(var(--accent-cyan), 0.04)' : 'transparent'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', fontWeight: '700' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: 'hsl(var(--text-primary))' }}>{time.label}</span>
                    {time.peak && (
                      <span style={{
                        fontSize: '0.65rem',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        backgroundColor: 'hsla(var(--accent-cyan), 0.15)',
                        color: 'hsl(var(--accent-cyan))',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>PEAK TIME</span>
                    )}
                  </div>
                  <span style={{ color: time.color }}>{time.status} ({time.pct}%)</span>
                </div>
                <div style={{ width: '100%', height: '6px', borderRadius: '99px', backgroundColor: 'hsla(var(--border-glass), 0.2)', overflow: 'hidden' }}>
                  <div style={{
                    width: `${time.pct}%`,
                    height: '100%',
                    borderRadius: '99px',
                    backgroundColor: time.peak ? 'hsl(var(--accent-cyan))' : 'hsl(var(--primary-glow))'
                  }} />
                </div>
                <span style={{ fontSize: '0.72rem', color: 'hsl(var(--text-muted))' }}>{time.desc}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
