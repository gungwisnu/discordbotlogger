import React, { useState, useEffect } from 'react';
import { useApp } from '../App';

export default function Logs() {
  const { selectedGuild } = useApp();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 15;

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

  const getActionStyle = (action) => {
    switch (action) {
      case 'BAN':
        return { color: 'hsl(var(--danger-crimson))', bg: 'hsla(var(--danger-crimson), 0.1)', border: 'hsla(var(--danger-crimson), 0.25)', label: '🚫 BANNED' };
      case 'UNBAN':
        return { color: 'hsl(var(--success-emerald))', bg: 'hsla(var(--success-emerald), 0.1)', border: 'hsla(var(--success-emerald), 0.25)', label: '🔓 UNBANNED' };
      case 'KICK':
        return { color: 'hsl(var(--warning-amber))', bg: 'hsla(var(--warning-amber), 0.1)', border: 'hsla(var(--warning-amber), 0.25)', label: '👢 KICKED' };
      case 'TIMEOUT':
        return { color: 'hsl(var(--warning-amber))', bg: 'hsla(var(--warning-amber), 0.1)', border: 'hsla(var(--warning-amber), 0.25)', label: '⏳ TIMEOUT' };
      case 'UNTIMEOUT':
        return { color: 'hsl(var(--accent-cyan))', bg: 'hsla(var(--accent-cyan), 0.1)', border: 'hsla(var(--accent-cyan), 0.25)', label: '⏰ UNTIMEOUT' };
      default:
        return { color: 'hsl(var(--text-primary))', bg: 'hsla(var(--border-glass), 0.12)', border: 'hsl(var(--border-glass))', label: '📝 LOGGED' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Header Panel */}
      <div>
        <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', color: 'hsl(var(--text-primary))' }}>Audit Logs Feed</h2>
        <p style={{ color: 'hsl(var(--text-secondary))', marginTop: '4px' }}>Log riwayat moderasi server dari basis data secara real-time.</p>
      </div>

      {/* Control Filters Bar */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <input 
            type="text"
            placeholder="🔍 Cari berdasarkan aksi, ID pengguna, moderator, atau alasan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-glass"
            style={{ paddingLeft: '16px' }}
          />
        </div>
        <div style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', fontWeight: '500' }}>
          Menampilkan {filteredLogs.length} hasil dari total {total} log yang tersimpan
        </div>
      </div>

      {/* Log Feed Stream */}
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
                  gridTemplateColumns: '150px 1fr 180px',
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

          {/* Simple Glassmorphic Pagination */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
            <button 
              className="btn-secondary" 
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              style={{ padding: '10px 20px', fontSize: '0.85rem', borderRadius: '10px' }}
            >
              ⬅️ Sebelumnya
            </button>
            <span style={{ fontSize: '0.9rem', color: 'hsl(var(--text-muted))', fontWeight: '600' }}>
              Halaman {page + 1} dari {Math.ceil(total / limit) || 1}
            </span>
            <button 
              className="btn-secondary" 
              onClick={() => setPage(p => p + 1)}
              disabled={(page + 1) * limit >= total}
              style={{ padding: '10px 20px', fontSize: '0.85rem', borderRadius: '10px' }}
            >
              Berikutnya ➡️
            </button>
          </div>

        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
          <h3 style={{ color: 'hsl(var(--text-primary))' }}>Tidak Ada Catatan Log Yang Ditemukan</h3>
          <p style={{ marginTop: '10px', color: 'hsl(var(--text-secondary))' }}>
            Belum ada catatan aktivitas moderasi atau pencarian Anda tidak membuahkan hasil.
          </p>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { to { transform: rotate(360deg); } }
      `}} />
    </div>
  );
}
