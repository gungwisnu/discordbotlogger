import React, { useState, useEffect } from 'react';
import { useApp } from '../App';

// Achievements badge list
const BADGES = [
  { id: 'first_word', emoji: '💬', name: 'First Word', desc: 'Mengirimkan pesan pertama di server.' },
  { id: 'chatterbox_basic', emoji: '🗣️', name: 'Chatterbox I', desc: 'Mengirimkan 100 pesan teks.' },
  { id: 'chatterbox_elite', emoji: '📢', name: 'Chatterbox II', desc: 'Mengirimkan 1.000 pesan teks.' },
  { id: 'vc_rookie', emoji: '🎙️', name: 'Voice Rookie', desc: 'Aktivitas Voice selama 1 jam.' },
  { id: 'vc_veteran', emoji: '👑', name: 'Voice Veteran', desc: 'Aktivitas Voice selama 10 jam.' },
  { id: 'vc_deity', emoji: '♾️', name: 'Voice Deity', desc: 'Aktivitas Voice selama 100 jam.' },
  { id: 'marathon_vc', emoji: '🏃', name: 'Voice Marathoner', desc: 'Aktivitas Voice tanpa terputus minimal selama 5 jam.' },
  { id: 'night_owl', emoji: '🦉', name: 'Night Owl', desc: 'Aktivitas Voice secara aktif pada dini hari (02:00 - 05:00).' },
  { id: 'gamer_initiate', emoji: '🎮', name: 'Gamer Initiate', desc: 'Deteksi aktivitas bermain game minimal selama 1 jam.' },
  { id: 'hardcore_gamer', emoji: '🔥', name: 'Hardcore Gamer', desc: 'Mencapai bermain satu judul game minimal selama 10 jam.' }
];

export default function Leaderboard() {
  const { selectedGuild, user } = useApp();
  const [analytics, setAnalytics] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [category, setCategory] = useState('voice'); // voice, messages, gaming
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingLeader, setLoadingLeader] = useState(true);
  const [unlockedBadges, setUnlockedBadges] = useState([]);

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

  // Mock unlocked badges fetch (In real usage, checks user_history for selected user)
  useEffect(() => {
    // Demo presets or user stats
    if (user?.demo) {
      setUnlockedBadges(['first_word', 'chatterbox_basic', 'vc_rookie', 'night_owl', 'gamer_initiate']);
    } else {
      setUnlockedBadges(['first_word']);
    }
  }, [user]);

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
        <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', color: 'hsl(var(--text-primary))', fontWeight: '800' }}>Server Analytics & Achievements</h2>
        <p style={{ color: 'hsl(var(--text-secondary))', marginTop: '4px' }}>Statistik aktivitas, grafik game paling populer, serta pencapaian lencana server.</p>
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px', alignItems: 'start' }}>
        
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

      {/* Achievements visual showcase panels grid */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 style={{ fontSize: '1.25rem', color: 'hsl(var(--text-primary))', fontWeight: '750' }}>Lencana & Achievements Anda</h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '18px'
        }}>
          {BADGES.map(badge => {
            const isUnlocked = unlockedBadges.includes(badge.id);
            return (
              <div 
                key={badge.id} 
                className={`badge-card ${isUnlocked ? 'unlocked' : 'locked'}`}
              >
                <div className="badge-emoji">{badge.emoji}</div>
                <div>
                  <h4 style={{ color: 'hsl(var(--text-primary))', fontSize: '0.98rem', fontWeight: '700' }}>{badge.name}</h4>
                  <p style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', marginTop: '4px', lineHeight: '1.4' }}>{badge.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
