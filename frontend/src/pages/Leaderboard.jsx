import React, { useState, useEffect } from 'react';
import { useApp } from '../App';

// Achievements badge list
const BADGES = [
  { id: 'first_word', emoji: '💬', name: 'First Word', desc: 'Kirimkan pesan pertama di server.' },
  { id: 'chatterbox_basic', emoji: '🗣️', name: 'Chatterbox I', desc: 'Kirimkan 100 pesan chat.' },
  { id: 'chatterbox_elite', emoji: '📢', name: 'Chatterbox II', desc: 'Kirimkan 1.000 pesan chat.' },
  { id: 'vc_rookie', emoji: '🎙️', name: 'VC Rookie', desc: 'Nongkrong VC selama 1 jam.' },
  { id: 'vc_veteran', emoji: '👑', name: 'VC Veteran', desc: 'Nongkrong VC selama 10 jam.' },
  { id: 'vc_deity', emoji: '♾️', name: 'VC Deity', desc: 'Nongkrong VC selama 100 jam.' },
  { id: 'marathon_vc', emoji: '🏃', name: 'VC Marathoner', desc: 'VC tanpa putus minimal 5 jam.' },
  { id: 'night_owl', emoji: '🦉', name: 'Night Owl', desc: 'VC aktif di jam kalong (02:00 - 05:00).' },
  { id: 'gamer_initiate', emoji: '🎮', name: 'Gamer Initiate', desc: 'Deteksi bermain game minimal 1 jam.' },
  { id: 'hardcore_gamer', emoji: '🔥', name: 'Hardcore Gamer', desc: 'Bermain satu judul game minimal 10 jam.' }
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
    // voice and gaming score is in seconds
    const hrs = Math.round((score / 3600) * 10) / 10;
    return `${hrs} jam`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Header Panel */}
      <div>
        <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', color: 'white' }}>🏆 Server Analytics & Achievements</h2>
        <p style={{ color: 'hsl(var(--text-secondary))', marginTop: '4px' }}>Statistik aktivitas, grafik game paling populer, serta pencapaian lencana server.</p>
      </div>

      {/* Analytics Summary Stats Row cards */}
      {loadingStats ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>Loading Stats...</div>
      ) : analytics ? (
        <div className="stats-card-container">
          <div className="glass-panel" style={{ padding: '20px', position: 'relative' }}>
            <span style={{ fontSize: '1.8rem', position: 'absolute', top: '20px', right: '20px' }}>💬</span>
            <span style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.82rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Total Pesan Chat</span>
            <h2 style={{ fontSize: '2.2rem', color: 'white', marginTop: '8px', fontFamily: 'var(--font-display)' }}>
              {analytics.total_messages.toLocaleString()}
            </h2>
          </div>

          <div className="glass-panel" style={{ padding: '20px', position: 'relative' }}>
            <span style={{ fontSize: '1.8rem', position: 'absolute', top: '20px', right: '20px' }}>🎙️</span>
            <span style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.82rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Total Voice Hours</span>
            <h2 style={{ fontSize: '2.2rem', color: 'white', marginTop: '8px', fontFamily: 'var(--font-display)' }}>
              {analytics.total_voice_hours.toLocaleString()} hrs
            </h2>
          </div>

          <div className="glass-panel" style={{ padding: '20px', position: 'relative' }}>
            <span style={{ fontSize: '1.8rem', position: 'absolute', top: '20px', right: '20px' }}>🔊</span>
            <span style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.82rem', fontWeight: 'bold', textTransform: 'uppercase' }}>VC Aktif Saat Ini</span>
            <h2 style={{ fontSize: '2.2rem', color: 'hsl(var(--success-emerald))', marginTop: '8px', fontFamily: 'var(--font-display)' }}>
              {analytics.active_voice_count} users
            </h2>
          </div>

          <div className="glass-panel" style={{ padding: '20px', position: 'relative' }}>
            <span style={{ fontSize: '1.8rem', position: 'absolute', top: '20px', right: '20px' }}>⚙️</span>
            <span style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.82rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Total Aksi Moderasi</span>
            <h2 style={{ fontSize: '2.2rem', color: 'white', marginTop: '8px', fontFamily: 'var(--font-display)' }}>
              {analytics.total_moderations}
            </h2>
          </div>
        </div>
      ) : null}

      {/* Grid: Popular Games and Leaderboard */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Leaderboard panel */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'white' }}>🥇 Peringkat Keaktifan Server</h3>
            
            {/* Ranks selection tabs */}
            <div style={{ display: 'flex', gap: '4px', backgroundColor: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '8px' }}>
              <button 
                onClick={() => setCategory('voice')}
                style={{
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  backgroundColor: category === 'voice' ? 'hsla(var(--primary-glow), 0.15)' : 'transparent',
                  color: category === 'voice' ? 'white' : 'hsl(var(--text-secondary))',
                  fontWeight: '600',
                  fontSize: '0.8rem'
                }}
              >
                VC
              </button>
              <button 
                onClick={() => setCategory('messages')}
                style={{
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  backgroundColor: category === 'messages' ? 'hsla(var(--primary-glow), 0.15)' : 'transparent',
                  color: category === 'messages' ? 'white' : 'hsl(var(--text-secondary))',
                  fontWeight: '600',
                  fontSize: '0.8rem'
                }}
              >
                Chat
              </button>
              <button 
                onClick={() => setCategory('gaming')}
                style={{
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  backgroundColor: category === 'gaming' ? 'hsla(var(--primary-glow), 0.15)' : 'transparent',
                  color: category === 'gaming' ? 'white' : 'hsl(var(--text-secondary))',
                  fontWeight: '600',
                  fontSize: '0.8rem'
                }}
              >
                Gamer
              </button>
            </div>
          </div>

          {loadingLeader ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>Loading Leaderboard...</div>
          ) : leaderboard.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {leaderboard.map((item, idx) => (
                <div 
                  key={idx} 
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: idx === 0 ? 'hsla(var(--primary-glow), 0.05)' : 'rgba(255,255,255,0.01)',
                    border: idx === 0 ? '1px solid hsla(var(--primary-glow), 0.25)' : '1px solid hsl(var(--border-glass))'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ 
                      fontSize: '1rem', 
                      fontWeight: 'bold',
                      color: idx === 0 ? 'gold' : idx === 1 ? 'silver' : idx === 2 ? '#cd7f32' : 'hsl(var(--text-muted))',
                      width: '24px'
                    }}>
                      #{idx + 1}
                    </span>
                    <span style={{ color: 'white', fontWeight: idx === 0 ? '700' : '500' }}>{item.username}</span>
                  </div>
                  <span style={{ 
                    fontFamily: 'monospace', 
                    color: idx === 0 ? 'hsl(var(--accent-cyan))' : 'white', 
                    fontWeight: 'bold' 
                  }}>
                    {formatScore(item.score, category)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: 'hsl(var(--text-secondary))' }}>
              Belum ada peringkat tercatat dalam kategori ini.
            </div>
          )}
        </div>

        {/* Popular games horizontal bar chart */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.25rem', color: 'white' }}>🎮 Jam Gaming Teraktif Server</h3>
          <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', marginTop: '-12px' }}>
            Judul game terpopuler yang dimainkan member di server ini.
          </p>

          {loadingStats ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>Loading Chart...</div>
          ) : analytics?.popular_games?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {analytics.popular_games.map((g, idx) => {
                const maxVal = analytics.popular_games[0].hours || 1;
                const pct = Math.max(5, Math.min(100, (g.hours / maxVal) * 100));
                
                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                      <span style={{ color: 'white', fontWeight: '500' }}>{g.game}</span>
                      <span style={{ color: 'hsl(var(--accent-cyan))', fontFamily: 'monospace', fontWeight: 'bold' }}>{g.hours} jam</span>
                    </div>
                    {/* SVG/CSS Progress bar */}
                    <div style={{ width: '100%', height: '8px', borderRadius: '99px', backgroundColor: 'rgba(0,0,0,0.3)', overflow: 'hidden' }}>
                      <div className="chart-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: 'hsl(var(--text-secondary))' }}>
              Belum ada data game terdeteksi di server.
            </div>
          )}
        </div>

      </div>

      {/* Achievements visual showcase panels grid */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 style={{ fontSize: '1.25rem', color: 'white' }}>🏅 Lencana & Achievements Anda</h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px'
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
                  <h4 style={{ color: 'white', fontSize: '0.98rem' }}>{badge.name}</h4>
                  <p style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))', marginTop: '2px' }}>{badge.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
