import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, Outlet } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Logs from './pages/Logs';
import Leaderboard from './pages/Leaderboard';
import SelectServer from './pages/SelectServer';
import SuperAdmin from './pages/SuperAdmin';

// Session Context
export const AppContext = createContext(null);

export function useApp() {
  return useContext(AppContext);
}

// Custom Navigation Link that highlights when active in our premium dashboard
function SidebarLink({ to, children, icon, onClick }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  if (onClick) {
    return (
      <button 
        onClick={onClick} 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          borderRadius: '12px',
          width: '100%',
          border: '1px solid transparent',
          background: 'transparent',
          color: 'hsl(var(--text-secondary))',
          fontFamily: 'var(--font-display)',
          fontWeight: '500',
          fontSize: '0.92rem',
          textAlign: 'left',
          cursor: 'pointer',
          transition: 'all 0.25s ease'
        }}
        className="sidebar-link-hover"
      >
        <span style={{ display: 'flex', alignItems: 'center', justifyContext: 'center', opacity: 0.8 }}>
          {icon}
        </span>
        {children}
      </button>
    );
  }

  return (
    <Link 
      to={to} 
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        borderRadius: '12px',
        textDecoration: 'none',
        color: isActive ? 'hsl(var(--primary-glow))' : 'hsl(var(--text-secondary))',
        backgroundColor: isActive ? 'hsla(var(--primary-glow), 0.08)' : 'transparent',
        border: isActive ? '1px solid hsla(var(--primary-glow), 0.2)' : '1px solid transparent',
        fontFamily: 'var(--font-display)',
        fontWeight: isActive ? '600' : '500',
        transition: 'all 0.25s ease'
      }}
      className={isActive ? '' : 'sidebar-link-hover'}
    >
      <span style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        opacity: isActive ? 1 : 0.8,
        color: isActive ? 'hsl(var(--primary-glow))' : 'currentColor'
      }}>
        {icon}
      </span>
      {children}
    </Link>
  );
}

function ThemeSelector() {
  const { theme, setTheme } = useApp();

  const cycleTheme = () => {
    if (theme === 'system') setTheme('light');
    else if (theme === 'light') setTheme('dark');
    else setTheme('system');
  };

  const getThemeIcon = () => {
    if (theme === 'system') {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.4s ease' }}>
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
          <line x1="8" y1="21" x2="16" y2="21"/>
          <line x1="12" y1="17" x2="12" y2="21"/>
        </svg>
      );
    } else if (theme === 'light') {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.4s ease' }}>
          <circle cx="12" cy="12" r="5" fill="currentColor"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      );
    } else {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.4s ease' }}>
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      );
    }
  };

  const getThemeText = () => {
    if (theme === 'system') return 'Sistem';
    if (theme === 'light') return 'Terang';
    return 'Gelap';
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '10px 14px', 
      background: 'hsla(var(--border-glass), 0.08)', 
      border: '1px solid hsl(var(--border-glass))', 
      borderRadius: '12px' 
    }}>
      <span style={{ 
        fontSize: '0.88rem', 
        color: 'hsl(var(--text-primary))', 
        fontWeight: '600', 
        fontFamily: 'var(--font-display)' 
      }}>
        Tema
      </span>
      <button 
        onClick={cycleTheme}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'hsl(var(--text-primary))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '6px',
          borderRadius: '8px',
          transition: 'all 0.2s ease',
          lineHeight: 1
        }}
        className="sidebar-link-hover"
        title={`Tema saat ini: ${getThemeText()}`}
      >
        {getThemeIcon()}
      </button>
    </div>
  );
}

// Global server selector pop up modal
function ServerModal({ isOpen, onClose }) {
  const { guilds, setGuilds, setSelectedGuild } = useApp();
  const [clientId, setClientId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/auth/client-id')
        .then(res => res.json())
        .then(data => setClientId(data.clientId))
        .catch(err => console.error('Failed to load client ID:', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const refreshGuilds = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/user');
      if (res.ok) {
        const data = await res.json();
        setGuilds(data.guilds || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGuild = (g) => {
    if (g.botInGuild) {
      setSelectedGuild(g);
      onClose();
    } else {
      const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=8&scope=bot%20applications.commands&guild_id=${g.id}&disable_guild_select=true`;
      window.open(inviteUrl, '_blank', 'width=500,height=800');
    }
  };

  return (
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
    }} onClick={onClose}>
      <div className="glass-panel" style={{
        maxWidth: '850px',
        width: '100%',
        padding: '30px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        maxHeight: '85vh',
        overflowY: 'auto'
      }} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid hsl(var(--border-glass))', paddingBottom: '16px' }}>
          <div>
            <h2 className="font-display" style={{ fontSize: '1.4rem', fontWeight: '800', color: 'hsl(var(--text-primary))' }}>
              Ganti Server Discord
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'hsl(var(--text-secondary))', marginTop: '2px' }}>
              Pilih server aktif baru atau undang bot ke server Anda.
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-secondary" onClick={refreshGuilds} disabled={loading} style={{ padding: '8px 16px', fontSize: '0.8rem', borderRadius: '8px' }}>
              {loading ? 'Menyegarkan...' : 'Segarkan Status'}
            </button>
            <button className="btn-secondary" onClick={onClose} style={{ padding: '8px 16px', fontSize: '0.8rem', borderRadius: '8px' }}>
              Tutup
            </button>
          </div>
        </div>

        {/* Server Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '16px',
          maxHeight: '380px',
          overflowY: 'auto',
          paddingRight: '4px'
        }}>
          {guilds.map(g => {
            const iconUrl = g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png` : null;
            
            return (
              <div 
                key={g.id}
                onClick={() => handleSelectGuild(g)}
                className="glass-panel"
                style={{
                  padding: '20px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  borderColor: g.botInGuild ? 'hsla(var(--success-emerald), 0.35)' : 'hsl(var(--border-glass))',
                  backgroundColor: g.botInGuild ? 'hsla(var(--success-emerald), 0.02)' : 'hsla(var(--border-glass), 0.05)',
                  transition: 'all 0.2s ease'
                }}
              >
                {iconUrl ? (
                  <img src={iconUrl} alt={g.name} style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'hsl(var(--primary-glow))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {g.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'hsl(var(--text-primary))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px', margin: '0 auto' }}>
                    {g.name}
                  </h4>
                  <span style={{
                    display: 'inline-block',
                    fontSize: '0.68rem',
                    fontWeight: '700',
                    padding: '1px 8px',
                    borderRadius: '10px',
                    marginTop: '4px',
                    backgroundColor: g.botInGuild ? 'hsla(var(--success-emerald), 0.15)' : 'hsla(var(--warning-amber), 0.15)',
                    color: g.botInGuild ? 'hsl(var(--success-emerald))' : 'hsl(var(--warning-amber))',
                  }}>
                    {g.botInGuild ? 'Aktif' : 'Belum Ada'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

function Sidebar() {
  const { user, selectedGuild, setServerModalOpen, logout } = useApp();
  if (!user || !selectedGuild) return null;

  // Selected guild icon
  const guildIconUrl = selectedGuild.icon ? `https://cdn.discordapp.com/icons/${selectedGuild.id}/${selectedGuild.icon}.png` : null;

  // Logged-in user avatar
  const userAvatarUrl = user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : null;

  return (
    <div className="glass-panel" style={{
      padding: '24px 20px',
      height: 'calc(100vh - 32px)',
      margin: '16px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'sticky',
      top: '16px',
      zIndex: 10
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* Server Indicator Panel (Top Left) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '18px', borderBottom: '1px solid hsl(var(--border-glass))' }}>
          {guildIconUrl ? (
            <img 
              src={guildIconUrl} 
              alt={selectedGuild.name}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                objectFit: 'cover'
              }}
            />
          ) : (
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'hsl(var(--primary-glow))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.3rem',
              fontWeight: 'bold',
              color: 'white',
              boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
            }}>
              {selectedGuild.name.charAt(0)}
            </div>
          )}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '750', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '170px', color: 'hsl(var(--text-primary))' }}>
              {selectedGuild.name}
            </h4>
            <span style={{ fontSize: '0.72rem', color: 'hsl(var(--text-muted))', fontWeight: '600' }}>Server Aktif</span>
          </div>
        </div>

        {/* Dashboard Navigation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <SidebarLink to="/dashboard" icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          }>
            Konfigurasi Log
          </SidebarLink>
          
          <SidebarLink to="/logs" icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          }>
            Audit Logs Feed
          </SidebarLink>
          
          <SidebarLink to="/leaderboard" icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          }>
            Analisis & Peringkat
          </SidebarLink>

          {user.superAdmin && (
            <SidebarLink to="/admin" icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            }>
              Super Admin Panel
            </SidebarLink>
          )}

          {/* Switch Server Link (Opens Pop Up Modal) */}
          <div style={{ borderTop: '1px solid hsl(var(--border-glass))', marginTop: '12px', paddingTop: '12px' }}>
            <SidebarLink to="#" icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7H9a4 4 0 0 0-4 4v3"/><path d="m16 3 4 4-4 4"/><path d="M4 17h11a4 4 0 0 0 4-4v-3"/><path d="m8 21-4-4 4-4"/></svg>
            } onClick={() => setServerModalOpen(true)}>
              Ganti Server
            </SidebarLink>
          </div>
        </div>
      </div>

      {/* Footer Area with Theme Selector & User Session (Tampilan Utama moved here) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid hsl(var(--border-glass))', paddingTop: '16px' }}>
        
        {/* Theme Selector */}
        <ThemeSelector />

        {/* User profile details with Discord Avatar (Bottom Left) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'hsla(var(--border-glass), 0.1)', padding: '10px 12px', borderRadius: '12px', border: '1px solid hsl(var(--border-glass))' }}>
          {userAvatarUrl ? (
            <img 
              src={userAvatarUrl} 
              alt={user.username}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                objectFit: 'cover'
              }}
            />
          ) : (
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: 'hsl(var(--primary-glow))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.15rem',
              color: 'white',
              fontWeight: 'bold'
            }}>
              {user.username.charAt(0).toUpperCase()}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span style={{ fontSize: '0.88rem', fontWeight: '600', color: 'hsl(var(--text-primary))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.username}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'hsl(var(--success-emerald))', fontWeight: '600' }}>
              Discord Connected
            </span>
            <span style={{ fontSize: '0.66rem', color: 'hsl(var(--text-muted))', fontFamily: 'monospace', marginTop: '2px' }}>
              ID: {user.id}
            </span>
          </div>
        </div>
        
        {/* Navigation & Logout Buttons at the very bottom */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Link to="/" style={{ textDecoration: 'none', width: '100%' }}>
            <button className="btn-secondary" style={{ padding: '10px 16px', fontSize: '0.85rem', width: '100%', justifyContent: 'center', borderRadius: '10px', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              Tampilan Utama
            </button>
          </Link>

          <button className="btn-secondary" onClick={logout} style={{ padding: '10px 16px', fontSize: '0.85rem', width: '100%', justifyContent: 'center', borderRadius: '10px', borderColor: 'hsla(var(--danger-crimson), 0.2)', color: 'hsl(var(--danger-crimson))' }}>
            Keluar
          </button>
        </div>
      </div>
    </div>
  );
}

function DashboardLayout() {
  return (
    <div className="dashboard-grid">
      <Sidebar />
      <div style={{ padding: '30px 24px', overflowY: 'auto', maxHeight: '100vh', width: '100%' }}>
        <Outlet />
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [guilds, setGuilds] = useState([]);
  const [selectedGuild, setSelectedGuildState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isServerModalOpen, setServerModalOpen] = useState(false);

  // Custom setter that also caches the selected guild ID in local storage
  const setSelectedGuild = (guild) => {
    setSelectedGuildState(guild);
    if (guild) {
      localStorage.setItem('selected-guild-id', guild.id);
    } else {
      localStorage.removeItem('selected-guild-id');
    }
  };

  // Initialize theme state from localStorage
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme-preference') || 'system';
  });

  // Apply theme class to document element
  useEffect(() => {
    const root = document.documentElement;
    
    const applyTheme = (currentTheme) => {
      if (currentTheme === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (isDark) {
          root.classList.add('dark-mode');
          root.classList.remove('light-mode');
        } else {
          root.classList.add('light-mode');
          root.classList.remove('dark-mode');
        }
      } else if (currentTheme === 'dark') {
        root.classList.add('dark-mode');
        root.classList.remove('light-mode');
      } else {
        root.classList.add('light-mode');
        root.classList.remove('dark-mode');
      }
    };

    applyTheme(theme);
    localStorage.setItem('theme-preference', theme);

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  // Authenticate user on load and restore selected server
  useEffect(() => {
    fetch('/api/auth/user')
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Not authenticated');
      })
      .then(data => {
        setUser(data.user);
        setGuilds(data.guilds || []);
        
        // Restore last selected guild if it exists in the user's admin guild list and bot is in it
        const savedId = localStorage.getItem('selected-guild-id');
        if (savedId) {
          const savedGuild = data.guilds?.find(g => g.id === savedId && g.botInGuild);
          if (savedGuild) {
            setSelectedGuildState(savedGuild);
          }
        }
        
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const logout = async () => {
    try {
      await fetch('/api/auth/logout');
      setUser(null);
      setGuilds([]);
      setSelectedGuild(null);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '20px' }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '3px solid hsla(var(--primary-glow), 0.2)',
          borderTopColor: 'hsl(var(--primary-glow))',
          borderRadius: '50%',
          animation: 'spin 1.2s linear infinite'
        }} />
        <span style={{ fontFamily: 'var(--font-display)', color: 'hsl(var(--text-secondary))', fontWeight: '600', letterSpacing: '0.08em', fontSize: '0.9rem' }}>
          MEMUAT DATA PANDU APP...
        </span>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin { to { transform: rotate(360deg); } }
        `}} />
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ user, setUser, guilds, setGuilds, selectedGuild, setSelectedGuild, logout, theme, setTheme, isServerModalOpen, setServerModalOpen }}>
      <BrowserRouter>
        <Routes>
          {/* Landing Page is ALWAYS accessible */}
          <Route path="/" element={<Landing />} />
          
          {/* Server Selection Route */}
          <Route path="/select-server" element={
            user ? <SelectServer /> : <Navigate to="/" replace />
          } />

          {/* Dashboard nested layout wrapper */}
          <Route element={user ? (selectedGuild ? <DashboardLayout /> : <Navigate to="/select-server" replace />) : <Navigate to="/" replace />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/logs" element={<Logs />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/admin" element={user?.superAdmin ? <SuperAdmin /> : <Navigate to="/dashboard" replace />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Global Pop Up server switching Modal */}
        <ServerModal isOpen={isServerModalOpen} onClose={() => setServerModalOpen(false)} />
      </BrowserRouter>
    </AppContext.Provider>
  );
}
