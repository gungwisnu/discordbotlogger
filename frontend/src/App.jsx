import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Logs from './pages/Logs';
import Leaderboard from './pages/Leaderboard';

// Session Context
export const AppContext = createContext(null);

export function useApp() {
  return useContext(AppContext);
}

// Custom Navigation Link that highlights when active in our premium dashboard
function SidebarLink({ to, children, icon }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
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
      <span style={{ fontSize: '1.2rem', opacity: isActive ? 1 : 0.8 }}>{icon}</span>
      {children}
    </Link>
  );
}

function ThemeSelector() {
  const { theme, setTheme } = useApp();
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
      <span style={{ fontSize: '0.72rem', color: 'hsl(var(--text-muted))', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        TEMA APLIKASI
      </span>
      <div className="theme-selector-container">
        <button 
          className={`theme-selector-btn ${theme === 'system' ? 'active' : ''}`}
          onClick={() => setTheme('system')}
        >
          💻 Sistem
        </button>
        <button 
          className={`theme-selector-btn ${theme === 'light' ? 'active' : ''}`}
          onClick={() => setTheme('light')}
        >
          ☀️ Terang
        </button>
        <button 
          className={`theme-selector-btn ${theme === 'dark' ? 'active' : ''}`}
          onClick={() => setTheme('dark')}
        >
          🌙 Gelap
        </button>
      </div>
    </div>
  );
}

function Sidebar() {
  const { user, selectedGuild, logout } = useApp();
  if (!user || !selectedGuild) return null;

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
        {/* Server Indicator Panel */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '18px', borderBottom: '1px solid hsl(var(--border-glass))' }}>
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
          <div>
            <h4 style={{ fontSize: '0.98rem', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '170px' }}>
              {selectedGuild.name}
            </h4>
            <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: '500' }}>Server Aktif</span>
          </div>
        </div>

        {/* Dashboard Navigation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <SidebarLink to="/dashboard" icon="⚙️">Konfigurasi Log</SidebarLink>
          <SidebarLink to="/logs" icon="📋">Audit Logs Feed</SidebarLink>
          <SidebarLink to="/leaderboard" icon="🏆">Analisis & Peringkat</SidebarLink>
        </div>
      </div>

      {/* Footer Area with Theme Selector & User Session */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', borderTop: '1px solid hsl(var(--border-glass))', paddingTop: '18px' }}>
        
        {/* Theme Selector */}
        <ThemeSelector />

        {/* User profile details */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'hsla(var(--border-glass), 0.1)', padding: '10px 12px', borderRadius: '12px', border: '1px solid hsl(var(--border-glass))' }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span style={{ fontSize: '0.88rem', fontWeight: '600', color: 'hsl(var(--text-primary))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.username}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'hsl(var(--success-emerald))', fontWeight: '600' }}>
              {user.demo ? 'Bypass Demo Admin' : 'Discord Connected'}
            </span>
          </div>
        </div>
        
        <button className="btn-secondary" onClick={logout} style={{ padding: '10px 16px', fontSize: '0.85rem', width: '100%', justifyContent: 'center', borderRadius: '10px' }}>
          🚪 Keluar
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [guilds, setGuilds] = useState([]);
  const [selectedGuild, setSelectedGuild] = useState(null);
  const [loading, setLoading] = useState(true);

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

  // Authenticate user on load
  useEffect(() => {
    fetch('/api/auth/user')
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Not authenticated');
      })
      .then(data => {
        setUser(data.user);
        setGuilds(data.guilds || []);
        
        // Auto-select first active guild
        const active = data.guilds?.find(g => g.botInGuild);
        if (active) setSelectedGuild(active);
        
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const loginDemo = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/demo');
      const data = await res.json();
      setUser(data.user);
      setGuilds(data.guilds);
      const active = data.guilds?.find(g => g.botInGuild);
      if (active) setSelectedGuild(active);
    } catch (err) {
      console.error('Demo auth failed:', err);
    } finally {
      setLoading(false);
    }
  };

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
    <AppContext.Provider value={{ user, setUser, guilds, setGuilds, selectedGuild, setSelectedGuild, loginDemo, logout, theme, setTheme }}>
      <BrowserRouter>
        {user ? (
          <div className="dashboard-grid">
            <Sidebar />
            <div style={{ padding: '30px 24px', overflowY: 'auto', maxHeight: '100vh' }}>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/logs" element={<Logs />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </div>
          </div>
        ) : (
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </BrowserRouter>
    </AppContext.Provider>
  );
}
