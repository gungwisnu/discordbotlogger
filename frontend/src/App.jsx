import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, Outlet } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Logs from './pages/Logs';
import Leaderboard from './pages/Leaderboard';
import SelectServer from './pages/SelectServer';

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
          Sistem
        </button>
        <button 
          className={`theme-selector-btn ${theme === 'light' ? 'active' : ''}`}
          onClick={() => setTheme('light')}
        >
          Terang
        </button>
        <button 
          className={`theme-selector-btn ${theme === 'dark' ? 'active' : ''}`}
          onClick={() => setTheme('dark')}
        >
          Gelap
        </button>
      </div>
    </div>
  );
}

function Sidebar() {
  const { user, selectedGuild, setSelectedGuild, logout } = useApp();
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

          {/* Links for navigating without logout */}
          <div style={{ borderTop: '1px solid hsl(var(--border-glass))', marginTop: '12px', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <SidebarLink to="/select-server" icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7H9a4 4 0 0 0-4 4v3"/><path d="m16 3 4 4-4 4"/><path d="M4 17h11a4 4 0 0 0 4-4v-3"/><path d="m8 21-4-4 4-4"/></svg>
            }>
              Ganti Server
            </SidebarLink>
            
            <SidebarLink to="/" icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            }>
              Tampilan Utama
            </SidebarLink>
          </div>
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
              Discord Connected
            </span>
          </div>
        </div>
        
        <button className="btn-secondary" onClick={logout} style={{ padding: '10px 16px', fontSize: '0.85rem', width: '100%', justifyContent: 'center', borderRadius: '10px' }}>
          Keluar
        </button>
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
    <AppContext.Provider value={{ user, setUser, guilds, setGuilds, selectedGuild, setSelectedGuild, logout, theme, setTheme }}>
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
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppContext.Provider>
  );
}
