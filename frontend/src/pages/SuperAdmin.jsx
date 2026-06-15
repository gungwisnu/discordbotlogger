import React, { useState, useEffect } from 'react';
import { useApp } from '../App';

export default function SuperAdmin() {
  const { user } = useApp();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // AI Whitelist state hooks
  const [whitelist, setWhitelist] = useState([]);
  const [newUserId, setNewUserId] = useState('');
  const [whitelistLoading, setWhitelistLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Bot status config state hooks
  const [botStatus, setBotStatus] = useState({
    bot_status: '',
    bot_status_details: '',
    bot_status_state: '',
    bot_status_type: 0,
    bot_status_url: '',
    bot_status_show_uptime: true
  });
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState(null);
  const [statusSuccess, setStatusSuccess] = useState(null);

  const updateField = (key, val) => {
    setBotStatus(prev => ({
      ...prev,
      [key]: val
    }));
  };

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (stats && stats.uptime) {
      setElapsedSeconds(Math.floor(stats.uptime));
    }
  }, [stats]);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatElapsed = (totalSecs) => {
    if (totalSecs <= 0) return '00:00';
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    const pad = (num) => String(num).padStart(2, '0');

    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  const fetchBotStats = () => {
    setLoading(true);
    fetch('/api/admin/bot-stats')
      .then(res => {
        if (!res.ok) {
          if (res.status === 403) throw new Error('Akses ditolak: Anda bukan Super Admin.');
          throw new Error('Gagal mengambil data statistik bot.');
        }
        return res.json();
      })
      .then(data => {
        setStats(data);
        setError(null);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  };

  const fetchWhitelist = () => {
    setWhitelistLoading(true);
    fetch('/api/admin/ai-whitelist')
      .then(res => {
        if (!res.ok) throw new Error('Gagal memuat whitelist AI.');
        return res.json();
      })
      .then(data => {
        setWhitelist(data);
        setWhitelistLoading(false);
      })
      .catch(err => {
        console.error(err);
        setWhitelistLoading(false);
      });
  };

  const fetchBotStatus = () => {
    fetch('/api/admin/bot-status')
      .then(res => {
        if (!res.ok) throw new Error('Gagal memuat status bot.');
        return res.json();
      })
      .then(data => {
        setBotStatus({
          bot_status: data.bot_status || '',
          bot_status_details: data.bot_status_details || '',
          bot_status_state: data.bot_status_state || '',
          bot_status_type: data.bot_status_type !== undefined ? parseInt(data.bot_status_type) : 0,
          bot_status_url: data.bot_status_url || '',
          bot_status_show_uptime: data.bot_status_show_uptime !== undefined ? (data.bot_status_show_uptime === true || data.bot_status_show_uptime === 'true') : true
        });
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchBotStats();
    fetchWhitelist();
    fetchBotStatus();
  }, []);

  const handleUpdateStatus = (e) => {
    e.preventDefault();
    setStatusError(null);
    setStatusSuccess(null);
    setStatusLoading(true);

    fetch('/api/admin/bot-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(botStatus)
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal memperbarui status bot.');
        return data;
      })
      .then((data) => {
        setStatusSuccess('✓ Status bot berhasil diperbarui secara real-time!');
        setStatusLoading(false);
        setBotStatus({
          bot_status: data.bot_status || '',
          bot_status_details: data.bot_status_details || '',
          bot_status_state: data.bot_status_state || '',
          bot_status_type: data.bot_status_type !== undefined ? parseInt(data.bot_status_type) : 0,
          bot_status_url: data.bot_status_url || '',
          bot_status_show_uptime: data.bot_status_show_uptime !== undefined ? (data.bot_status_show_uptime === true || data.bot_status_show_uptime === 'true') : true
        });
      })
      .catch(err => {
        setStatusError(err.message);
        setStatusLoading(false);
      });
  };

  const handleAddWhitelist = (e) => {
    e.preventDefault();
    if (!newUserId || !/^\d{17,19}$/.test(newUserId)) {
      setActionError('Harap masukkan Discord User ID 17-19 digit angka yang valid.');
      return;
    }
    setActionError(null);
    setActionSuccess(null);
    setWhitelistLoading(true);

    fetch('/api/admin/ai-whitelist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: newUserId })
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal menambahkan user ke whitelist.');
        return data;
      })
      .then(() => {
        setActionSuccess('✓ Pengguna berhasil ditambahkan ke whitelist AI!');
        setNewUserId('');
        fetchWhitelist();
      })
      .catch(err => {
        setActionError(err.message);
        setWhitelistLoading(false);
      });
  };

  const handleRemoveWhitelist = (userId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus izin khusus AI untuk pengguna ini?')) return;
    setActionError(null);
    setActionSuccess(null);
    setWhitelistLoading(true);

    fetch(`/api/admin/ai-whitelist/${userId}`, {
      method: 'DELETE'
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal menghapus user dari whitelist.');
        return data;
      })
      .then(() => {
        setActionSuccess('✓ Pengguna berhasil dihapus dari whitelist AI.');
        fetchWhitelist();
      })
      .catch(err => {
        setActionError(err.message);
        setWhitelistLoading(false);
      });
  };

  const formatUptime = (secs) => {
    const days = Math.floor(secs / (3600 * 24));
    const hours = Math.floor((secs % (3600 * 24)) / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    
    let parts = [];
    if (days > 0) parts.push(`${days} hari`);
    if (hours > 0) parts.push(`${hours} jam`);
    if (minutes > 0) parts.push(`${minutes} menit`);
    return parts.join(' ') || '0 menit';
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const dm = 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  if (loading && !stats) {
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

  if (error) {
    return (
      <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', borderColor: 'hsla(var(--danger-crimson), 0.3)' }}>
        <h3 style={{ color: 'hsl(var(--danger-crimson))', fontWeight: '750' }}>Terjadi Kesalahan</h3>
        <p style={{ marginTop: '10px', color: 'hsl(var(--text-secondary))' }}>
          {error}
        </p>
        <button className="btn-secondary" onClick={fetchBotStats} style={{ marginTop: '20px', padding: '8px 16px', borderRadius: '8px' }}>
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', color: 'hsl(var(--text-primary))', fontWeight: '800' }}>Super Admin Dashboard</h2>
          <p style={{ color: 'hsl(var(--text-secondary))', marginTop: '4px' }}>Panel kontrol pusat untuk memantau server bot Discord, latensi, dan metrik sistem.</p>
        </div>
        
        <button 
          className="btn-secondary" 
          onClick={() => { fetchBotStats(); fetchWhitelist(); fetchBotStatus(); }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', fontSize: '0.88rem' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 4v6h-6"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          Segarkan Data
        </button>
      </div>

      {stats && (
        <>
          {/* Bot System Health Grid */}
          <div className="stats-card-container">
            
            {/* Bot Status Card */}
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ color: 'hsl(var(--text-muted))', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status Bot</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                <span style={{ 
                  width: '10px', 
                  height: '10px', 
                  borderRadius: '50%', 
                  backgroundColor: stats.isReady ? 'hsl(var(--success-emerald))' : 'hsl(var(--danger-crimson))',
                  boxShadow: stats.isReady ? '0 0 10px hsl(var(--success-emerald))' : 'none',
                  display: 'inline-block' 
                }} />
                <h3 style={{ fontSize: '1.5rem', color: 'hsl(var(--text-primary))', fontFamily: 'var(--font-display)', fontWeight: '800', margin: 0 }}>
                  {stats.isReady ? 'Aktif / Online' : 'Offline / Error'}
                </h3>
              </div>
            </div>

            {/* WebSocket Ping Card */}
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ color: 'hsl(var(--text-muted))', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>WebSocket Ping</span>
              <h2 style={{ fontSize: '2.2rem', color: 'hsl(var(--text-primary))', marginTop: '10px', fontFamily: 'var(--font-display)', fontWeight: '800', margin: '10px 0 0 0' }}>
                {stats.ping >= 0 ? `${stats.ping} ms` : 'N/A'}
              </h2>
            </div>

            {/* Bot Uptime Card */}
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ color: 'hsl(var(--text-muted))', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Uptime Bot</span>
              <h3 style={{ fontSize: '1.25rem', color: 'hsl(var(--text-primary))', marginTop: '14px', fontFamily: 'var(--font-display)', fontWeight: '700', margin: '10px 0 0 0', lineHeight: '1.4' }}>
                {formatUptime(stats.uptime)}
              </h3>
            </div>

            {/* Memory Usage Card */}
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ color: 'hsl(var(--text-muted))', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Memory RSS</span>
              <h2 style={{ fontSize: '2rem', color: 'hsl(var(--text-primary))', marginTop: '10px', fontFamily: 'var(--font-display)', fontWeight: '800', margin: '10px 0 0 0' }}>
                {formatBytes(stats.memory?.rss)}
              </h2>
            </div>

          </div>

          {/* Bot Status Configuration Panel */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes spin-slow {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
              .spinning-vinyl {
                animation: spin-slow 6s linear infinite;
              }
              @keyframes pulse-glow {
                0%, 100% { box-shadow: 0 0 10px hsla(250, 85%, 65%, 0.4); }
                50% { box-shadow: 0 0 20px hsla(250, 85%, 65%, 0.85); }
              }
              .streaming-pulse {
                animation: pulse-glow-purple 2s ease-in-out infinite;
              }
              @keyframes pulse-glow-purple {
                0%, 100% { box-shadow: 0 0 8px rgba(162, 96, 252, 0.4); }
                50% { box-shadow: 0 0 18px rgba(162, 96, 252, 0.85); }
              }
              .custom-checkbox-container {
                display: flex;
                align-items: center;
                gap: 8px;
                cursor: pointer;
                user-select: none;
              }
              .custom-checkbox-box {
                width: 18px;
                height: 18px;
                border-radius: 4px;
                border: 1px solid hsl(var(--border-glass));
                background: hsla(var(--bg-space), 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
              }
              .custom-checkbox-box.checked {
                background: hsl(var(--primary-glow));
                border-color: hsl(var(--primary-glow));
              }
            `}} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'hsl(var(--primary-glow))' }}>
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              <h3 style={{ fontSize: '1.25rem', color: 'hsl(var(--text-primary))', fontWeight: '750', margin: 0 }}>
                Kustomisasi Rich Presence Bot
              </h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', marginTop: '-12px' }}>
              Sesuaikan aktivitas Rich Presence bot secara dinamis. Perubahan akan langsung disinkronkan ke Discord tanpa merestart bot.
            </p>

            <div className="settings-grid">
              {/* Form Input Status */}
              <form onSubmit={handleUpdateStatus} style={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: '16px',
                backgroundColor: 'hsla(var(--border-glass), 0.04)', 
                padding: '20px', 
                borderRadius: '12px',
                border: '1px solid hsl(var(--border-glass))'
              }}>
                {/* Status Type & Status Name (Side-by-side) */}
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '150px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.78rem', color: 'hsl(var(--text-muted))', fontWeight: '700', textTransform: 'uppercase' }}>Tipe Aktivitas</label>
                    <select 
                      value={botStatus.bot_status_type}
                      onChange={(e) => updateField('bot_status_type', parseInt(e.target.value))}
                      className="input-glass"
                      style={{
                        padding: '10px 14px',
                        fontSize: '0.88rem',
                        backgroundColor: 'hsl(var(--panel-glass))',
                        color: 'hsl(var(--text-primary))',
                        cursor: 'pointer'
                      }}
                      disabled={statusLoading}
                    >
                      <option value="0">Bermain (Playing)</option>
                      <option value="1">Streaming (Live)</option>
                      <option value="2">Mendengarkan (Listening)</option>
                      <option value="3">Menonton (Watching)</option>
                      <option value="5">Bertanding (Competing)</option>
                    </select>
                  </div>

                  <div style={{ flex: 2, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.78rem', color: 'hsl(var(--text-muted))', fontWeight: '700', textTransform: 'uppercase' }}>Nama Status / Aktivitas</label>
                    <input 
                      type="text"
                      placeholder="Masukkan nama aktivitas (contoh: menghayal)"
                      value={botStatus.bot_status}
                      onChange={(e) => updateField('bot_status', e.target.value)}
                      className="input-glass"
                      style={{
                        padding: '10px 14px',
                        fontSize: '0.88rem',
                        backgroundColor: 'hsl(var(--panel-glass))',
                        color: 'hsl(var(--text-primary))'
                      }}
                      maxLength={128}
                      disabled={statusLoading}
                    />
                  </div>
                </div>

                {/* Conditional Stream URL (only visible when type is 1 - Streaming) */}
                {botStatus.bot_status_type === 1 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.78rem', color: 'hsl(var(--text-muted))', fontWeight: '700', textTransform: 'uppercase' }}>Link Streaming (Twitch / YouTube)</label>
                    <input 
                      type="text"
                      placeholder="https://twitch.tv/username"
                      value={botStatus.bot_status_url}
                      onChange={(e) => updateField('bot_status_url', e.target.value)}
                      className="input-glass"
                      style={{
                        padding: '10px 14px',
                        fontSize: '0.88rem',
                        backgroundColor: 'hsl(var(--panel-glass))',
                        color: 'hsl(var(--text-primary))'
                      }}
                      disabled={statusLoading}
                    />
                  </div>
                )}

                {/* Details & State */}
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.78rem', color: 'hsl(var(--text-muted))', fontWeight: '700', textTransform: 'uppercase' }}>Detail (Details)</label>
                    <input 
                      type="text"
                      placeholder="Contoh: Bermain Sendiri"
                      value={botStatus.bot_status_details}
                      onChange={(e) => updateField('bot_status_details', e.target.value)}
                      className="input-glass"
                      style={{
                        padding: '10px 14px',
                        fontSize: '0.88rem',
                        backgroundColor: 'hsl(var(--panel-glass))',
                        color: 'hsl(var(--text-primary))'
                      }}
                      maxLength={128}
                      disabled={statusLoading}
                    />
                  </div>

                  <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.78rem', color: 'hsl(var(--text-muted))', fontWeight: '700', textTransform: 'uppercase' }}>Kondisi (State)</label>
                    <input 
                      type="text"
                      placeholder="Contoh: pan!help for more info"
                      value={botStatus.bot_status_state}
                      onChange={(e) => updateField('bot_status_state', e.target.value)}
                      className="input-glass"
                      style={{
                        padding: '10px 14px',
                        fontSize: '0.88rem',
                        backgroundColor: 'hsl(var(--panel-glass))',
                        color: 'hsl(var(--text-primary))'
                      }}
                      maxLength={128}
                      disabled={statusLoading}
                    />
                  </div>
                </div>

                {/* Uptime Toggle & Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginTop: '4px' }}>
                  <div 
                    className="custom-checkbox-container"
                    onClick={() => updateField('bot_status_show_uptime', !botStatus.bot_status_show_uptime)}
                  >
                    <div className={`custom-checkbox-box ${botStatus.bot_status_show_uptime ? 'checked' : ''}`}>
                      {botStatus.bot_status_show_uptime && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="1.5 4 4 6.5 8.5 1.5"/>
                        </svg>
                      )}
                    </div>
                    <span style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', fontWeight: '500' }}>Tampilkan Durasi Aktif (Elapsed Time)</span>
                  </div>

                  <button 
                    type="submit"
                    className="btn-primary"
                    style={{ padding: '10px 24px', borderRadius: '10px', fontSize: '0.88rem' }}
                    disabled={statusLoading || !botStatus.bot_status}
                  >
                    {statusLoading ? 'Menyimpan...' : 'Perbarui Status'}
                  </button>
                </div>

                {/* Error/Success Feedbacks */}
                {(statusError || statusSuccess) && (
                  <div style={{ marginTop: '8px' }}>
                    {statusError && (
                      <span style={{ fontSize: '0.75rem', color: 'hsl(var(--danger-crimson))', fontWeight: '600', display: 'block' }}>
                        {statusError}
                      </span>
                    )}
                    {statusSuccess && (
                      <span style={{ fontSize: '0.75rem', color: 'hsl(var(--success-emerald))', fontWeight: '600', display: 'block' }}>
                        {statusSuccess}
                      </span>
                    )}
                  </div>
                )}
              </form>

              {/* Live Discord Popout Profile Visualizer */}
              <div className="glass-panel" style={{ 
                padding: 0, 
                backgroundColor: 'rgba(15, 18, 36, 0.45)', 
                backdropFilter: 'blur(16px)',
                borderColor: botStatus.bot_status_type === 1 ? 'rgba(162, 96, 252, 0.35)' : 'hsl(var(--border-glass))',
                boxShadow: botStatus.bot_status_type === 1 ? '0 12px 40px 0 rgba(0, 0, 0, 0.5), 0 0 20px rgba(162, 96, 252, 0.15)' : 'var(--shadow-panel)',
                borderRadius: '16px',
                overflow: 'hidden',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {/* Banner */}
                <div style={{
                  height: '75px',
                  background: botStatus.bot_status_type === 1 
                    ? 'linear-gradient(135deg, #593695 0%, #a260fc 100%)' 
                    : 'linear-gradient(135deg, hsl(var(--primary-glow)) 0%, hsl(var(--accent-cyan)) 100%)',
                  position: 'relative'
                }} />

                {/* Avatar Overlap */}
                <div style={{
                  width: '74px',
                  height: '74px',
                  borderRadius: '50%',
                  border: '5px solid rgba(15, 18, 36, 0.95)',
                  position: 'absolute',
                  top: '38px',
                  left: '16px',
                  backgroundColor: '#313338',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'visible'
                }}>
                  {/* Default Bot Icon using styled SVG */}
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary-glow))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 5px hsla(var(--primary-glow), 0.3))' }}>
                    <path d="M12 2a10 10 0 0 0-10 10c0 5.523 4.477 10 10 10s10-4.477 10-10A10 10 0 0 0 12 2z"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>

                  {/* Status indicator dot */}
                  <div style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    border: '3px solid rgba(15, 18, 36, 0.95)',
                    backgroundColor: botStatus.bot_status_type === 1 ? '#a260fc' : '#23a55a',
                    position: 'absolute',
                    bottom: '-2px',
                    right: '-2px',
                    boxShadow: botStatus.bot_status_type === 1 ? '0 0 6px #a260fc' : '0 0 6px #23a55a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {botStatus.bot_status_type === 1 && (
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="white">
                        <polygon points="5 3 19 12 5 21 5 3"/>
                      </svg>
                    )}
                  </div>
                </div>

                {/* User Content */}
                <div style={{ padding: '48px 16px 16px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Name and Handle */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.05rem', fontWeight: '800', color: 'white', fontFamily: 'var(--font-display)' }}>
                        Pandu
                      </span>
                      <span style={{ 
                        backgroundColor: '#5865F2', 
                        color: 'white', 
                        fontSize: '0.62rem', 
                        fontWeight: '800', 
                        padding: '1px 5px', 
                        borderRadius: '3px', 
                        marginLeft: '8px',
                        letterSpacing: '0.03em'
                      }}>
                        BOT
                      </span>
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.45)', display: 'block', marginTop: '1px' }}>
                      pandubot
                    </span>
                  </div>

                  {/* Divider */}
                  <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.08)', margin: '4px 0' }} />

                  {/* Rich Presence Activity */}
                  <div>
                    <span style={{ 
                      fontSize: '0.68rem', 
                      fontWeight: '800', 
                      color: 'rgba(255, 255, 255, 0.5)', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.05em',
                      display: 'block',
                      marginBottom: '8px'
                    }}>
                      {botStatus.bot_status_type === 0 && 'Melakukan Aktivitas'}
                      {botStatus.bot_status_type === 1 && 'Sedang Live'}
                      {botStatus.bot_status_type === 2 && 'Mendengarkan'}
                      {botStatus.bot_status_type === 3 && 'Menonton'}
                      {botStatus.bot_status_type === 5 && 'Bertanding'}
                    </span>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      {/* Interactive/Animated SVG Large Image based on type */}
                      <div className={botStatus.bot_status_type === 1 ? 'streaming-pulse' : ''} style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        overflow: 'hidden'
                      }}>
                        {/* Type 0: Playing (Game Controller) */}
                        {botStatus.bot_status_type === 0 && (
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--accent-cyan))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 4px hsla(180, 85%, 50%, 0.3))' }}>
                            <line x1="6" y1="12" x2="10" y2="12"/>
                            <line x1="8" y1="10" x2="8" y2="14"/>
                            <line x1="15" y1="13" x2="15.01" y2="13"/>
                            <line x1="18" y1="11" x2="18.01" y2="11"/>
                            <rect x="2" y="6" width="20" height="12" rx="3"/>
                          </svg>
                        )}

                        {/* Type 1: Streaming (Signal waves / Purple Broadcast) */}
                        {botStatus.bot_status_type === 1 && (
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a260fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 5px rgba(162, 96, 252, 0.4))' }}>
                            <path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1"/>
                            <polygon points="12 7 17 12 12 17 12 7"/>
                          </svg>
                        )}

                        {/* Type 2: Listening (Vinyl disc spinning) */}
                        {botStatus.bot_status_type === 2 && (
                          <svg className="spinning-vinyl" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary-glow))" strokeWidth="2" style={{ filter: 'drop-shadow(0 0 4px hsla(250, 85%, 65%, 0.35))' }}>
                            <circle cx="12" cy="12" r="10"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                        )}

                        {/* Type 3: Watching (Tv/Monitor reel) */}
                        {botStatus.bot_status_type === 3 && (
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--warning-amber))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 4px hsla(35, 90%, 50%, 0.3))' }}>
                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                            <line x1="8" y1="21" x2="16" y2="21"/>
                            <line x1="12" y1="17" x2="12" y2="21"/>
                          </svg>
                        )}

                        {/* Type 5: Competing (Trophy) */}
                        {botStatus.bot_status_type === 5 && (
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="goldenrod" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 4px rgba(218, 165, 32, 0.4))' }}>
                            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
                            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                            <path d="M4 22h16"/>
                            <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"/>
                            <path d="M12 2a6 6 0 0 1 6 6v5a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8a6 6 0 0 1 6-6z"/>
                          </svg>
                        )}
                      </div>

                      {/* Text descriptions */}
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                        <span style={{ fontSize: '0.86rem', fontWeight: '800', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {botStatus.bot_status || 'menghayal'}
                        </span>
                        
                        {botStatus.bot_status_details && (
                          <span style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '1px' }}>
                            {botStatus.bot_status_details}
                          </span>
                        )}

                        {botStatus.bot_status_state && (
                          <span style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '1px' }}>
                            {botStatus.bot_status_state}
                          </span>
                        )}

                        {botStatus.bot_status_show_uptime && (
                          <span style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.55)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {formatElapsed(elapsedSeconds)} elapsed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Aggregated Stats Row */}
          <div className="super-admin-row">
            <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                width: '42px', 
                height: '42px', 
                borderRadius: '10px', 
                backgroundColor: 'hsla(var(--primary-glow), 0.1)', 
                border: '1px solid hsla(var(--primary-glow), 0.25)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'hsl(var(--primary-glow))' 
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: '600', textTransform: 'uppercase' }}>Cached Users Terpantau</span>
                <h4 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'hsl(var(--text-primary))', marginTop: '2px', margin: 0 }}>
                  {stats.stats?.usersCount?.toLocaleString() || 0} pengguna
                </h4>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ 
                width: '42px', 
                height: '42px', 
                borderRadius: '10px', 
                backgroundColor: 'hsla(var(--primary-glow), 0.1)', 
                border: '1px solid hsla(var(--primary-glow), 0.25)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'hsl(var(--primary-glow))' 
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="8" rx="1.5"/>
                  <rect x="2" y="14" width="20" height="8" rx="1.5"/>
                  <line x1="6" y1="6" x2="6.01" y2="6"/>
                  <line x1="6" y1="18" x2="6.01" y2="18"/>
                </svg>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: '600', textTransform: 'uppercase' }}>Total Guilds Aktif</span>
                <h4 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'hsl(var(--text-primary))', marginTop: '2px', margin: 0 }}>
                  {stats.stats?.guildsCount || 0} server
                </h4>
              </div>
            </div>
          </div>

          {/* AI Whitelist Management Panel */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'hsl(var(--primary-glow))' }}>
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                <path d="M12 6v12"/>
                <path d="M8 10h8"/>
              </svg>
              <h3 style={{ fontSize: '1.25rem', color: 'hsl(var(--text-primary))', fontWeight: '750', margin: 0 }}>
                Manajemen Izin Fitur AI (Whitelist ID)
              </h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', marginTop: '-12px' }}>
              Tambahkan Discord User ID agar pengguna tersebut dapat mengaktifkan fitur asisten AI (DeepSeek) di server yang mereka kelola.
            </p>

            {/* Add User Form */}
            <form onSubmit={handleAddWhitelist} style={{ 
              display: 'flex', 
              gap: '12px', 
              alignItems: 'flex-start', 
              flexWrap: 'wrap', 
              backgroundColor: 'hsla(var(--border-glass), 0.04)', 
              padding: '16px', 
              borderRadius: '12px',
              border: '1px solid hsl(var(--border-glass))'
            }}>
              <div style={{ flex: 1, minWidth: '250px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <input 
                  type="text"
                  placeholder="Masukkan Discord User ID (contoh: 333105200942546946)"
                  value={newUserId}
                  onChange={(e) => setNewUserId(e.target.value)}
                  className="input-glass"
                  style={{
                    padding: '10px 14px',
                    fontSize: '0.88rem',
                    backgroundColor: 'hsl(var(--panel-glass))',
                    color: 'hsl(var(--text-primary))'
                  }}
                  disabled={whitelistLoading}
                />
                {actionError && (
                  <span style={{ fontSize: '0.75rem', color: 'hsl(var(--danger-crimson))', fontWeight: '600' }}>
                    {actionError}
                  </span>
                )}
                {actionSuccess && (
                  <span style={{ fontSize: '0.75rem', color: 'hsl(var(--success-emerald))', fontWeight: '600' }}>
                    {actionSuccess}
                  </span>
                )}
              </div>
              <button 
                type="submit"
                className="btn-primary"
                style={{ padding: '10px 24px', borderRadius: '10px', fontSize: '0.88rem', flexShrink: 0 }}
                disabled={whitelistLoading || !newUserId}
              >
                {whitelistLoading ? 'Memproses...' : 'Tambah Izin'}
              </button>
            </form>

            {/* Whitelisted Users List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Daftar Pengguna Berizin Khusus ({whitelist.length})
              </span>
              
              {whitelist.length > 0 ? (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                  gap: '12px',
                  maxHeight: '300px',
                  overflowY: 'auto',
                  paddingRight: '4px'
                }}>
                  {whitelist.map((w) => (
                    <div 
                      key={w.id}
                      className="glass-panel"
                      style={{
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        backgroundColor: 'hsla(var(--border-glass), 0.02)',
                        borderColor: 'hsl(var(--border-glass))'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        {w.avatarUrl ? (
                          <img src={w.avatarUrl} alt={w.username} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                        ) : (
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'hsl(var(--primary-glow))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem' }}>
                            {w.username?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'hsl(var(--text-primary))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={w.username}>
                            {w.username}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'hsl(var(--text-muted))', fontFamily: 'monospace' }}>
                            ID: {w.id}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveWhitelist(w.id)}
                        title="Hapus Izin"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'hsl(var(--danger-crimson))',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '6px',
                          borderRadius: '6px',
                          transition: 'all 0.2s ease'
                        }}
                        className="sidebar-link-hover"
                        disabled={whitelistLoading}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          <line x1="10" y1="11" x2="10" y2="17"/>
                          <line x1="14" y1="11" x2="14" y2="17"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ 
                  padding: '24px', 
                  textAlign: 'center', 
                  color: 'hsl(var(--text-muted))', 
                  fontSize: '0.85rem',
                  border: '1px dashed hsl(var(--border-glass))',
                  borderRadius: '12px'
                }}>
                  Belum ada Discord User ID yang terdaftar dalam Whitelist AI.
                </div>
              )}
            </div>
          </div>

          {/* Joined Guilds Detailed List */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'hsl(var(--text-primary))', fontWeight: '750', margin: 0 }}>
              Daftar Seluruh Server Terkoneksi ({stats.guilds?.length || 0})
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', marginTop: '-12px' }}>
              Berikut adalah seluruh server tempat bot Anda bergabung saat ini.
            </p>

            {stats.guilds && stats.guilds.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stats.guilds.map((g) => (
                  <div 
                    key={g.id}
                    className="glass-panel super-admin-guild-card"
                    style={{
                      padding: '16px 20px',
                      backgroundColor: 'hsla(var(--border-glass), 0.04)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {/* Icon */}
                    {g.iconUrl ? (
                      <img src={g.iconUrl} alt={g.name} style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'hsl(var(--primary-glow))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {g.name.charAt(0)}
                      </div>
                    )}

                    {/* Server Info */}
                    <div>
                      <h4 style={{ fontSize: '0.92rem', fontWeight: '700', color: 'hsl(var(--text-primary))', margin: 0 }}>
                        {g.name}
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontFamily: 'monospace' }}>
                        ID: {g.id}
                      </span>
                    </div>

                    {/* Member Count */}
                    <div>
                      <span style={{ fontSize: '0.72rem', color: 'hsl(var(--text-muted))', fontWeight: '600', textTransform: 'uppercase' }}>Anggota</span>
                      <h4 style={{ fontSize: '0.92rem', fontWeight: '700', color: 'hsl(var(--text-primary))', margin: '2px 0 0 0' }}>
                        {g.memberCount?.toLocaleString() || 0} user
                      </h4>
                    </div>

                    {/* Joined At */}
                    <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'hsl(var(--text-muted))', fontWeight: '500' }}>
                      <span style={{ color: 'hsl(var(--text-secondary))', fontWeight: '600', display: 'block' }}>Joined At</span>
                      {g.joinedAt ? new Date(g.joinedAt).toLocaleDateString() : 'N/A'}
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '30px', textAlign: 'center', color: 'hsl(var(--text-muted))', fontWeight: '500' }}>
                Bot belum bergabung ke server manapun saat ini.
              </div>
            )}

          </div>
        </>
      )}

    </div>
  );
}
