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
        return { color: 'hsl(var(--danger-crimson))', bg: 'rgba(239, 68, 68, 0.08)', border: 'rgba(239, 68, 68, 0.2)', label: '🚫 BANNED' };
      case 'UNBAN':
        return { color: 'hsl(var(--success-emerald))', bg: 'rgba(16, 185, 129, 0.08)', border: 'rgba(16, 185, 129, 0.2)', label: '🔓 UNBANNED' };
      case 'KICK':
        return { color: 'hsl(var(--warning-amber))', bg: 'rgba(249, 115, 22, 0.08)', border: 'rgba(249, 115, 22, 0.2)', label: '👢 KICKED' };
      case 'TIMEOUT':
        return { color: 'hsl(var(--warning-amber))', bg: 'rgba(217, 119, 6, 0.08)', border: 'rgba(217, 119, 6, 0.2)', label: '⏳ TIMEOUT' };
      case 'UNTIMEOUT':
        return { color: 'hsl(var(--accent-cyan))', bg: 'rgba(59, 130, 246, 0.08)', border: 'rgba(59, 130, 246, 0.2)', label: '⏰ UNTIMEOUT' };
      default:
        return { color: 'white', bg: 'rgba(255, 255, 255, 0.04)', border: 'rgba(255, 255, 255, 0.1)', label: '📝 LOGGED' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Header Panel */}
      <div>
        <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', color: 'white' }}>📋 Audit Logs Feed</h2>
        <p style={{ color: 'hsl(var(--text-secondary))', marginTop: '4px' }}>Log riwayat moderasi server dari database SQLite secara waktu-nyata.</p>
      </div>

      {/* Control Filters Bar */}
      <div className="glass-panel" style={{ padding: '16px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <input 
            type="text"
            placeholder="🔍 Cari berdasarkan aksi, user ID, moderator, atau alasan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-glass"
          />
        </div>
        <div style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>
          Menampilkan {filteredLogs.length} hasil dari total {total} log tersimpan
        </div>
      </div>

      {/* Log Feed Stream */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid hsla(var(--primary-glow), 0.2)',
            borderTopColor: 'hsl(var(--primary-glow))',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        </div>
      ) : filteredLogs.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredLogs.map((log) => {
            const style = getActionStyle(log.action);
            return (
              <div 
                key={log.id} 
                className="glass-panel"
                style={{
                  padding: '16px 20px',
                  display: 'grid',
                  gridTemplateColumns: '150px 1fr 180px',
                  alignItems: 'center',
                  gap: '20px',
                  borderLeft: `4px solid ${style.color}`
                }}
              >
                {/* Action Tag Badge */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  color: style.color,
                  backgroundColor: style.bg,
                  border: `1px solid ${style.border}`,
                  textAlign: 'center',
                  width: 'fit-content',
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '0.05em'
                }}>
                  {style.label}
                </div>

                {/* Event Contents Detail */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ fontSize: '0.95rem', color: 'white', lineHeight: '1.4' }}>
                    <strong>User ID:</strong> <span style={{ fontFamily: 'monospace', color: 'hsl(var(--accent-cyan))' }}>{log.user_id}</span>
                    <span style={{ color: 'hsl(var(--text-muted))', margin: '0 8px' }}>•</span>
                    <strong>Mod:</strong> <span style={{ fontFamily: 'monospace' }}>{log.executor_id}</span>
                  </div>
                  
                  <div style={{ fontSize: '0.88rem', color: 'hsl(var(--text-secondary))' }}>
                    <strong>Alasan:</strong> {log.reason}
                  </div>
                </div>

                {/* Event Timestamp */}
                <div style={{ 
                  textAlign: 'right', 
                  fontSize: '0.8rem', 
                  color: 'hsl(var(--text-muted))',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                  <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

              </div>
            );
          })}

          {/* Simple Glassmorphic Pagination */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
            <button 
              className="btn-secondary" 
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              style={{ padding: '8px 18px', fontSize: '0.85rem' }}
            >
              ⬅️ Sebelumnya
            </button>
            <span style={{ fontSize: '0.9rem', color: 'hsl(var(--text-muted))' }}>
              Halaman {page + 1} dari {Math.ceil(total / limit) || 1}
            </span>
            <button 
              className="btn-secondary" 
              onClick={() => setPage(p => p + 1)}
              disabled={(page + 1) * limit >= total}
              style={{ padding: '8px 18px', fontSize: '0.85rem' }}
            >
              Berikutnya ➡️
            </button>
          </div>

        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
          <h3>Tidak Ada Logs Ditemukan</h3>
          <p style={{ marginTop: '10px', color: 'hsl(var(--text-secondary))' }}>
            Belum ada catatan aktivitas moderasi atau filter pencarian tidak membuahkan hasil.
          </p>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { to { transform: rotate(360deg); } }
      `}} />
    </div>
  );
}
