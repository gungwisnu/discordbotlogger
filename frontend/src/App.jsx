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
        borderRadius: '10px',
        textDecoration: 'none',
        color: isActive ? 'white' : 'hsl(var(--text-secondary))',
        backgroundColor: isActive ? 'hsla(var(--primary-glow), 0.15)' : 'transparent',
        border: isActive ? '1px solid hsla(var(--primary-glow), 0.35)' : '1px solid transparent',
        fontFamily: 'var(--font-display)',
        fontWeight: '500',
        transition: 'all 0.25s ease'
      }}
      className={isActive ? '' : 'sidebar-link-hover'}
    >
      <span style={{ fontSize: '1.2rem' }}>{icon}</span>
      {children}
    </Link>
  );
}

function Sidebar() {
  const { user, selectedGuild, logout } = useApp();
  if (!user || !selectedGuild) return null;

  return (
    <div className="glass-panel" style={{
      padding: '24px 16px',
      height: 'calc(100vh - 32px)',
      margin: '16px',
      display: 'flex',
      flexDirection: 'col',
      justifyContent: 'space-between',
      position: 'sticky',
      top: '16px'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {/* Server Indicator Panel */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid hsl(var(--border-glass))' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'hsl(var(--primary-glow))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: 'white',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            {selectedGuild.name.charAt(0)}
          </div>
          <div>
            <h4 style={{ fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>{selectedGuild.name}</h4>
            <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Server Aktif</span>
          </div>
        </div>

        {/* Dashboard Navigation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <SidebarLink to="/dashboard" icon="⚙️">Konfigurasi Log</SidebarLink>
          <SidebarLink to="/logs" icon="📋">Audit Logs Feed</SidebarLink>
          <SidebarLink to="/leaderboard" icon="🏆">Analisis & Peringkat</SidebarLink>
        </div>
      </div>

      {/* User Session profile Footer */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid hsl(var(--border-glass))', paddingTop: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: '#3b82f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            color: 'white',
            fontWeight: 'bold'
          }}>
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.username}</span>
            <span style={{ fontSize: '0.75rem', color: 'hsl(var(--success-emerald))' }}>{user.demo ? 'Bypass Demo Admin' : 'Discord Connected'}</span>
          </div>
        </div>
        
        <button className="btn-secondary" onClick={logout} style={{ padding: '8px 16px', fontSize: '0.85rem', width: '100%', justifyContent: 'center' }}>
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
          animation: 'spin 1s linear infinite'
        }} />
        <span style={{ fontFamily: 'var(--font-display)', color: 'hsl(var(--text-secondary))', letterSpacing: '0.05em' }}>MEMUAT DATA PANDU APP...</span>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin { to { transform: rotate(360deg); } }
        `}} />
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ user, setUser, guilds, setGuilds, selectedGuild, setSelectedGuild, loginDemo, logout }}>
      <BrowserRouter>
        {user ? (
          <div className="dashboard-grid">
            <Sidebar />
            <div style={{ padding: '24px', overflowY: 'auto', maxHeight: '100vh' }}>
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
