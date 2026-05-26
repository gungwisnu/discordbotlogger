import React, { useState, useEffect } from 'react';
import { useApp } from '../App';

const categoryDetails = {
  moderation: {
    title: '📝 Log Moderasi',
    subtitle: 'Ban, unban, kick, timeout, pesan dihapus & diedit.',
    desc: 'Melacak seluruh aktivitas penegakan disiplin dan moderasi konten untuk menjaga keamanan server Anda.',
    color: '#ef4444',
    events: [
      { emoji: '🚫', title: 'Ban & Unban Anggota', text: 'Melacak pemblokiran dan pembatalan blokir beserta alasannya.' },
      { emoji: '👢', title: 'Dikeluarkan (Kick) Anggota', text: 'Mencatat pengeluaran paksa anggota dari server oleh moderator.' },
      { emoji: '⏳', title: 'Timeout Anggota', text: 'Melacak pemberian timeout serta pembatalannya.' },
      { emoji: '🗑️', title: 'Pesan Dihapus (Masal & Tunggal)', text: 'Menyimpan teks pesan yang terhapus beserta lampirannya.' },
      { emoji: '📝', title: 'Pesan Diedit', text: 'Melihat perbandingan pesan sebelum dan sesudah diubah.' }
    ],
    mockEmbed: {
      color: '#f43f5e',
      description: '### **🗑️ Pesan Dihapus**',
      fields: [
        { name: 'Pengirim', value: '@dipa', inline: true },
        { name: 'Saluran', value: '#umum', inline: true },
        { name: 'Isi Pesan', value: 'Harap tidak mengirimkan pesan spam di sini.' }
      ],
      footer: 'dipa: 333105200942546946 | #umum: 1486233076160925881'
    }
  },
  voice_join_leave: {
    title: '🔊 Log Aktivitas Saluran Voice',
    subtitle: 'Bergabung, meninggalkan, dan berpindah saluran voice.',
    desc: 'Memantau aktivitas bergabung, keluar, serta perpindahan anggota di antara saluran Voice server Anda.',
    color: '#10b981',
    events: [
      { emoji: '🔊', title: 'Bergabung ke Voice', text: 'Mencatat waktu bergabung anggota ke saluran Voice.' },
      { emoji: '🔇', title: 'Meninggalkan Voice', text: 'Mencatat waktu keluar dan menghitung durasi sesi Voice.' },
      { emoji: '🔄', title: 'Berpindah Saluran Voice', text: 'Melacak perpindahan anggota antar saluran Voice.' }
    ],
    mockEmbed: {
      color: '#10b981',
      description: '### **🔊 Bergabung ke Saluran Voice**\n@dipa telah bergabung ke saluran Voice 📚┇Belajar!.',
      footer: 'dipa: 333105200942546946 | #Belajar!: 1486233076160925881'
    }
  },
  voice_mute_deafen: {
    title: '🎙️ Log Status Suara & Media Voice',
    subtitle: 'Mute, deafen, kamera video, dan screen sharing.',
    desc: 'Melacak perubahan status mikrofon, pendengaran, kamera video, serta pembagian layar anggota di saluran Voice.',
    color: '#3b82f6',
    events: [
      { emoji: '🎙️', title: 'Mikrofon (Mute/Unmute)', text: 'Mendeteksi penonaktifan atau pengaktifan mikrofon mandiri.' },
      { emoji: '🎧', title: 'Pendengaran (Deaf/Undeaf)', text: 'Mendeteksi penonaktifan atau pengaktifan pendengaran mandiri.' },
      { emoji: '📷', title: 'Kamera Video', text: 'Mencatat waktu pengaktifan atau penonaktifan kamera video.' },
      { emoji: '🖥️', title: 'Screen Share (Berbagi Layar)', text: 'Mendeteksi dimulainya atau dihentikannya aktivitas berbagi layar.' }
    ],
    mockEmbed: {
      color: '#8b5cf6',
      description: '### **🎙️ Mikrofon Dinonaktifkan**\n@dipa menonaktifkan mikrofon mereka di 📚┇Belajar!.',
      footer: 'dipa: 333105200942546946 | #Belajar!: 1486233076160925881'
    }
  },
  member: {
    title: '👤 Log Profil Anggota',
    subtitle: 'Bergabung/keluar server, perubahan nama panggilan, pembaruan peran.',
    desc: 'Melacak riwayat keanggotaan server serta perubahan nama panggilan lokal dan peran anggota.',
    color: '#f59e0b',
    events: [
      { emoji: '📥', title: 'Bergabung ke Server', text: 'Mencatat anggota baru lengkap dengan umur akun mereka.' },
      { emoji: '📤', title: 'Meninggalkan Server', text: 'Mencatat kepergian anggota beserta durasi keanggotaan mereka.' },
      { emoji: '👤', title: 'Nama Panggilan Berubah', text: 'Mencatat perubahan nama samaran (nickname) lokal di server.' },
      { emoji: '🛡️', title: 'Peran (Role) Ditambah/Dihapus', text: 'Melacak penambahan atau pencabutan peran dari anggota.' }
    ],
    mockEmbed: {
      color: '#3b82f6',
      description: '### **👤 Nama Panggilan (Nickname) Berubah**\n@dipa mengubah nama panggilan mereka',
      fields: [
        { name: 'Sebelum', value: 'Dipa S.', inline: true },
        { name: 'Sesudah', value: 'Dipa Voice', inline: true }
      ],
      footer: 'dipa: 333105200942546946'
    }
  },
  server: {
    title: '⚙️ Log Konfigurasi Server',
    subtitle: 'Saluran dibuat/dihapus, peran dibuat/dihapus, emoji diperbarui.',
    desc: 'Melacak modifikasi struktural server oleh administrator atau bot untuk menjaga keamanan tata kelola.',
    color: '#8b5cf6',
    events: [
      { emoji: '📁', title: 'Saluran Dibuat/Dihapus/Diedit', text: 'Melacak perubahan kategori, teks, atau saluran Voice.' },
      { emoji: '🛡️', title: 'Peran Dibuat/Dihapus/Diedit', text: 'Mencatat perubahan izin, warna, atau pembuatan peran baru.' },
      { emoji: '😀', title: 'Emoji Dibuat/Dihapus', text: 'Memantau penambahan atau penghapusan emoji kustom server.' }
    ],
    mockEmbed: {
      color: '#10b981',
      description: '### **📁 Saluran Dibuat**',
      fields: [
        { name: 'Nama Saluran', value: '#pengumuman', inline: true },
        { name: 'Dibuat Oleh', value: '@dipa', inline: true }
      ],
      footer: 'dipa: 333105200942546946 | #pengumuman: 1486233076160925881'
    }
  },
  gaming_activity: {
    title: '🎮 Log Aktivitas Bermain Game',
    subtitle: 'Mulai dan selesai bermain game.',
    desc: 'Mendeteksi dan mencatat waktu ketika anggota mulai atau selesai bermain judul game terintegrasi.',
    color: '#f43f5e',
    events: [
      { emoji: '🎮', title: 'Mulai/Selesai Bermain Game', text: 'Mendeteksi judul game (seperti Valorant, Minecraft) beserta durasi bermain.' }
    ],
    mockEmbed: {
      color: '#10b981',
      description: '### **🎮 Mulai Bermain Game**\n@dipa telah mulai bermain **Minecraft**.',
      footer: 'dipa: 333105200942546946'
    }
  },
  spotify_activity: {
    title: '🎵 Log Aktivitas Spotify',
    subtitle: 'Mendengarkan musik Spotify.',
    desc: 'Mendeteksi judul lagu dan artis yang sedang diputar oleh anggota server secara real-time.',
    color: '#1db954',
    events: [
      { emoji: '🎵', title: 'Mendengarkan Spotify', text: 'Melacak judul lagu, album, dan artis yang sedang diputar.' }
    ],
    mockEmbed: {
      color: '#1db954',
      description: '### **🎵 Mendengarkan Spotify**\n@dipa sedang mendengarkan musik',
      fields: [
        { name: 'Judul Lagu', value: '**Bohemian Rhapsody**', inline: true },
        { name: 'Artis', value: '*Queen*', inline: true }
      ],
      footer: 'dipa: 333105200942546946'
    }
  }
};

export default function Dashboard() {
  const { selectedGuild, guilds, setSelectedGuild } = useApp();
  const [channels, setChannels] = useState([]);
  const [roles, setRoles] = useState([]);
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [expandedCats, setExpandedCats] = useState({
    moderation: false,
    voice_join_leave: false,
    voice_mute_deafen: false,
    member: false,
    server: false,
    gaming_activity: false,
    spotify_activity: false
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

    // Fetch roles list
    fetch(`/api/guilds/${selectedGuild.id}/roles`)
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        setRoles(data);
      })
      .catch(err => console.error('Failed to load roles:', err));
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
          Anda tidak memiliki server yang terhubung dengan bot Discord.
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
          <p style={{ color: 'hsl(var(--text-secondary))', marginTop: '4px' }}>Sesuaikan saluran log dan kategori peristiwa untuk bot Anda.</p>
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
              <h3 style={{ fontSize: '1.25rem', color: 'white' }}>🎯 Saluran Log Utama</h3>
              <p style={{ fontSize: '0.88rem', color: 'hsl(var(--text-secondary))' }}>
                Seluruh aktivitas server yang dipantau akan dikirimkan sebagai pesan embed ke saluran ini.
              </p>
              
              <select
                value={settings.log_channel_id || ''}
                onChange={(e) => setSettings(prev => ({ ...prev, log_channel_id: e.target.value }))}
                className="input-glass"
                style={{ cursor: 'pointer' }}
              >
                <option value="" style={{ backgroundColor: 'black' }}>-- Pilih Saluran Teks --</option>
                {channels.map(ch => (
                  <option key={ch.id} value={ch.id} style={{ backgroundColor: 'black' }}>
                    #{ch.name}
                  </option>
                ))}
              </select>
            </div>

            {/* DeepSeek AI Configuration */}
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'white' }}>🤖 Konfigurasi Otak AI (DeepSeek)</h3>
              <p style={{ fontSize: '0.88rem', color: 'hsl(var(--text-secondary))' }}>
                Pilih model kecerdasan buatan (AI) DeepSeek yang akan digunakan saat merespons obrolan di server Anda.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <select
                  value={settings.ai_model || 'deepseek-chat'}
                  onChange={(e) => setSettings(prev => ({ ...prev, ai_model: e.target.value }))}
                  className="input-glass"
                  style={{ cursor: 'pointer' }}
                >
                  <option value="deepseek-chat" style={{ backgroundColor: 'black' }}>⚡ Model Tercepat (deepseek-chat)</option>
                  <option value="deepseek-reasoner" style={{ backgroundColor: 'black' }}>🧠 Model Terpintar / Pemikir (deepseek-reasoner)</option>
                </select>
                
                <div style={{ 
                  fontSize: '0.82rem', 
                  color: 'hsl(var(--text-muted))', 
                  backgroundColor: 'rgba(255, 255, 255, 0.02)', 
                  padding: '14px', 
                  borderRadius: '8px',
                  border: '1px solid hsl(var(--border-glass))',
                  lineHeight: '1.5'
                }}>
                  {settings.ai_model === 'deepseek-reasoner' ? (
                    <span>
                      ℹ️ <strong>Mode Pemikir Terpilih (deepseek-reasoner)</strong>:<br/>
                      Sangat cocok untuk pertanyaan berat, analisis kode, dan penyelesaian masalah rumit. 
                      <span style={{ color: '#f59e0b', fontWeight: 'bold' }}> Catatan: Waktu tunggu balasan akan lebih lama (bisa mencapai 30-60 detik) karena AI melakukan proses berpikir mendalam terlebih dahulu.</span>
                    </span>
                  ) : (
                    <span>
                      ℹ️ <strong>Mode Tercepat Terpilih (deepseek-chat)</strong>:<br/>
                      Sangat cepat, responsif, dan hemat. Cocok untuk obrolan santai sehari-hari, sapaan, dan pertanyaan umum yang ringan.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Welcome & Auto-Role Settings */}
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.5rem' }}>📥</span>
                <div>
                  <h3 style={{ fontSize: '1.25rem', color: 'white' }}>📥 Fitur Welcome & Auto-Role</h3>
                  <p style={{ fontSize: '0.82rem', color: 'hsl(var(--text-secondary))', marginTop: '2px' }}>
                    Sapa anggota baru yang bergabung ke server Anda secara otomatis dan sematkan peran langsung.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', flexWrap: 'wrap' }}>
                
                {/* Welcomer Column */}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '16px',
                  borderRight: window.innerWidth > 768 ? '1px solid hsl(var(--border-glass))' : 'none',
                  paddingRight: window.innerWidth > 768 ? '24px' : '0'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ color: 'white', fontSize: '1.05rem', fontWeight: '600' }}>👋 Pesan Selamat Datang</h4>
                    
                    {/* Toggle Switch */}
                    <label style={{
                      position: 'relative',
                      display: 'inline-block',
                      width: '48px',
                      height: '24px',
                      cursor: 'pointer'
                    }}>
                      <input 
                        type="checkbox" 
                        checked={!!settings.welcome_enabled} 
                        onChange={(e) => setSettings(prev => ({ ...prev, welcome_enabled: e.target.checked }))}
                        style={{ opacity: 0, width: 0, height: 0 }} 
                      />
                      <span style={{
                        position: 'absolute',
                        cursor: 'pointer',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: settings.welcome_enabled ? '#10b981' : '#3f3f46',
                        transition: '0.3s',
                        borderRadius: '34px',
                        border: '1px solid hsl(var(--border-glass))'
                      }}>
                        <span style={{
                          position: 'absolute',
                          height: '16px',
                          width: '16px',
                          left: settings.welcome_enabled ? '26px' : '4px',
                          bottom: '3px',
                          backgroundColor: 'white',
                          transition: '0.3s',
                          borderRadius: '50%',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }} />
                      </span>
                    </label>
                  </div>

                  {settings.welcome_enabled && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <label style={{ fontSize: '0.88rem', color: 'hsl(var(--text-secondary))' }}>Saluran Sapaan:</label>
                      <select
                        value={settings.welcome_channel_id || ''}
                        onChange={(e) => setSettings(prev => ({ ...prev, welcome_channel_id: e.target.value || null }))}
                        className="input-glass"
                        style={{ cursor: 'pointer' }}
                      >
                        <option value="" style={{ backgroundColor: 'black' }}>-- Pilih Saluran Sapaan --</option>
                        {channels.map(ch => (
                          <option key={ch.id} value={ch.id} style={{ backgroundColor: 'black' }}>
                            #{ch.name}
                          </option>
                        ))}
                      </select>

                      <label style={{ fontSize: '0.88rem', color: 'hsl(var(--text-secondary))', marginTop: '6px' }}>Isi Pesan Sapaan:</label>
                      <textarea
                        value={settings.welcome_message || ''}
                        onChange={(e) => setSettings(prev => ({ ...prev, welcome_message: e.target.value }))}
                        className="input-glass"
                        style={{ 
                          minHeight: '80px', 
                          resize: 'vertical', 
                          fontFamily: 'inherit',
                          fontSize: '0.88rem',
                          padding: '10px'
                        }}
                        placeholder="Contoh: Selamat datang, {user}!"
                      />
                      <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', lineHeight: '1.4' }}>
                        💡 Gunakan tag <code>{"{user}"}</code> untuk menyebut/mention anggota baru secara dinamis.
                      </span>
                    </div>
                  )}
                </div>

                {/* Auto-Role Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ color: 'white', fontSize: '1.05rem', fontWeight: '600' }}>🛡️ Peran Otomatis (Auto-Role)</h4>
                    
                    {/* Toggle Switch */}
                    <label style={{
                      position: 'relative',
                      display: 'inline-block',
                      width: '48px',
                      height: '24px',
                      cursor: 'pointer'
                    }}>
                      <input 
                        type="checkbox" 
                        checked={!!settings.autorole_enabled} 
                        onChange={(e) => setSettings(prev => ({ ...prev, autorole_enabled: e.target.checked }))}
                        style={{ opacity: 0, width: 0, height: 0 }} 
                      />
                      <span style={{
                        position: 'absolute',
                        cursor: 'pointer',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: settings.autorole_enabled ? '#10b981' : '#3f3f46',
                        transition: '0.3s',
                        borderRadius: '34px',
                        border: '1px solid hsl(var(--border-glass))'
                      }}>
                        <span style={{
                          position: 'absolute',
                          height: '16px',
                          width: '16px',
                          left: settings.autorole_enabled ? '26px' : '4px',
                          bottom: '3px',
                          backgroundColor: 'white',
                          transition: '0.3s',
                          borderRadius: '50%',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }} />
                      </span>
                    </label>
                  </div>

                  {settings.autorole_enabled && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <label style={{ fontSize: '0.88rem', color: 'hsl(var(--text-secondary))' }}>Peran Yang Diberikan:</label>
                      <select
                        value={settings.autorole_role_id || ''}
                        onChange={(e) => setSettings(prev => ({ ...prev, autorole_role_id: e.target.value || null }))}
                        className="input-glass"
                        style={{ cursor: 'pointer' }}
                      >
                        <option value="" style={{ backgroundColor: 'black' }}>-- Pilih Peran Discord --</option>
                        {roles.map(role => (
                          <option key={role.id} value={role.id} style={{ backgroundColor: 'black' }}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                      <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', lineHeight: '1.4' }}>
                        ⚠️ Pastikan peran bot berada di atas peran yang dipilih ini agar proses penugasan tidak gagal.
                      </span>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Event Category Cards */}
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'white' }}>📋 Aktifkan Kategori Log</h3>
              <p style={{ fontSize: '0.88rem', color: 'hsl(var(--text-secondary))' }}>Tentukan kategori log yang ingin dicatat oleh bot Anda.</p>

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
                              {isEnabled ? 'Aktif' : 'Nonaktif'}
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
                            <span>ℹ️</span> {isExpanded ? 'Tutup Deskripsi' : 'Penjelasan & Contoh'}
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
                Warna garis tepi embed pesan log yang akan ditampilkan di Discord Anda.
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
                    🔊 Bergabung ke Saluran Voice
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#dbdee1', lineHeight: '1.4' }}>
                    <span style={{ backgroundColor: 'rgba(88, 101, 242, 0.15)', color: '#5865f2', padding: '0 4px', borderRadius: '3px', fontWeight: '500' }}>@dipa</span> telah bergabung ke saluran Voice <span style={{ backgroundColor: 'rgba(88, 101, 242, 0.15)', color: '#5865f2', padding: '0 4px', borderRadius: '3px', fontWeight: '500' }}>📚┇Belajar!</span>
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
