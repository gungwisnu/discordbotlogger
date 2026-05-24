import React, { useState, useEffect } from 'react';
import { useApp } from '../App';

const categoryDetails = {
  moderation: {
    title: '📝 Moderation Log',
    subtitle: 'Ban, unban, kick, timeout, delete & edit message.',
    desc: 'Melacak seluruh aktivitas penegakan disiplin dan moderasi konten untuk menjaga keamanan server Anda.',
    color: '#ef4444',
    events: [
      { emoji: '🚫', title: 'Ban & Unban Member', text: 'Melacak pemblokiran dan pembatalan blokir beserta alasannya.' },
      { emoji: '👢', title: 'Kick Member', text: 'Mencatat pengeluaran paksa anggota dari server oleh moderator.' },
      { emoji: '⏳', title: 'Timeout (Mute sementara)', text: 'Melacak durasi pematikan mic/chat serta waktu pencabutannya.' },
      { emoji: '🗑️', title: 'Pesan Dihapus (Single & Bulk)', text: 'Menyimpan teks pesan yang terhapus beserta lampirannya untuk mencegah abuse.' },
      { emoji: '📝', title: 'Pesan Diedit', text: 'Melihat perbandingan pesan sebelum dan sesudah diedit.' }
    ],
    mockEmbed: {
      color: '#f43f5e',
      description: '### **🗑️ Pesan Dihapus**',
      fields: [
        { name: 'Pengirim', value: '@dipa', inline: true },
        { name: 'Channel', value: '#umum', inline: true },
        { name: 'Isi Pesan', value: 'Oi jangan spam di sini!' }
      ],
      footer: 'dipa: 333105200942546946 | #umum: 1486233076160925881'
    }
  },
  voice: {
    title: '🔊 Voice Log',
    subtitle: 'Join, leave, pindah channel, mute/deaf, streaming.',
    desc: 'Memantau aktivitas nongkrong, panggilan suara, hingga presentasi layar di voice channel server Anda.',
    color: '#10b981',
    events: [
      { emoji: '🔊', title: 'Join Voice', text: 'Mencatat jam masuk pengguna ke saluran suara.' },
      { emoji: '🔇', title: 'Leave Voice', text: 'Menghitung durasi waktu pengguna nongkrong di voice.' },
      { emoji: '🔄', title: 'Pindah Channel Voice', text: 'Mencatat perpindahan dari satu voice channel ke channel lain.' },
      { emoji: '🎙️', title: 'Mute & Deaf (Self)', text: 'Melihat kapan pengguna mematikan microphone atau pendengaran.' },
      { emoji: '🖥️', title: 'Screen Share & Camera', text: 'Mendapat pemberitahuan saat share screen dimulai atau diakhiri.' }
    ],
    mockEmbed: {
      color: '#10b981',
      description: '### **🔊 Join Channel Voice**\n@dipa bergabung ke channel voice 📚┇Belajar!',
      footer: 'dipa: 333105200942546946 | #Belajar!: 1486233076160925881'
    }
  },
  member: {
    title: '👤 Member Log',
    subtitle: 'Member join/leave server, ganti nickname, role updates.',
    desc: 'Melacak riwayat masuk-keluar anggota server serta perubahan identitas profil mereka.',
    color: '#3b82f6',
    events: [
      { emoji: '📥', title: 'Join Server', text: 'Melacak anggota baru lengkap dengan umur akun mereka.' },
      { emoji: '📤', title: 'Keluar Server', text: 'Mencatat kepergian anggota beserta durasi mereka bergabung.' },
      { emoji: '👤', title: 'Ganti Nickname', text: 'Mencatat perubahan nama samaran lokal di dalam server.' },
      { emoji: '🛡️', title: 'Role Ditambah/Dihapus', text: 'Melacak modifikasi peran yang diberikan kepada anggota.' }
    ],
    mockEmbed: {
      color: '#3b82f6',
      description: '### **👤 Nickname Berubah**\n@dipa mengubah nickname mereka',
      fields: [
        { name: 'Sebelum', value: 'Dipa Santai', inline: true },
        { name: 'Sesudah', value: 'Dipa Belajar', inline: true }
      ],
      footer: 'dipa: 333105200942546946'
    }
  },
  server: {
    title: '⚙️ Server Configuration Log',
    subtitle: 'Channel dibuat/dihapus, role dibuat/dihapus, server update.',
    desc: 'Melacak modifikasi struktural server oleh admin atau bot agar keamanan tata kelola tetap terkontrol.',
    color: '#8b5cf6',
    events: [
      { emoji: '📁', title: 'Channel Dibuat/Dihapus/Diedit', text: 'Melacak perubahan kategori, teks, atau voice channel.' },
      { emoji: '🛡️', title: 'Role Dibuat/Dihapus/Diedit', text: 'Mencatat perubahan izin role, warna role, atau pembuatan role baru.' },
      { emoji: '😀', title: 'Emoji Dibuat/Dihapus', text: 'Memantau penambahan emoji custom server.' }
    ],
    mockEmbed: {
      color: '#10b981',
      description: '### **📁 Channel Dibuat**',
      fields: [
        { name: 'Nama Channel', value: '#pengumuman', inline: true },
        { name: 'Dibuat Oleh', value: '@dipa', inline: true }
      ],
      footer: 'dipa: 333105200942546946 | #pengumuman: 1486233076160925881'
    }
  },
  activity: {
    title: '🎮 Presence & Activity Log',
    subtitle: 'User mulai bermain game, ganti game, mendengarkan Spotify.',
    desc: 'Mencatat game yang dimainkan dan musik Spotify yang didengarkan oleh anggota server secara real-time.',
    color: '#1db954',
    events: [
      { emoji: '🎮', title: 'Mulai/Berhenti Main Game', text: 'Mendeteksi judul game (seperti Mobile Legends, Valorant) beserta durasi main.' },
      { emoji: '🎵', title: 'Mendengarkan Spotify', text: 'Melacak judul lagu dan artis yang sedang diputar.' }
    ],
    mockEmbed: {
      color: '#10b981',
      description: '### **🎮 Mulai Bermain Game**\n@dipa mulai bermain **Minecraft**.',
      footer: 'dipa: 333105200942546946'
    }
  }
};

export default function Dashboard() {
  const { selectedGuild, guilds, setSelectedGuild } = useApp();
  const [channels, setChannels] = useState([]);
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [expandedCats, setExpandedCats] = useState({
    moderation: false,
    voice: false,
    member: false,
    server: false,
    activity: false
  });

  // Fetch settings & channels list when selected guild changes
  useEffect(() => {
    if (!selectedGuild) return;
    
    // Fetch settings
    fetch(`/api/guilds/${selectedGuild.id}/settings`)
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        setSettings(data);
      })
      .catch(err => console.error('Failed to load settings:', err));

    // Fetch channels list
    fetch(`/api/guilds/${selectedGuild.id}/channels`)
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        setChannels(data);
      })
      .catch(err => console.error('Failed to load channels:', err));
  }, [selectedGuild]);

  const handleCategoryToggle = (category) => {
    setSettings(prev => ({
      ...prev,
      categories_enabled: {
        ...prev.categories_enabled,
        [category]: !prev.categories_enabled[category]
      }
    }));
  };

  const toggleExpand = (cat) => {
    setExpandedCats(prev => ({
      ...prev,
      [cat]: !prev[cat]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch(`/api/guilds/${selectedGuild.id}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
        setMessage('✅ Konfigurasi bot berhasil disimpan!');
      }
    } catch (err) {
      console.error(err);
      setMessage('❌ Gagal menyimpan konfigurasi.');
    } finally {
      setSaving(false);
    }
  };

  if (!selectedGuild) {
    return (
      <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Server Belum Terkoneksi</h2>
        <p style={{ marginTop: '10px', color: 'hsl(var(--text-secondary))' }}>
          Anda tidak memiliki server di mana bot Discord terpasang.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Top Banner & Server Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', color: 'white' }}>⚙️ Konfigurasi Server</h2>
          <p style={{ color: 'hsl(var(--text-secondary))', marginTop: '4px' }}>Sesuaikan channel log dan kategori event untuk bot Anda.</p>
        </div>

        {/* Guild Switching Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontSize: '0.9rem', color: 'hsl(var(--text-muted))' }}>Pilih Server:</label>
          <select 
            value={selectedGuild.id}
            onChange={(e) => {
              const selected = guilds.find(g => g.id === e.target.value);
              if (selected) setSelectedGuild(selected);
            }}
            className="input-glass"
            style={{ width: '220px', cursor: 'pointer' }}
          >
            {guilds.map(g => (
              <option key={g.id} value={g.id} style={{ backgroundColor: 'black' }}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {settings ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
          
          {/* Main settings form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* General Log Target Channel */}
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'white' }}>🎯 Channel Log Utama</h3>
              <p style={{ fontSize: '0.88rem', color: 'hsl(var(--text-secondary))' }}>
                Seluruh aktivitas server yang dipantau akan dikirimkan sebagai pesan embed ke channel ini.
              </p>
              
              <select
                value={settings.log_channel_id || ''}
                onChange={(e) => setSettings(prev => ({ ...prev, log_channel_id: e.target.value }))}
                className="input-glass"
                style={{ cursor: 'pointer' }}
              >
                <option value="" style={{ backgroundColor: 'black' }}>-- Pilih Text Channel --</option>
                {channels.map(ch => (
                  <option key={ch.id} value={ch.id} style={{ backgroundColor: 'black' }}>
                    #{ch.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Event Category Cards */}
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'white' }}>📋 Aktifkan Kategori Log</h3>
              <p style={{ fontSize: '0.88rem', color: 'hsl(var(--text-secondary))' }}>Tentukan kategori mana saja yang ingin dicatat oleh bot Anda.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {Object.entries(categoryDetails).map(([catKey, details]) => {
                  const isExpanded = !!expandedCats[catKey];
                  const isEnabled = !!settings.categories_enabled?.[catKey];

                  return (
                    <div 
                      key={catKey} 
                      style={{ 
                        border: '1px solid hsl(var(--border-glass))', 
                        borderRadius: '12px', 
                        padding: '18px', 
                        backgroundColor: 'rgba(255, 255, 255, 0.01)',
                        transition: 'all 0.3s ease',
                        boxShadow: isExpanded ? '0 8px 24px rgba(0, 0, 0, 0.2)' : 'none',
                        position: 'relative'
                      }}
                    >
                      {/* Card Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <h4 style={{ color: 'white', fontSize: '1.05rem', fontWeight: '600' }}>{details.title}</h4>
                            <span 
                              style={{ 
                                fontSize: '0.72rem', 
                                backgroundColor: isEnabled ? 'rgba(16, 185, 129, 0.15)' : 'rgba(107, 114, 128, 0.15)', 
                                color: isEnabled ? '#10b981' : '#a1a1aa',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontWeight: 'bold'
                              }}
                            >
                              {isEnabled ? 'Aktif' : 'Mati'}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.82rem', color: 'hsl(var(--text-muted))', display: 'block', marginTop: '4px' }}>
                            {details.subtitle}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          {/* Info Button */}
                          <button 
                            onClick={() => toggleExpand(catKey)}
                            className="input-glass"
                            style={{ 
                              padding: '6px 12px', 
                              fontSize: '0.8rem', 
                              cursor: 'pointer', 
                              borderRadius: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              border: '1px solid hsl(var(--border-glass))',
                              backgroundColor: isExpanded ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)'
                            }}
                          >
                            <span>ℹ️</span> {isExpanded ? 'Tutup Contoh' : 'Penjelasan & Contoh'}
                          </button>

                          {/* Custom Premium Switch Toggle */}
                          <label style={{
                            position: 'relative',
                            display: 'inline-block',
                            width: '48px',
                            height: '24px',
                            cursor: 'pointer'
                          }}>
                            <input 
                              type="checkbox" 
                              checked={isEnabled} 
                              onChange={() => handleCategoryToggle(catKey)}
                              style={{ opacity: 0, width: 0, height: 0 }} 
                            />
                            <span style={{
                              position: 'absolute',
                              cursor: 'pointer',
                              top: 0, left: 0, right: 0, bottom: 0,
                              backgroundColor: isEnabled ? '#10b981' : '#3f3f46',
                              transition: '0.3s',
                              borderRadius: '34px',
                              border: '1px solid hsl(var(--border-glass))'
                            }}>
                              <span style={{
                                position: 'absolute',
                                height: '16px',
                                width: '16px',
                                left: isEnabled ? '26px' : '4px',
                                bottom: '3px',
                                backgroundColor: 'white',
                                transition: '0.3s',
                                borderRadius: '50%',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                              }} />
                            </span>
                          </label>
                        </div>
                      </div>

                      {/* Card Expandable Details Accordion */}
                      <div style={{
                        maxHeight: isExpanded ? '1000px' : '0',
                        overflow: 'hidden',
                        transition: 'max-height 0.4s cubic-bezier(0, 1, 0, 1)',
                        marginTop: isExpanded ? '16px' : '0',
                        borderTop: isExpanded ? '1px solid hsl(var(--border-glass))' : 'none',
                        paddingTop: isExpanded ? '16px' : '0'
                      }}>
                        <p style={{ fontSize: '0.88rem', color: 'hsl(var(--text-secondary))', lineHeight: '1.5', marginBottom: '12px' }}>
                          {details.desc}
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', flexWrap: 'wrap' }}>
                          {/* Tracked Events List */}
                          <div>
                            <span style={{ fontSize: '0.78rem', color: 'hsl(var(--text-muted))', fontWeight: 'bold', textTransform: 'uppercase' }}>
                              Aktivitas Yang Dipantau:
                            </span>
                            <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: 0, marginTop: '8px', listStyle: 'none' }}>
                              {details.events.map((evt, idx) => (
                                <li key={idx} style={{ fontSize: '0.82rem', color: '#dbdee1', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                  <span>{evt.emoji}</span>
                                  <div>
                                    <strong style={{ color: 'white' }}>{evt.title}</strong>
                                    <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginTop: '2px' }}>{evt.text}</p>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Visual Discord Mock Embed */}
                          <div>
                            <span style={{ fontSize: '0.78rem', color: 'hsl(var(--text-muted))', fontWeight: 'bold', textTransform: 'uppercase' }}>
                              Simulasi Tampilan Log Discord (ID di Footer):
                            </span>
                            <div style={{
                              backgroundColor: '#2b2d31',
                              borderRadius: '8px',
                              padding: '16px',
                              borderLeft: `4px solid ${details.mockEmbed.color}`,
                              marginTop: '8px',
                              fontFamily: 'sans-serif',
                              fontSize: '0.88rem',
                              color: '#dbdee1',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                            }}>
                              {details.mockEmbed.description ? (
                                <div style={{ fontSize: '0.82rem', marginTop: '4px', lineHeight: '1.5', whiteSpace: 'pre-line' }}>
                                  {details.mockEmbed.description.split('\n').map((line, lIdx) => {
                                    if (line.startsWith('###')) {
                                      const headingText = line.replace('###', '').replace(/\*/g, '').trim();
                                      return (
                                        <div key={lIdx} style={{ fontSize: '0.92rem', fontWeight: 'bold', color: 'white', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                          {headingText}
                                        </div>
                                      );
                                    }
                                    return (
                                      <div key={lIdx} style={{ marginBottom: '8px' }}>
                                        {line.split(' ').map((word, wIdx) => {
                                          if (word.startsWith('@')) {
                                            return <span key={wIdx} style={{ backgroundColor: 'rgba(88, 101, 242, 0.15)', color: '#5865f2', padding: '0 4px', borderRadius: '3px', fontWeight: '500', marginRight: '4px' }}>{word}</span>;
                                          }
                                          if (word.startsWith('#') || word.startsWith('📚')) {
                                            return <span key={wIdx} style={{ backgroundColor: 'rgba(88, 101, 242, 0.15)', color: '#5865f2', padding: '0 4px', borderRadius: '3px', fontWeight: '500', marginRight: '4px' }}>{word}</span>;
                                          }
                                          return word + ' ';
                                        })}
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : null}
                              {details.mockEmbed.fields ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                                  {details.mockEmbed.fields.map((f, idx) => (
                                    <div key={idx} style={{ display: f.inline ? 'inline-block' : 'block', marginRight: f.inline ? '20px' : '0' }}>
                                      <div style={{ color: '#b5bac1', fontSize: '0.72rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '2px' }}>{f.name}</div>
                                      <div style={{ wordBreak: 'break-word', fontSize: '0.82rem' }}>
                                        {f.value.split(' ').map((word, wIdx) => {
                                          if (word.startsWith('@')) {
                                            return <span key={wIdx} style={{ backgroundColor: 'rgba(88, 101, 242, 0.15)', color: '#5865f2', padding: '0 4px', borderRadius: '3px', fontWeight: '500', marginRight: '4px' }}>{word}</span>;
                                          }
                                          if (word.startsWith('#') || word.startsWith('📚')) {
                                            return <span key={wIdx} style={{ backgroundColor: 'rgba(88, 101, 242, 0.15)', color: '#5865f2', padding: '0 4px', borderRadius: '3px', fontWeight: '500', marginRight: '4px' }}>{word}</span>;
                                          }
                                          return word + ' ';
                                        })}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : null}
                              <div style={{ marginTop: '12px', fontSize: '0.7rem', color: '#949ba4', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>
                                {details.mockEmbed.footer} • Hari ini pukul 03:10
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

              </div>
            </div>

            {/* Feedback message and Save Trigger */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: '500', color: message.includes('✅') ? 'hsl(var(--success-emerald))' : 'hsl(var(--danger-crimson))' }}>
                {message}
              </span>
              <button 
                className="btn-primary" 
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Menyimpan...' : '💾 Simpan Konfigurasi'}
              </button>
            </div>

          </div>

          {/* Right sidebar theme color & live visual preview panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Embed Theme Color Picker */}
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'white' }}>🎨 Warna Tema Embed</h3>
              <p style={{ fontSize: '0.82rem', color: 'hsl(var(--text-secondary))' }}>
                Warna garis tepi embed pesan logs yang akan muncul di Discord Anda.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input 
                  type="color" 
                  value={settings.embed_color || '#6366f1'} 
                  onChange={(e) => setSettings(prev => ({ ...prev, embed_color: e.target.value }))}
                  style={{
                    width: '56px',
                    height: '56px',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: 'transparent'
                  }}
                />
                <div>
                  <span style={{ fontSize: '0.9rem', color: 'white', fontWeight: 'bold' }}>{settings.embed_color}</span>
                  <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>Klik kotak untuk memilih warna</p>
                </div>
              </div>
            </div>

            {/* Live Discord Embed Simulation Preview */}
            <div className="glass-panel" style={{ padding: '0px', overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid hsl(var(--border-glass))' }}>
                <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', fontWeight: 'bold' }}>LIVE DISCORD PREVIEW</span>
              </div>
              
              <div style={{ padding: '20px' }}>
                <div style={{
                  borderLeft: `4px solid ${settings.embed_color || '#6366f1'}`,
                  backgroundColor: '#2b2d31', // Discord dark background style
                  padding: '16px',
                  borderRadius: '4px',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                }}>
                  <div style={{ fontSize: '0.92rem', fontWeight: 'bold', color: 'white', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    🔊 Join Channel Voice
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#dbdee1', lineHeight: '1.4' }}>
                    <span style={{ backgroundColor: 'rgba(88, 101, 242, 0.15)', color: '#5865f2', padding: '0 4px', borderRadius: '3px', fontWeight: '500' }}>@dipa</span> bergabung ke channel voice <span style={{ backgroundColor: 'rgba(88, 101, 242, 0.15)', color: '#5865f2', padding: '0 4px', borderRadius: '3px', fontWeight: '500' }}>📚┇Belajar!</span>
                  </p>
                  <div style={{ marginTop: '12px', fontSize: '0.7rem', color: '#949ba4', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>
                    dipa: 333105200942546946 | #Belajar!: 1486233076160925881 • Hari ini pukul 03:10
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      ) : null}

    </div>
  );
}
