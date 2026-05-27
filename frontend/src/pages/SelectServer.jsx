import React, { useState, useEffect } from 'react';
import { useApp } from '../App';
import { useNavigate } from 'react-router-dom';

export default function SelectServer() {
  const { user, guilds, setGuilds, setSelectedGuild, logout } = useApp();
  const [clientId, setClientId] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch client ID for invite URL
  useEffect(() => {
    fetch('/api/auth/client-id')
      .then(res => res.json())
      .then(data => setClientId(data.clientId))
      .catch(err => console.error('Failed to load client ID:', err));
  }, []);

  // Refresh server list to check if bot has been added
  const refreshGuilds = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/user');
      if (res.ok) {
        const data = await res.json();
        setGuilds(data.guilds || []);
      }
    } catch (err) {
      console.error('Failed to refresh servers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGuild = (g) => {
    if (g.botInGuild) {
      setSelectedGuild(g);
      navigate('/dashboard');
    } else {
      // Open Discord Bot Invite Link specifically for this guild
      const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=8&scope=bot%20applications.commands&guild_id=${g.id}&disable_guild_select=true`;
      window.open(inviteUrl, '_blank', 'width=500,height=800');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      position: 'relative'
    }}>
      {/* Decorative Aura Glows */}
      <div className="ambient-glow" style={{
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, hsla(var(--primary-glow), 0.12) 0%, transparent 70%)',
        top: '-10%',
        left: '-10%',
      }} />
      
      <div className="glass-panel" style={{
        maxWidth: '800px',
        width: '100%',
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        gap: '30px',
        zIndex: 5
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid hsl(var(--border-glass))', paddingBottom: '20px' }}>
          <div>
            <h1 className="font-display" style={{ fontSize: '1.75rem', fontWeight: '800', color: 'hsl(var(--text-primary))' }}>
              Pilih Server Discord
            </h1>
            <p style={{ fontSize: '0.88rem', color: 'hsl(var(--text-secondary))', marginTop: '4px' }}>
              Pilih server yang ingin Anda kelola atau undang bot untuk mulai mencatat.
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className="btn-secondary" 
              onClick={refreshGuilds} 
              disabled={loading}
              style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '0.85rem' }}
            >
              {loading ? 'Menyegarkan...' : 'Segarkan Status'}
            </button>
            <button 
              className="btn-secondary" 
              onClick={logout}
              style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '0.85rem', borderColor: 'hsla(var(--danger-crimson), 0.25)', color: 'hsl(var(--danger-crimson))' }}
            >
              Keluar
            </button>
          </div>
        </div>

        {/* Server Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '20px',
          maxHeight: '400px',
          overflowY: 'auto',
          paddingRight: '6px'
        }}>
          {guilds && guilds.length > 0 ? (
            [...guilds].sort((a, b) => (b.botInGuild ? 1 : 0) - (a.botInGuild ? 1 : 0)).map((g) => {
              const iconUrl = g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png` : null;
              
              return (
                <div 
                  key={g.id}
                  onClick={() => handleSelectGuild(g)}
                  className="glass-panel"
                  style={{
                    padding: '24px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '16px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: g.botInGuild ? 'hsla(var(--success-emerald), 0.35)' : 'hsl(var(--border-glass))',
                    backgroundColor: g.botInGuild ? 'hsla(var(--success-emerald), 0.02)' : 'hsla(var(--border-glass), 0.08)',
                    transition: 'all 0.22s ease'
                  }}
                >
                  {/* Server Icon */}
                  {iconUrl ? (
                    <img 
                      src={iconUrl} 
                      alt={g.name}
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '16px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '16px',
                      backgroundColor: 'hsl(var(--primary-glow))',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}>
                      {g.name.charAt(0)}
                    </div>
                  )}

                  {/* Server Details */}
                  <div style={{ width: '100%' }}>
                    <h3 style={{
                      fontSize: '0.95rem',
                      fontWeight: '700',
                      color: 'hsl(var(--text-primary))',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '180px',
                      margin: '0 auto'
                    }}>
                      {g.name}
                    </h3>
                    
                    {/* Status Pill */}
                    <span style={{
                      display: 'inline-block',
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      padding: '2px 10px',
                      borderRadius: '12px',
                      marginTop: '8px',
                      backgroundColor: g.botInGuild ? 'hsla(var(--success-emerald), 0.15)' : 'hsla(var(--warning-amber), 0.15)',
                      color: g.botInGuild ? 'hsl(var(--success-emerald))' : 'hsl(var(--warning-amber))',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }}>
                      {g.botInGuild ? 'Bot Aktif' : 'Belum Ada Bot'}
                    </span>
                  </div>

                  {/* Action Link Text */}
                  <div style={{
                    fontSize: '0.82rem',
                    fontWeight: '700',
                    color: g.botInGuild ? 'hsl(var(--primary-glow))' : 'hsl(var(--accent-cyan))',
                    borderTop: '1px solid hsl(var(--border-glass))',
                    width: '100%',
                    paddingTop: '12px',
                    marginTop: '4px'
                  }}>
                    {g.botInGuild ? 'Masuk Dashboard →' : 'Undang Bot +'}
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ gridColumn: '1 / -1', padding: '40px', color: 'hsl(var(--text-muted))', fontWeight: '500' }}>
              Tidak ada server dengan hak akses Admin yang ditemukan.
            </div>
          )}
        </div>

        {/* Tip section */}
        <div style={{
          backgroundColor: 'hsla(var(--border-glass), 0.12)',
          border: '1px solid hsl(var(--border-glass))',
          borderRadius: '12px',
          padding: '16px',
          fontSize: '0.82rem',
          color: 'hsl(var(--text-muted))',
          lineHeight: '1.5'
        }}>
          💡 <strong>Bagaimana cara kerjanya?</strong><br />
          Jika status server adalah <strong>Belum Ada Bot</strong>, mengkliknya akan membuka jendela otorisasi resmi dari Discord untuk menambahkan bot. Setelah Anda berhasil menambahkan bot ke server tersebut, klik tombol <strong>Segarkan Status</strong> di atas, kemudian pilih kembali server untuk masuk langsung ke Dashboard.
        </div>
      </div>
    </div>
  );
}
