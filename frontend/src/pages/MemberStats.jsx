import React, { useState, useEffect } from 'react';
import { useApp } from '../App';

const ACHIEVEMENTS_LIST = [
  { id: 'first_word', emoji: '💬', name: 'First Word', desc: 'Mengirimkan pesan pertama di server.' },
  { id: 'chatterbox_basic', emoji: '🗣️', name: 'Chatterbox I', desc: 'Mengirimkan 100 pesan teks.' },
  { id: 'chatterbox_elite', emoji: '📢', name: 'Chatterbox II', desc: 'Mengirimkan 1.000 pesan teks.' },
  { id: 'chatterbox_legend', emoji: '🏆', name: 'Chatterbox Legend', desc: 'Mengirimkan 10.000 pesan teks di server.' },
  { id: 'vc_rookie', emoji: '🎙️', name: 'Voice Rookie', desc: 'Akumulasi aktivitas Voice selama 1 jam.' },
  { id: 'vc_veteran', emoji: '👑', name: 'Voice Veteran', desc: 'Akumulasi aktivitas Voice selama 10 jam.' },
  { id: 'vc_master', emoji: '👑', name: 'Voice Master', desc: 'Akumulasi aktivitas Voice selama 50 jam.' },
  { id: 'vc_deity', emoji: '♾️', name: 'Voice Deity', desc: 'Mengumpulkan 100 jam sesi Voice.' },
  { id: 'marathon_vc', emoji: '🏃', name: 'Voice Marathoner', desc: 'Satu sesi Voice tanpa terputus minimal selama 5 jam.' },
  { id: 'night_owl', emoji: '🦉', name: 'Night Owl', desc: 'Aktivitas Voice secara aktif pada dini hari (02:00 - 05:00).' },
  { id: 'early_bird', emoji: '🌅', name: 'Early Bird', desc: 'Aktif bergabung ke saluran Voice pada pagi hari (05:00 - 08:00).' },
  { id: 'weekend_warrior', emoji: '⚔️', name: 'Weekend Warrior', desc: 'Aktif menggunakan saluran Voice pada akhir pekan (Sabtu/Minggu).' },
  { id: 'gamer_initiate', emoji: '🎮', name: 'Gamer Initiate', desc: 'Deteksi aktivitas bermain game minimal selama 1 jam.' },
  { id: 'hardcore_gamer', emoji: '🔥', name: 'Hardcore Gamer', desc: 'Mencapai bermain satu judul game minimal selama 10 jam.' },
  { id: 'gamer_expert', emoji: '🌟', name: 'Gamer Expert', desc: 'Mengumpulkan total durasi bermain seluruh game selama 50 jam.' }
];

export default function MemberStats() {
  const { selectedGuild } = useApp();
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  
  // Edit Form State
  const [editMsgCount, setEditMsgCount] = useState(0);
  const [editAchievements, setEditAchievements] = useState([]);
  const [editVoiceHrs, setEditVoiceHrs] = useState(0);
  const [editVoiceMins, setEditVoiceMins] = useState(0);
  const [editVoiceSecs, setEditVoiceSecs] = useState(0);
  const [editGaming, setEditGaming] = useState([]); // Array of { game, hrs, mins, secs }
  const [newGameName, setNewGameName] = useState('');
  
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const fetchMembers = () => {
    if (!selectedGuild) return;
    setLoading(true);
    setError(null);
    fetch(`/api/guilds/${selectedGuild.id}/members-stats`)
      .then(res => {
        if (!res.ok) throw new Error('Gagal memuat data statistik anggota.');
        return res.json();
      })
      .then(data => {
        setMembers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMembers();
  }, [selectedGuild]);

  const handleOpenEdit = (m) => {
    setEditingMember(m);
    setEditMsgCount(m.msg_count || 0);
    setEditAchievements(m.achievements || []);

    // Convert voice duration (seconds) to hms
    const totalVoice = m.voice_time || 0;
    const vHrs = Math.floor(totalVoice / 3600);
    const vMins = Math.floor((totalVoice % 3600) / 60);
    const vSecs = totalVoice % 60;
    setEditVoiceHrs(vHrs);
    setEditVoiceMins(vMins);
    setEditVoiceSecs(vSecs);

    // Convert gaming duration (seconds) to hms per game
    const gamesList = Object.entries(m.gaming_time || {}).map(([game, seconds]) => {
      const gHrs = Math.floor(seconds / 3600);
      const gMins = Math.floor((seconds % 3600) / 60);
      const gSecs = seconds % 60;
      return { game, hrs: gHrs, mins: gMins, secs: gSecs };
    });
    setEditGaming(gamesList);
    setNewGameName('');
    setStatusMessage(null);
  };

  const handleAddGame = () => {
    if (!newGameName.trim()) return;
    // Check duplicate
    if (editGaming.some(g => g.game.toLowerCase() === newGameName.trim().toLowerCase())) {
      alert('Game tersebut sudah ada dalam daftar statistik.');
      return;
    }
    setEditGaming(prev => [...prev, { game: newGameName.trim(), hrs: 0, mins: 0, secs: 0 }]);
    setNewGameName('');
  };

  const handleRemoveGame = (gameName) => {
    setEditGaming(prev => prev.filter(g => g.game !== gameName));
  };

  const handleGameTimeChange = (gameName, field, value) => {
    const intVal = Math.max(0, parseInt(value) || 0);
    setEditGaming(prev => prev.map(g => {
      if (g.game === gameName) {
        return { ...g, [field]: intVal };
      }
      return g;
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editingMember || !selectedGuild) return;

    setSaving(true);
    setStatusMessage(null);

    // Calculate total voice time in seconds
    const voiceSeconds = (editVoiceHrs * 3600) + (editVoiceMins * 60) + editVoiceSecs;

    // Calculate gaming times in seconds
    const gamingObj = {};
    editGaming.forEach(g => {
      const totalSecs = (g.hrs * 3600) + (g.mins * 60) + g.secs;
      gamingObj[g.game] = totalSecs;
    });

    try {
      const res = await fetch(`/api/guilds/${selectedGuild.id}/members-stats/${editingMember.user_id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          msg_count: editMsgCount,
          voice_time: voiceSeconds,
          gaming_time: gamingObj,
          achievements: editAchievements
        })
      });

      if (!res.ok) throw new Error('Gagal menyimpan perubahan.');
      
      const data = await res.json();
      if (data.success) {
        setStatusMessage({ type: 'success', text: '✓ Statistik anggota berhasil diperbarui!' });
        // Refresh local member list
        fetchMembers();
        setTimeout(() => {
          setEditingMember(null);
        }, 1200);
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: '❌ Terjadi kesalahan saat menyimpan perubahan.' });
    } finally {
      setSaving(false);
    }
  };

  const formatDuration = (totalSecs) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    
    let parts = [];
    if (hrs > 0) parts.push(`${hrs}j`);
    if (mins > 0 || hrs > 0) parts.push(`${mins}m`);
    parts.push(`${secs}d`);
    return parts.join(' ');
  };

  const filteredMembers = members.filter(m => 
    m.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.user_id.includes(searchQuery)
  );

  if (loading && members.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '3px solid hsla(var(--primary-glow), 0.15)',
          borderTopColor: 'hsl(var(--primary-glow))',
          borderRadius: '50%',
          animation: 'spin 1.2s linear infinite'
        }} />
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin { to { transform: rotate(360deg); } }
        `}} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', color: 'hsl(var(--text-primary))', fontWeight: '800' }}>Kelola Database Anggota</h2>
          <p style={{ color: 'hsl(var(--text-secondary))', marginTop: '4px' }}>Modifikasi statistik aktivitas obrolan, durasi sesi voice, dan waktu bermain game anggota server.</p>
        </div>

        <button 
          className="btn-secondary" 
          onClick={fetchMembers}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', fontSize: '0.88rem' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          Segarkan Data
        </button>
      </div>

      {error && (
        <div className="glass-panel" style={{ padding: '24px', borderColor: 'hsla(var(--danger-crimson), 0.3)', color: 'hsl(var(--danger-crimson))' }}>
          <h4>Terjadi Kesalahan</h4>
          <p style={{ fontSize: '0.88rem', marginTop: '4px' }}>{error}</p>
        </div>
      )}

      {/* Search Bar */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'hsl(var(--text-muted))' }}>
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input 
          type="text"
          placeholder="Cari anggota berdasarkan username atau ID Discord..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-glass"
          style={{
            border: 'none',
            background: 'transparent',
            padding: '4px 0',
            width: '100%',
            color: 'hsl(var(--text-primary))',
            fontSize: '0.92rem'
          }}
        />
      </div>

      {/* Members Stats Table */}
      <div className="glass-panel" style={{ overflowX: 'auto', padding: '16px 0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid hsl(var(--border-glass))' }}>
              <th style={{ padding: '12px 24px', fontSize: '0.78rem', color: 'hsl(var(--text-muted))', fontWeight: '700', textTransform: 'uppercase' }}>Anggota</th>
              <th style={{ padding: '12px 16px', fontSize: '0.78rem', color: 'hsl(var(--text-muted))', fontWeight: '700', textTransform: 'uppercase' }}>Total Pesan</th>
              <th style={{ padding: '12px 16px', fontSize: '0.78rem', color: 'hsl(var(--text-muted))', fontWeight: '700', textTransform: 'uppercase' }}>Durasi Voice</th>
              <th style={{ padding: '12px 16px', fontSize: '0.78rem', color: 'hsl(var(--text-muted))', fontWeight: '700', textTransform: 'uppercase' }}>Judul Game Terpopuler</th>
              <th style={{ padding: '12px 24px', fontSize: '0.78rem', color: 'hsl(var(--text-muted))', fontWeight: '700', textTransform: 'uppercase', textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.length > 0 ? (
              filteredMembers.map((m) => {
                const totalGameTime = Object.values(m.gaming_time || {}).reduce((a, b) => a + b, 0);
                
                // Get game with most time
                let favoriteGame = 'Tidak Bermain';
                const games = Object.entries(m.gaming_time || {});
                if (games.length > 0) {
                  const sorted = games.sort((a, b) => b[1] - a[1]);
                  favoriteGame = `${sorted[0][0]} (${formatDuration(sorted[0][1])})`;
                }

                return (
                  <tr key={m.user_id} className="table-row-hover" style={{ borderBottom: '1px solid hsla(var(--border-glass), 0.5)' }}>
                    {/* User profile */}
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {m.avatarUrl ? (
                          <img src={m.avatarUrl} alt={m.username} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'hsl(var(--primary-glow))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                            {m.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.92rem', fontWeight: '600', color: 'hsl(var(--text-primary))' }}>{m.username}</span>
                          <span style={{ fontSize: '0.72rem', color: 'hsl(var(--text-muted))', fontFamily: 'monospace' }}>ID: {m.user_id}</span>
                        </div>
                      </div>
                    </td>

                    {/* Messages */}
                    <td style={{ padding: '16px 16px', fontSize: '0.92rem', color: 'hsl(var(--text-primary))', fontWeight: '600' }}>
                      {m.msg_count?.toLocaleString()}
                    </td>

                    {/* Voice time */}
                    <td style={{ padding: '16px 16px', fontSize: '0.92rem', color: 'hsl(var(--text-primary))', fontWeight: '600' }}>
                      {formatDuration(m.voice_time || 0)}
                    </td>

                    {/* Gaming stats summary */}
                    <td style={{ padding: '16px 16px', fontSize: '0.85rem', color: 'hsl(var(--text-secondary))' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: '600', color: 'hsl(var(--text-primary))' }}>{favoriteGame}</span>
                        {games.length > 1 && (
                          <span style={{ fontSize: '0.72rem', color: 'hsl(var(--text-muted))' }}>
                            dan {games.length - 1} game lainnya ({formatDuration(totalGameTime)})
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Action */}
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                      <button 
                        className="btn-secondary" 
                        onClick={() => handleOpenEdit(m)}
                        style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '0.8rem' }}
                      >
                        Edit Data
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'hsl(var(--text-muted))', fontSize: '0.88rem' }}>
                  Tidak ada data statistik anggota yang ditemukan untuk server ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Stats Modal */}
      {editingMember && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px'
        }} onClick={() => !saving && setEditingMember(null)}>
          <div className="glass-panel" style={{
            maxWidth: '650px',
            width: '100%',
            padding: '30px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            maxHeight: '85vh',
            overflowY: 'auto'
          }} onClick={e => e.stopPropagation()}>
            
            {/* Header */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', borderBottom: '1px solid hsl(var(--border-glass))', paddingBottom: '16px' }}>
              {editingMember.avatarUrl ? (
                <img src={editingMember.avatarUrl} alt={editingMember.username} style={{ width: '48px', height: '48px', borderRadius: '50%' }} />
              ) : (
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'hsl(var(--primary-glow))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
                  {editingMember.username.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="font-display" style={{ fontSize: '1.25rem', fontWeight: '800', color: 'hsl(var(--text-primary))' }}>
                  Edit Statistik: {editingMember.username}
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'hsl(var(--text-secondary))' }}>Ubah data aktivitas anggota di database.</p>
              </div>
            </div>

            {/* Status alerts */}
            {statusMessage && (
              <div style={{
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: '600',
                backgroundColor: statusMessage.type === 'success' ? 'hsla(var(--success-emerald), 0.15)' : 'hsla(var(--danger-crimson), 0.15)',
                color: statusMessage.type === 'success' ? 'hsl(var(--success-emerald))' : 'hsl(var(--danger-crimson))'
              }}>
                {statusMessage.text}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Text messages count */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'hsl(var(--text-primary))' }}>
                  Total Pesan Teks
                </label>
                <input 
                  type="number"
                  min="0"
                  value={editMsgCount}
                  onChange={(e) => setEditMsgCount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="input-glass"
                  disabled={saving}
                  style={{
                    padding: '10px 14px',
                    fontSize: '0.88rem',
                    backgroundColor: 'hsl(var(--panel-glass))',
                    color: 'hsl(var(--text-primary))'
                  }}
                />
              </div>

              {/* Voice Time */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'hsl(var(--text-primary))' }}>
                  Durasi Sesi Voice
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input 
                      type="number" min="0" value={editVoiceHrs}
                      onChange={(e) => setEditVoiceHrs(Math.max(0, parseInt(e.target.value) || 0))}
                      className="input-glass" disabled={saving}
                      style={{ padding: '8px', fontSize: '0.88rem', width: '100%', textAlign: 'center', backgroundColor: 'hsl(var(--panel-glass))', color: 'hsl(var(--text-primary))' }}
                    />
                    <span style={{ fontSize: '0.78rem', color: 'hsl(var(--text-muted))', fontWeight: '600' }}>jam</span>
                  </div>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input 
                      type="number" min="0" max="59" value={editVoiceMins}
                      onChange={(e) => setEditVoiceMins(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="input-glass" disabled={saving}
                      style={{ padding: '8px', fontSize: '0.88rem', width: '100%', textAlign: 'center', backgroundColor: 'hsl(var(--panel-glass))', color: 'hsl(var(--text-primary))' }}
                    />
                    <span style={{ fontSize: '0.78rem', color: 'hsl(var(--text-muted))', fontWeight: '600' }}>menit</span>
                  </div>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input 
                      type="number" min="0" max="59" value={editVoiceSecs}
                      onChange={(e) => setEditVoiceSecs(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="input-glass" disabled={saving}
                      style={{ padding: '8px', fontSize: '0.88rem', width: '100%', textAlign: 'center', backgroundColor: 'hsl(var(--panel-glass))', color: 'hsl(var(--text-primary))' }}
                    />
                    <span style={{ fontSize: '0.78rem', color: 'hsl(var(--text-muted))', fontWeight: '600' }}>detik</span>
                  </div>
                </div>
              </div>

              {/* Gaming Times */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid hsla(var(--border-glass), 0.5)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'hsl(var(--text-primary))' }}>
                    Statistik Bermain Game
                  </label>
                </div>

                {/* List of games */}
                {editGaming.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '160px', overflowY: 'auto', paddingRight: '4px' }}>
                    {editGaming.map((g) => (
                      <div key={g.game} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px', 
                        backgroundColor: 'hsla(var(--border-glass), 0.03)', 
                        padding: '10px', 
                        borderRadius: '8px',
                        border: '1px solid hsla(var(--border-glass), 0.4)'
                      }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'hsl(var(--text-primary))', width: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {g.game}
                        </span>

                        <div style={{ display: 'flex', gap: '6px', flex: 1 }}>
                          <input 
                            type="number" min="0" value={g.hrs} placeholder="jam"
                            onChange={(e) => handleGameTimeChange(g.game, 'hrs', e.target.value)}
                            className="input-glass" disabled={saving}
                            style={{ padding: '6px', fontSize: '0.75rem', width: '100%', textAlign: 'center', backgroundColor: 'hsl(var(--panel-glass))', color: 'hsl(var(--text-primary))' }}
                          />
                          <input 
                            type="number" min="0" max="59" value={g.mins} placeholder="menit"
                            onChange={(e) => handleGameTimeChange(g.game, 'mins', e.target.value)}
                            className="input-glass" disabled={saving}
                            style={{ padding: '6px', fontSize: '0.75rem', width: '100%', textAlign: 'center', backgroundColor: 'hsl(var(--panel-glass))', color: 'hsl(var(--text-primary))' }}
                          />
                          <input 
                            type="number" min="0" max="59" value={g.secs} placeholder="detik"
                            onChange={(e) => handleGameTimeChange(g.game, 'secs', e.target.value)}
                            className="input-glass" disabled={saving}
                            style={{ padding: '6px', fontSize: '0.75rem', width: '100%', textAlign: 'center', backgroundColor: 'hsl(var(--panel-glass))', color: 'hsl(var(--text-primary))' }}
                          />
                        </div>

                        <button 
                          type="button"
                          onClick={() => handleRemoveGame(g.game)}
                          disabled={saving}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'hsl(var(--danger-crimson))',
                            cursor: 'pointer',
                            padding: '4px'
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.78rem', color: 'hsl(var(--text-muted))', textAlign: 'center', padding: '10px' }}>
                    Belum ada data bermain game.
                  </div>
                )}

                {/* Add new game field */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <input 
                    type="text" 
                    placeholder="Judul game baru (misal: GTA V)..." 
                    value={newGameName}
                    onChange={(e) => setNewGameName(e.target.value)}
                    className="input-glass"
                    disabled={saving}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      fontSize: '0.78rem',
                      backgroundColor: 'hsl(var(--panel-glass))',
                      color: 'hsl(var(--text-primary))'
                    }}
                  />
                  <button 
                    type="button" 
                    onClick={handleAddGame}
                    disabled={saving || !newGameName}
                    className="btn-secondary"
                    style={{ padding: '8px 16px', fontSize: '0.78rem', borderRadius: '8px' }}
                  >
                    Tambah Game
                  </button>
                </div>
              </div>

              {/* Achievements Checkbox Grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid hsla(var(--border-glass), 0.5)', paddingTop: '16px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'hsl(var(--text-primary))' }}>
                  Lencana & Pencapaian Anggota
                </label>
                <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', marginTop: '-6px' }}>
                  Centang lencana untuk menambahkannya ke pengguna, atau hapus centang untuk menghapusnya.
                </p>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                  gap: '10px',
                  maxHeight: '180px',
                  overflowY: 'auto',
                  padding: '10px',
                  backgroundColor: 'hsla(var(--border-glass), 0.05)',
                  border: '1px solid hsla(var(--border-glass), 0.4)',
                  borderRadius: '10px'
                }}>
                  {ACHIEVEMENTS_LIST.map(badge => {
                    const isChecked = editAchievements.includes(badge.id);
                    return (
                      <label key={badge.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        backgroundColor: isChecked ? 'hsla(var(--primary-glow), 0.08)' : 'transparent',
                        border: isChecked ? '1px solid hsla(var(--primary-glow), 0.25)' : '1px solid transparent',
                        transition: 'all 0.2s ease',
                        userSelect: 'none'
                      }}>
                        <input 
                          type="checkbox" 
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setEditAchievements(prev => prev.filter(id => id !== badge.id));
                            } else {
                              setEditAchievements(prev => [...prev, badge.id]);
                            }
                          }}
                          disabled={saving}
                          style={{
                            cursor: 'pointer',
                            accentColor: 'hsl(var(--primary-glow))'
                          }}
                        />
                        <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>{badge.emoji}</span>
                        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'hsl(var(--text-primary))', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{badge.name}</span>
                          <span style={{ fontSize: '0.65rem', color: 'hsl(var(--text-muted))', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={badge.desc}>
                            {badge.desc}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContext: 'flex-end', gap: '12px', borderTop: '1px solid hsla(var(--border-glass), 0.5)', paddingTop: '20px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setEditingMember(null)}
                  disabled={saving}
                  className="btn-secondary"
                  style={{ padding: '10px 20px', borderRadius: '10px', fontSize: '0.88rem' }}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="btn-primary"
                  style={{ padding: '10px 24px', borderRadius: '10px', fontSize: '0.88rem' }}
                >
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
