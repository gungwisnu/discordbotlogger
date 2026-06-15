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
  const [botStatus, setBotStatus] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState(null);
  const [statusSuccess, setStatusSuccess] = useState(null);

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
        setBotStatus(data.status);
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
      body: JSON.stringify({ status: botStatus })
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal memperbarui status bot.');
        return data;
      })
      .then(() => {
        setStatusSuccess('✓ Status bot berhasil diperbarui secara real-time!');
        setStatusLoading(false);
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'hsl(var(--primary-glow))' }}>
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              <h3 style={{ fontSize: '1.25rem', color: 'hsl(var(--text-primary))', fontWeight: '750', margin: 0 }}>
                Kustomisasi Status Aktivitas Bot
              </h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', marginTop: '-12px' }}>
              Ubah status aktivitas (Presence Playing) bot secara real-time di Discord. Status ini akan ditampilkan sebagai aktivitas bermain (*Playing [status]*).
            </p>

            <form onSubmit={handleUpdateStatus} style={{ 
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
                  placeholder="Masukkan status aktivitas baru (contoh: menghayal)"
                  value={botStatus}
                  onChange={(e) => setBotStatus(e.target.value)}
                  className="input-glass"
                  style={{
                    padding: '10px 14px',
                    fontSize: '0.88rem',
                    backgroundColor: 'hsl(var(--panel-glass))',
                    color: 'hsl(var(--text-primary))'
                  }}
                  disabled={statusLoading}
                />
                {statusError && (
                  <span style={{ fontSize: '0.75rem', color: 'hsl(var(--danger-crimson))', fontWeight: '600' }}>
                    {statusError}
                  </span>
                )}
                {statusSuccess && (
                  <span style={{ fontSize: '0.75rem', color: 'hsl(var(--success-emerald))', fontWeight: '600' }}>
                    {statusSuccess}
                  </span>
                )}
              </div>
              <button 
                type="submit"
                className="btn-primary"
                style={{ padding: '10px 24px', borderRadius: '10px', fontSize: '0.88rem', flexShrink: 0 }}
                disabled={statusLoading || !botStatus}
              >
                {statusLoading ? 'Menyimpan...' : 'Perbarui Status'}
              </button>
            </form>
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
