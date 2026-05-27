import React, { useState, useEffect } from 'react';
import { useApp } from '../App';

export default function Logs() {
  const { selectedGuild } = useApp();
  
  // Tab State: 'moderation' or 'settings'
  const [activeTab, setActiveTab] = useState('moderation');
  
  // Moderation Logs State
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 15;
  
  // Settings History State
  const [settingsHistory, setSettingsHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  // Global search query
  const [search, setSearch] = useState('');

  // Fetch Moderation Logs
  useEffect(() => {
    if (!selectedGuild) return;
    setLoading(true);
    
    const offset = page * limit;
    fetch(`/api/guilds/${selectedGuild.id}/logs?limit=${limit}&offset=${offset}`)
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        setLogs(data.logs || []);
        setTotal(data.total || 0);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load logs:', err);
        setLoading(false);
      });
  }, [selectedGuild, page]);

  // Fetch Settings History when activeTab changes to 'settings'
  const fetchSettingsHistory = () => {
    if (!selectedGuild) return;
    setLoadingHistory(true);
    fetch(`/api/guilds/${selectedGuild.id}/settings-history`)
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        setSettingsHistory(data || []);
        setLoadingHistory(false);
      })
      .catch(err => {
        console.error('Failed to load settings history:', err);
        setLoadingHistory(false);
      });
  };

  useEffect(() => {
    if (activeTab === 'settings') {
      fetchSettingsHistory();
    }
  }, [selectedGuild, activeTab]);

  // Filter logs locally based on search query
  const filteredLogs = logs.filter(log => {
    const q = search.toLowerCase();
    return (
      log.action?.toLowerCase().includes(q) ||
      log.user_id?.toLowerCase().includes(q) ||
      log.executor_id?.toLowerCase().includes(q) ||
      log.reason?.toLowerCase().includes(q)
    );
  });

  // Filter settings history locally based on search query
  const filteredSettingsHistory = settingsHistory.filter(item => {
    const q = search.toLowerCase();
    return (
      item.executor?.toLowerCase().includes(q) ||
      item.changes?.some(change => 
        change.label?.toLowerCase().includes(q) || 
        change.field?.toLowerCase().includes(q) ||
        String(change.old)?.toLowerCase().includes(q) ||
        String(change.new)?.toLowerCase().includes(q)
      )
    );
  });

  const getActionStyle = (action) => {
    switch (action) {
      case 'BAN':
        return { color: 'hsl(var(--danger-crimson))', bg: 'hsla(var(--danger-crimson), 0.1)', border: 'hsla(var(--danger-crimson), 0.25)', label: 'BANNED' };
      case 'UNBAN':
        return { color: 'hsl(var(--success-emerald))', bg: 'hsla(var(--success-emerald), 0.1)', border: 'hsla(var(--success-emerald), 0.25)', label: 'UNBANNED' };
      case 'KICK':
        return { color: 'hsl(var(--warning-amber))', bg: 'hsla(var(--warning-amber), 0.1)', border: 'hsla(var(--warning-amber), 0.25)', label: 'KICKED' };
      case 'TIMEOUT':
        return { color: 'hsl(var(--warning-amber))', bg: 'hsla(var(--warning-amber), 0.1)', border: 'hsla(var(--warning-amber), 0.25)', label: 'TIMEOUT' };
      case 'UNTIMEOUT':
        return { color: 'hsl(var(--accent-cyan))', bg: 'hsla(var(--accent-cyan), 0.1)', border: 'hsla(var(--accent-cyan), 0.25)', label: 'UNTIMEOUT' };
      default:
        return { color: 'hsl(var(--text-primary))', bg: 'hsla(var(--border-glass), 0.12)', border: 'hsl(var(--border-glass))', label: 'LOGGED' };
    }
  };

  // Humanize settings field labels for the audit trail
  const formatFieldLabel = (field, label) => {
    if (label) return label;
    switch (field) {
      case 'log_channel_id': return 'Saluran Log Utama';
      case 'embed_color': return 'Warna Tema Embed';
      case 'ai_model': return 'Model AI (DeepSeek)';
      case 'welcome_enabled': return 'Status Sapaan Welcome';
      case 'welcome_channel_id': return 'Saluran Sapaan Welcome';
      case 'welcome_message': return 'Pesan Sapaan Welcome';
      case 'autorole_enabled': return 'Status Peran Otomatis';
      case 'autorole_role_id': return 'Peran Yang Diberikan';
      case 'achievement_channel_id': return 'Saluran Notifikasi Pencapaian';
      default: return field;
    }
  };

  const searchPlaceholder = activeTab === 'moderation' 
    ? "Cari berdasarkan aksi, ID pengguna, moderator, atau alasan..."
    : "Cari berdasarkan nama pengubah, jenis setelan, atau nilai baru...";

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Header Panel */}
      <div>
        <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', color: 'hsl(var(--text-primary))', fontWeight: '800' }}>Audit Logs Feed</h2>
        <p style={{ color: 'hsl(var(--text-secondary))', marginTop: '4px' }}>Pantau riwayat penegakan disiplin server serta aktivitas setelan bot secara real-time.</p>
      </div>

      {/* Tabs Selector Bar */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid hsl(var(--border-glass))', paddingBottom: '12px' }}>
        <button 
          onClick={() => {
            setActiveTab('moderation');
            setSearch('');
          }}
          style={{
            background: activeTab === 'moderation' ? 'hsla(var(--primary-glow), 0.1)' : 'transparent',
            border: '1px solid',
            borderColor: activeTab === 'moderation' ? 'hsla(var(--primary-glow), 0.3)' : 'transparent',
            color: activeTab === 'moderation' ? 'hsl(var(--primary-glow))' : 'hsl(var(--text-secondary))',
            padding: '10px 20px',
            borderRadius: '10px',
            fontWeight: '700',
            fontSize: '0.88rem',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            fontFamily: 'var(--font-display)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          className="sidebar-link-hover"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          Log Moderasi Server
        </button>
        
        <button 
          onClick={() => {
            setActiveTab('settings');
            setSearch('');
          }}
          style={{
            background: activeTab === 'settings' ? 'hsla(var(--primary-glow), 0.1)' : 'transparent',
            border: '1px solid',
            borderColor: activeTab === 'settings' ? 'hsla(var(--primary-glow), 0.3)' : 'transparent',
            color: activeTab === 'settings' ? 'hsl(var(--primary-glow))' : 'hsl(var(--text-secondary))',
            padding: '10px 20px',
            borderRadius: '10px',
            fontWeight: '700',
            fontSize: '0.88rem',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            fontFamily: 'var(--font-display)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          className="sidebar-link-hover"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          Riwayat Setelan Bot
        </button>
      </div>

      {/* Control Filters Bar */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px', display: 'flex', alignItems: 'center' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '14px', color: 'hsl(var(--text-muted))' }}>
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input 
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-glass"
            style={{ paddingLeft: '40px' }}
          />
        </div>
        <div style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', fontWeight: '500' }}>
          {activeTab === 'moderation' 
            ? `Menampilkan ${filteredLogs.length} hasil dari total ${total} log moderasi`
            : `Menampilkan ${filteredSettingsHistory.length} perubahan konfigurasi`
          }
        </div>
      </div>

      {/* TAB 1: Log Moderasi Server */}
      {activeTab === 'moderation' && (
        <>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                border: '3px solid hsla(var(--primary-glow), 0.15)',
                borderTopColor: 'hsl(var(--primary-glow))',
                borderRadius: '50%',
                animation: 'spin 1.2s linear infinite'
              }} />
            </div>
          ) : filteredLogs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {filteredLogs.map((log) => {
                const style = getActionStyle(log.action);
                return (
                  <div 
                    key={log.id} 
                    className="glass-panel"
                    style={{
                      padding: '18px 24px',
                      display: 'grid',
                      gridTemplateColumns: '140px 1fr 180px',
                      alignItems: 'center',
                      gap: '20px',
                      borderLeft: `4px solid ${style.color}`,
                      boxShadow: 'var(--shadow-panel)'
                    }}
                  >
                    {/* Action Tag Badge */}
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      color: style.color,
                      backgroundColor: style.bg,
                      border: `1px solid ${style.border}`,
                      textAlign: 'center',
                      width: 'fit-content',
                      fontFamily: 'var(--font-display)',
                      letterSpacing: '0.04em'
                    }}>
                      {style.label}
                    </div>

                    {/* Event Contents Detail */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ fontSize: '0.95rem', color: 'hsl(var(--text-primary))', lineHeight: '1.4' }}>
                        <strong>ID Pengguna:</strong> <span style={{ fontFamily: 'monospace', color: 'hsl(var(--accent-cyan))', fontWeight: '600' }}>{log.user_id}</span>
                        <span style={{ color: 'hsl(var(--text-muted))', margin: '0 8px' }}>•</span>
                        <strong>Mod:</strong> <span style={{ fontFamily: 'monospace', color: 'hsl(var(--text-secondary))', fontWeight: '500' }}>{log.executor_id}</span>
                      </div>
                      
                      <div style={{ fontSize: '0.88rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.4' }}>
                        <strong>Alasan:</strong> {log.reason}
                      </div>
                    </div>

                    {/* Event Timestamp */}
                    <div style={{ 
                      textAlign: 'right', 
                      fontSize: '0.82rem', 
                      color: 'hsl(var(--text-muted))',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      fontWeight: '500'
                    }}>
                      <span style={{ color: 'hsl(var(--text-primary))', fontWeight: '600' }}>{new Date(log.timestamp).toLocaleDateString()}</span>
                      <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                  </div>
                );
              })}

              {/* Glassmorphic Pagination */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                <button 
                  className="btn-secondary" 
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  style={{ padding: '10px 20px', fontSize: '0.85rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"/>
                    <polyline points="12 19 5 12 12 5"/>
                  </svg>
                  Sebelumnya
                </button>
                <span style={{ fontSize: '0.9rem', color: 'hsl(var(--text-muted))', fontWeight: '600' }}>
                  Halaman {page + 1} dari {Math.ceil(total / limit) || 1}
                </span>
                <button 
                  className="btn-secondary" 
                  onClick={() => setPage(p => p + 1)}
                  disabled={(page + 1) * limit >= total}
                  style={{ padding: '10px 20px', fontSize: '0.85rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  Berikutnya
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                    <polyline points="12 5 19 12 12 19"/>
                  </svg>
                </button>
              </div>

            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
              <h3 style={{ color: 'hsl(var(--text-primary))', fontWeight: '750' }}>Tidak Ada Catatan Log Moderasi</h3>
              <p style={{ marginTop: '10px', color: 'hsl(var(--text-secondary))' }}>
                Belum ada catatan aktivitas moderasi atau pencarian Anda tidak membuahkan hasil.
              </p>
            </div>
          )}
        </>
      )}

      {/* TAB 2: Riwayat Setelan Bot (Audit Trail) */}
      {activeTab === 'settings' && (
        <>
          {loadingHistory ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                border: '3px solid hsla(var(--primary-glow), 0.15)',
                borderTopColor: 'hsl(var(--primary-glow))',
                borderRadius: '50%',
                animation: 'spin 1.2s linear infinite'
              }} />
            </div>
          ) : filteredSettingsHistory.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredSettingsHistory.map((item) => (
                <div 
                  key={item.id} 
                  className="glass-panel"
                  style={{
                    padding: '20px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    boxShadow: 'var(--shadow-panel)',
                    borderLeft: '4px solid hsl(var(--primary-glow))'
                  }}
                >
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid hsl(var(--border-glass))', paddingBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'hsl(var(--primary-glow))' }} />
                      <span style={{ fontWeight: '700', color: 'hsl(var(--text-primary))', fontSize: '0.92rem', fontFamily: 'var(--font-display)' }}>
                        Diubah oleh: <span style={{ color: 'hsl(var(--accent-cyan))', fontFamily: 'monospace' }}>{item.executor}</span>
                      </span>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', fontWeight: '500' }}>
                      {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Changes List Table */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '18px' }}>
                    {item.changes && item.changes.map((change, cIdx) => (
                      <div 
                        key={cIdx} 
                        style={{ 
                          display: 'grid', 
                          gridTemplateColumns: '220px 1fr', 
                          gap: '16px', 
                          fontSize: '0.88rem', 
                          alignItems: 'center' 
                        }}
                      >
                        <span style={{ color: 'hsl(var(--text-secondary))', fontWeight: '600' }}>
                          {formatFieldLabel(change.field, change.label)}
                        </span>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ 
                            padding: '2px 8px', 
                            borderRadius: '6px', 
                            backgroundColor: 'hsla(var(--border-glass), 0.1)', 
                            border: '1px solid hsl(var(--border-glass))', 
                            color: 'hsl(var(--text-muted))', 
                            fontSize: '0.78rem',
                            fontFamily: 'monospace'
                          }}>
                            {String(change.old || 'Kosong')}
                          </span>
                          
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'hsl(var(--text-muted))' }}>
                            <line x1="5" y1="12" x2="19" y2="12"/>
                            <polyline points="12 5 19 12 12 19"/>
                          </svg>
                          
                          <span style={{ 
                            padding: '2px 8px', 
                            borderRadius: '6px', 
                            backgroundColor: 'hsla(var(--success-emerald), 0.08)', 
                            border: '1px solid hsla(var(--success-emerald), 0.22)', 
                            color: 'hsl(var(--success-emerald))', 
                            fontSize: '0.78rem', 
                            fontWeight: '600',
                            fontFamily: 'monospace'
                          }}>
                            {String(change.new || 'Kosong')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
              <h3 style={{ color: 'hsl(var(--text-primary))', fontWeight: '750' }}>Belum Ada Perubahan Setelan</h3>
              <p style={{ marginTop: '10px', color: 'hsl(var(--text-secondary))' }}>
                Server ini belum mencatat riwayat modifikasi konfigurasi bot dari web dashboard.
              </p>
            </div>
          )}
        </>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { to { transform: rotate(360deg); } }
      `}} />
    </div>
  );
}
