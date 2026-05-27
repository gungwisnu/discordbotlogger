import React, { useState, useEffect } from 'react';
import { useApp } from '../App';

export default function ReactionRoles() {
  const { selectedGuild } = useApp();
  const [reactionRoles, setReactionRoles] = useState([]);
  const [channels, setChannels] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentConfig, setCurrentConfig] = useState(null);
  const [saving, setSaving] = useState(false);
  const [postingId, setPostingId] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success'); // success or error

  // Load reaction roles, channels, and roles
  useEffect(() => {
    if (!selectedGuild) return;
    setLoading(true);
    
    // Fetch channels
    fetch(`/api/guilds/${selectedGuild.id}/channels`)
      .then(res => res.json())
      .then(data => setChannels(data || []))
      .catch(err => console.error('Gagal memuat channels:', err));

    // Fetch roles
    fetch(`/api/guilds/${selectedGuild.id}/roles`)
      .then(res => res.json())
      .then(data => setRoles(data || []))
      .catch(err => console.error('Gagal memuat roles:', err));

    // Fetch configurations
    fetch(`/api/guilds/${selectedGuild.id}/reaction-roles`)
      .then(res => res.json())
      .then(data => {
        setReactionRoles(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Gagal memuat reaction roles:', err);
        setLoading(false);
      });
  }, [selectedGuild]);

  const showFeedback = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 4000);
  };

  const handleCreateNew = () => {
    setCurrentConfig({
      id: '',
      name: 'Reaction Roles Baru',
      channel_id: channels[0]?.id || '',
      message_type: 'plain',
      plain_content: 'Pilih peran di bawah ini:',
      embed_title: 'Reaction Roles',
      embed_description: 'Pilih peran di bawah ini untuk mendapatkan role.',
      embed_color: '#6366f1',
      selection_type: 'dropdowns',
      options: [
        { emoji: '⚫', role_id: '', label: 'Hitam', description: 'Ganti warna nama profil menjadi Hitam' }
      ]
    });
    setIsEditing(true);
  };

  const handleEdit = (config) => {
    setCurrentConfig(JSON.parse(JSON.stringify(config))); // Deep copy
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus konfigurasi Reaction Roles ini?')) return;

    try {
      const res = await fetch(`/api/guilds/${selectedGuild.id}/reaction-roles/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setReactionRoles(prev => prev.filter(rr => rr.id !== id));
        showFeedback('✓ Konfigurasi Reaction Roles berhasil dihapus!');
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Gagal menghapus.');
      }
    } catch (err) {
      showFeedback(`❌ Error: ${err.message}`, 'error');
    }
  };

  const handleSave = async () => {
    if (!currentConfig.name.trim()) return showFeedback('❌ Nama konfigurasi wajib diisi.', 'error');
    if (!currentConfig.channel_id) return showFeedback('❌ Saluran target wajib dipilih.', 'error');
    if (currentConfig.options.length === 0) return showFeedback('❌ Minimal harus ada 1 opsi pilihan role.', 'error');
    
    // Check if roles are selected
    const missingRoles = currentConfig.options.some(opt => !opt.role_id);
    if (missingRoles) return showFeedback('❌ Seluruh opsi harus memiliki peran (Role) yang terpilih.', 'error');

    setSaving(true);
    const method = currentConfig.id ? 'PUT' : 'POST';
    const url = currentConfig.id 
      ? `/api/guilds/${selectedGuild.id}/reaction-roles/${currentConfig.id}`
      : `/api/guilds/${selectedGuild.id}/reaction-roles`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentConfig)
      });

      if (res.ok) {
        const data = await res.json();
        if (method === 'POST') {
          setReactionRoles(prev => [...prev, data.config]);
        } else {
          setReactionRoles(prev => prev.map(rr => rr.id === data.config.id ? data.config : rr));
        }
        setIsEditing(false);
        setCurrentConfig(null);
        showFeedback('✓ Konfigurasi Reaction Roles berhasil disimpan!');
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Gagal menyimpan.');
      }
    } catch (err) {
      showFeedback(`❌ Error: ${err.message}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePostToDiscord = async (id) => {
    setPostingId(id);
    try {
      const res = await fetch(`/api/guilds/${selectedGuild.id}/reaction-roles/${id}/post`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setReactionRoles(prev => prev.map(rr => rr.id === id ? { ...rr, message_id: data.messageId } : rr));
        showFeedback('✓ Pesan Reaction Roles berhasil diposting ke Discord!');
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Gagal mengirim.');
      }
    } catch (err) {
      showFeedback(`❌ Error: ${err.message}`, 'error');
    } finally {
      setPostingId(null);
    }
  };

  const handleAddOption = () => {
    setCurrentConfig(prev => ({
      ...prev,
      options: [...prev.options, { emoji: '⚫', role_id: '', label: 'Role Baru', description: 'Deskripsi Opsi' }]
    }));
  };

  const handleRemoveOption = (index) => {
    setCurrentConfig(prev => ({
      ...prev,
      options: prev.options.filter((_, idx) => idx !== index)
    }));
  };

  const handleOptionChange = (index, field, value) => {
    setCurrentConfig(prev => {
      const opts = [...prev.options];
      opts[index] = { ...opts[index], [field]: value };
      return { ...prev, options: opts };
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '20px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid hsla(var(--primary-glow), 0.2)',
          borderTopColor: 'hsl(var(--primary-glow))',
          borderRadius: '50%',
          animation: 'spin 1.2s linear infinite'
        }} />
        <span style={{ fontFamily: 'var(--font-display)', color: 'hsl(var(--text-secondary))', fontWeight: '600', fontSize: '0.85rem' }}>
          MEMUAT REACTION ROLES...
        </span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid hsl(var(--border-glass))', paddingBottom: '18px' }}>
        <div>
          <h2 className="font-display" style={{ fontSize: '1.75rem', fontWeight: '800', color: 'hsl(var(--text-primary))' }}>
            🎭 Reaction Roles
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'hsl(var(--text-secondary))', marginTop: '4px' }}>
            Berikan kebebasan bagi anggota server untuk memilih peran/role mereka secara interaktif dengan tombol, menu dropdown, atau reaksi.
          </p>
        </div>
        
        {!isEditing && (
          <button className="btn-primary" onClick={handleCreateNew} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Buat Reaction Roles
          </button>
        )}
      </div>

      {/* Global Status Message */}
      {message && (
        <div style={{
          padding: '12px 18px',
          borderRadius: '12px',
          fontSize: '0.92rem',
          fontWeight: '600',
          backgroundColor: messageType === 'success' ? 'hsla(var(--success-emerald), 0.12)' : 'hsla(var(--danger-crimson), 0.12)',
          border: `1px solid ${messageType === 'success' ? 'hsl(var(--success-emerald))' : 'hsl(var(--danger-crimson))'}`,
          color: messageType === 'success' ? 'hsl(var(--success-emerald))' : 'hsl(var(--danger-crimson))',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {message}
        </div>
      )}

      {/* LIST VIEW (No Active Editing) */}
      {!isEditing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {reactionRoles.length === 0 ? (
            <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'hsla(var(--primary-glow), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--primary-glow))' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="11" r="3"/><path d="M12 14v4"/></svg>
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: 'hsl(var(--text-primary))', fontWeight: '700' }}>Belum ada Reaction Roles</h3>
                <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-secondary))', marginTop: '6px', maxWidth: '400px', margin: '6px auto 0' }}>
                  Anda belum membuat setelan Reaction Roles. Klik tombol di atas untuk mulai membuat setelan peran interaktif pertama Anda!
                </p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }} className="settings-grid">
              {reactionRoles.map(rr => (
                <div key={rr.id} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ fontSize: '1.15rem', color: 'hsl(var(--text-primary))', fontWeight: '750' }}>{rr.name}</h4>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        padding: '2px 8px',
                        borderRadius: '8px',
                        backgroundColor: 'hsla(var(--primary-glow), 0.15)',
                        color: 'hsl(var(--primary-glow))'
                      }}>
                        {rr.selection_type}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '14px' }}>
                      <div style={{ display: 'flex', gap: '6px', fontSize: '0.82rem', color: 'hsl(var(--text-secondary))' }}>
                        <span style={{ fontWeight: '600' }}>Saluran:</span>
                        <span>#{channels.find(c => c.id === rr.channel_id)?.name || rr.channel_id || 'Tidak diketahui'}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', fontSize: '0.82rem', color: 'hsl(var(--text-secondary))' }}>
                        <span style={{ fontWeight: '600' }}>Tipe Pesan:</span>
                        <span>{rr.message_type === 'plain' ? 'Plain Text' : 'Embed Message'}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', fontSize: '0.82rem', color: 'hsl(var(--text-secondary))' }}>
                        <span style={{ fontWeight: '600' }}>Jumlah Peran:</span>
                        <span>{rr.options?.length || 0} peran</span>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', fontSize: '0.82rem', color: 'hsl(var(--text-secondary))', alignItems: 'center' }}>
                        <span style={{ fontWeight: '600' }}>Status Discord:</span>
                        {rr.message_id ? (
                          <span style={{ color: 'hsl(var(--success-emerald))', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor' }} />
                            Aktif (ID: {rr.message_id.slice(-6)}...)
                          </span>
                        ) : (
                          <span style={{ color: 'hsl(var(--warning-amber))', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor' }} />
                            Belum Diposting
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid hsl(var(--border-glass))', paddingTop: '16px' }}>
                    <button 
                      className="btn-primary" 
                      onClick={() => handlePostToDiscord(rr.id)} 
                      disabled={postingId !== null}
                      style={{ flex: 1, padding: '8px 12px', fontSize: '0.8rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                    >
                      {postingId === rr.id ? 'Mengirim...' : rr.message_id ? '🔄 Re-Post / Sync' : '🚀 Posting ke Discord'}
                    </button>
                    
                    <button 
                      className="btn-secondary" 
                      onClick={() => handleEdit(rr)}
                      style={{ padding: '8px 12px', fontSize: '0.8rem', borderRadius: '10px' }}
                    >
                      Edit
                    </button>
                    
                    <button 
                      className="btn-secondary" 
                      onClick={() => handleDelete(rr.id)}
                      style={{ padding: '8px 12px', fontSize: '0.8rem', borderRadius: '10px', borderColor: 'hsla(var(--danger-crimson), 0.2)', color: 'hsl(var(--danger-crimson))' }}
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* FORM EDIT / BUAT BARU VIEW (Split 2 Columns: Form vs Live Preview) */
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px' }} className="settings-grid">
          
          {/* LEFT COLUMN: FORM CONFIGURATION */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* MESSAGE SETTINGS PANEL */}
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'hsl(var(--text-primary))', fontWeight: '750', borderBottom: '1px solid hsl(var(--border-glass))', paddingBottom: '10px' }}>
                MESSAGE SETTINGS
              </h3>

              {/* Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.88rem', color: 'hsl(var(--text-primary))', fontWeight: '600' }}>Nama Konfigurasi</label>
                <input 
                  type="text" 
                  value={currentConfig.name} 
                  onChange={(e) => setCurrentConfig(prev => ({ ...prev, name: e.target.value }))}
                  className="input-glass"
                  placeholder="Misalnya: Warnai Aku"
                />
              </div>

              {/* Target Channel */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.88rem', color: 'hsl(var(--text-primary))', fontWeight: '600' }}>Channel to post</label>
                <select 
                  value={currentConfig.channel_id} 
                  onChange={(e) => setCurrentConfig(prev => ({ ...prev, channel_id: e.target.value }))}
                  className="input-glass"
                  style={{ backgroundColor: 'hsl(var(--panel-glass))', color: 'hsl(var(--text-primary))' }}
                >
                  <option value="" disabled>-- Pilih Saluran Teks Discord --</option>
                  {channels.map(ch => (
                    <option key={ch.id} value={ch.id} style={{ backgroundColor: 'hsl(var(--bg-space))' }}>
                      📢 #{ch.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message Type */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.88rem', color: 'hsl(var(--text-primary))', fontWeight: '600' }}>Message Type</label>
                <div style={{ display: 'flex', gap: '30px', marginTop: '4px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'hsl(var(--text-primary))' }}>
                    <input 
                      type="radio" 
                      name="msg_type"
                      checked={currentConfig.message_type === 'plain'}
                      onChange={() => setCurrentConfig(prev => ({ ...prev, message_type: 'plain' }))}
                      style={{ cursor: 'pointer', accentColor: 'hsl(var(--primary-glow))' }}
                    />
                    Plain Message
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'hsl(var(--text-primary))' }}>
                    <input 
                      type="radio" 
                      name="msg_type"
                      checked={currentConfig.message_type === 'embed'}
                      onChange={() => setCurrentConfig(prev => ({ ...prev, message_type: 'embed' }))}
                      style={{ cursor: 'pointer', accentColor: 'hsl(var(--primary-glow))' }}
                    />
                    Embed Message
                  </label>
                </div>
              </div>

              {/* Selection Type */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.88rem', color: 'hsl(var(--text-primary))', fontWeight: '600' }}>Selection Type</label>
                <div style={{ display: 'flex', gap: '30px', marginTop: '4px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'hsl(var(--text-primary))' }}>
                    <input 
                      type="radio" 
                      name="sel_type"
                      checked={currentConfig.selection_type === 'reactions'}
                      onChange={() => setCurrentConfig(prev => ({ ...prev, selection_type: 'reactions' }))}
                      style={{ cursor: 'pointer', accentColor: 'hsl(var(--primary-glow))' }}
                    />
                    Reactions
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'hsl(var(--text-primary))' }}>
                    <input 
                      type="radio" 
                      name="sel_type"
                      checked={currentConfig.selection_type === 'buttons'}
                      onChange={() => setCurrentConfig(prev => ({ ...prev, selection_type: 'buttons' }))}
                      style={{ cursor: 'pointer', accentColor: 'hsl(var(--primary-glow))' }}
                    />
                    Buttons
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'hsl(var(--text-primary))' }}>
                    <input 
                      type="radio" 
                      name="sel_type"
                      checked={currentConfig.selection_type === 'dropdowns'}
                      onChange={() => setCurrentConfig(prev => ({ ...prev, selection_type: 'dropdowns' }))}
                      style={{ cursor: 'pointer', accentColor: 'hsl(var(--primary-glow))' }}
                    />
                    Dropdowns
                  </label>
                </div>
              </div>

              {/* Plain Message Text Area */}
              {currentConfig.message_type === 'plain' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.88rem', color: 'hsl(var(--text-primary))', fontWeight: '600' }}>Plain Message Content</label>
                  <textarea 
                    value={currentConfig.plain_content} 
                    onChange={(e) => setCurrentConfig(prev => ({ ...prev, plain_content: e.target.value }))}
                    className="input-glass"
                    rows="4"
                    placeholder="Tulis pesan yang akan ditampilkan di Discord..."
                  />
                </div>
              ) : (
                /* Embed Message Inputs */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', border: '1px dashed hsl(var(--border-glass))', padding: '16px', borderRadius: '12px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'hsl(var(--text-muted))', fontWeight: 'bold' }}>EMBED PARAMS</span>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.82rem', color: 'hsl(var(--text-secondary))', fontWeight: '600' }}>Embed Title</label>
                    <input 
                      type="text" 
                      value={currentConfig.embed_title} 
                      onChange={(e) => setCurrentConfig(prev => ({ ...prev, embed_title: e.target.value }))}
                      className="input-glass"
                      placeholder="Judul Embed"
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.82rem', color: 'hsl(var(--text-secondary))', fontWeight: '600' }}>Embed Description</label>
                    <textarea 
                      value={currentConfig.embed_description} 
                      onChange={(e) => setCurrentConfig(prev => ({ ...prev, embed_description: e.target.value }))}
                      className="input-glass"
                      rows="3"
                      placeholder="Deskripsi Embed..."
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.82rem', color: 'hsl(var(--text-secondary))', fontWeight: '600' }}>Embed Color</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input 
                        type="color" 
                        value={currentConfig.embed_color || '#6366f1'} 
                        onChange={(e) => setCurrentConfig(prev => ({ ...prev, embed_color: e.target.value }))}
                        style={{ border: 'none', width: '36px', height: '36px', borderRadius: '8px', cursor: 'pointer', backgroundColor: 'transparent' }}
                      />
                      <span style={{ fontSize: '0.85rem', fontFamily: 'monospace', color: 'hsl(var(--text-primary))' }}>{currentConfig.embed_color}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SELECTION SETTINGS PANEL (DYNAMIC LIST) */}
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid hsl(var(--border-glass))', paddingBottom: '10px' }}>
                <h3 style={{ fontSize: '1.25rem', color: 'hsl(var(--text-primary))', fontWeight: '750' }}>
                  {currentConfig.selection_type.toUpperCase()} SETTINGS
                </h3>
                <button className="btn-secondary" onClick={handleAddOption} style={{ fontSize: '0.78rem', padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  + Add Option
                </button>
              </div>

              {currentConfig.options.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))', textAlign: 'center', padding: '16px' }}>
                  Belum ada opsi ditambahkan. Klik "+ Add Option" untuk menambahkan pemetaan role.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {currentConfig.options.map((opt, idx) => (
                    <div 
                      key={idx} 
                      style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '60px 1.5fr 1.2fr 1.5fr 40px',
                        alignItems: 'center', 
                        gap: '12px',
                        padding: '16px',
                        borderRadius: '12px',
                        backgroundColor: 'hsla(var(--border-glass), 0.08)',
                        border: '1px solid hsl(var(--border-glass))'
                      }}
                      className="expandable-card-grid"
                    >
                      {/* Emoji */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.72rem', color: 'hsl(var(--text-muted))', fontWeight: 'bold' }}>Emoji</label>
                        <input 
                          type="text" 
                          value={opt.emoji} 
                          onChange={(e) => handleOptionChange(idx, 'emoji', e.target.value)}
                          className="input-glass"
                          style={{ textAlign: 'center', fontSize: '1rem', padding: '6px' }}
                          maxLength="8"
                          placeholder="⚫"
                        />
                      </div>

                      {/* Role Picker */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.72rem', color: 'hsl(var(--text-muted))', fontWeight: 'bold' }}>Roles</label>
                        <select 
                          value={opt.role_id} 
                          onChange={(e) => handleOptionChange(idx, 'role_id', e.target.value)}
                          className="input-glass"
                          style={{ padding: '6px 8px', fontSize: '0.82rem', backgroundColor: 'hsl(var(--panel-glass))', color: 'hsl(var(--text-primary))' }}
                        >
                          <option value="" disabled>-- Pilih Peran --</option>
                          {roles.map(r => (
                            <option key={r.id} value={r.id} style={{ backgroundColor: 'hsl(var(--bg-space))' }}>
                              🛡️ {r.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Option Label */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.72rem', color: 'hsl(var(--text-muted))', fontWeight: 'bold' }}>
                          {currentConfig.selection_type === 'reactions' ? 'Reaction Label (Optional)' : 'Label'}
                        </label>
                        <input 
                          type="text" 
                          value={opt.label || ''} 
                          onChange={(e) => handleOptionChange(idx, 'label', e.target.value)}
                          className="input-glass"
                          style={{ padding: '6px 8px', fontSize: '0.82rem' }}
                          placeholder={roles.find(r => r.id === opt.role_id)?.name || 'Nama Tombol'}
                        />
                      </div>

                      {/* Dropdown Description (Only for dropdowns) */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', opacity: currentConfig.selection_type === 'dropdowns' ? 1 : 0.5 }}>
                        <label style={{ fontSize: '0.72rem', color: 'hsl(var(--text-muted))', fontWeight: 'bold' }}>Description (Dropdown)</label>
                        <input 
                          type="text" 
                          value={opt.description || ''} 
                          disabled={currentConfig.selection_type !== 'dropdowns'}
                          onChange={(e) => handleOptionChange(idx, 'description', e.target.value)}
                          className="input-glass"
                          style={{ padding: '6px 8px', fontSize: '0.82rem' }}
                          placeholder="Deskripsi peran dropdown..."
                        />
                      </div>

                      {/* Delete Option */}
                      <button 
                        onClick={() => handleRemoveOption(idx)}
                        style={{
                          background: 'hsla(var(--danger-crimson), 0.15)',
                          border: '1px solid hsla(var(--danger-crimson), 0.3)',
                          borderRadius: '8px',
                          color: 'hsl(var(--danger-crimson))',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '8px',
                          marginTop: '16px',
                          transition: 'all 0.2s ease'
                        }}
                        className="sidebar-link-hover"
                        title="Hapus Opsi Ini"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div style={{ display: 'flex', gap: '14px', justifyContent: 'flex-end' }}>
              <button 
                className="btn-secondary" 
                onClick={() => {
                  setIsEditing(false);
                  setCurrentConfig(null);
                }}
                disabled={saving}
                style={{ padding: '12px 24px', borderRadius: '12px' }}
              >
                Batalkan
              </button>
              
              <button 
                className="btn-primary" 
                onClick={handleSave}
                disabled={saving}
                style={{ padding: '12px 28px', borderRadius: '12px' }}
              >
                {saving ? 'Menyimpan...' : 'Simpan Setelan'}
              </button>
            </div>

          </div>

          {/* RIGHT COLUMN: LIVE DISCORD PREVIEW SIMULATOR */}
          <div style={{ position: 'sticky', top: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-panel" style={{ padding: '0px', overflow: 'hidden' }}>
              <div style={{ padding: '12px 18px', background: 'hsla(var(--border-glass), 0.1)', borderBottom: '1px solid hsl(var(--border-glass))', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: 'hsl(var(--text-muted))', fontWeight: '700', letterSpacing: '0.05em' }}>LIVE DISCORD PREVIEW</span>
                <span style={{ fontSize: '0.68rem', backgroundColor: '#5865f2', color: 'white', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>BOT MESSAGE</span>
              </div>
              
              <div style={{ padding: '20px', backgroundColor: '#313338' /* Discord dark style */, minHeight: '320px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                {/* Embed or Plain Content Display */}
                {currentConfig.message_type === 'plain' ? (
                  <div style={{ color: '#dbdee1', fontSize: '0.92rem', whiteSpace: 'pre-wrap', fontFamily: 'sans-serif' }}>
                    {currentConfig.plain_content || 'Pilih peran di bawah ini:'}
                  </div>
                ) : (
                  /* Embed Render */
                  <div style={{
                    borderLeft: `4px solid ${currentConfig.embed_color || '#6366f1'}`,
                    backgroundColor: '#2b2d31',
                    padding: '16px',
                    borderRadius: '4px',
                    fontFamily: 'sans-serif',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ color: 'white', fontWeight: '700', fontSize: '0.98rem' }}>
                      {currentConfig.embed_title || 'Reaction Roles'}
                    </div>
                    <div style={{ color: '#dbdee1', fontSize: '0.88rem', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                      {currentConfig.embed_description || 'Pilih peran di bawah ini untuk mendapatkan role.'}
                    </div>
                  </div>
                )}

                {/* RENDER SELECTION COMPONENTS BELOW MESSAGE */}

                {/* 1. REACTIONS PREVIEW */}
                {currentConfig.selection_type === 'reactions' && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                    {currentConfig.options.map((opt, idx) => {
                      if (!opt.emoji) return null;
                      return (
                        <div 
                          key={idx} 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '6px', 
                            backgroundColor: '#2b2d31', 
                            border: '1px solid #3f4248', 
                            padding: '4px 10px', 
                            borderRadius: '8px', 
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            color: '#b5bac1'
                          }}
                        >
                          <span>{opt.emoji}</span>
                          <span style={{ fontWeight: '600', color: '#5865f2', fontSize: '0.78rem' }}>1</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 2. BUTTONS PREVIEW */}
                {currentConfig.selection_type === 'buttons' && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                    {currentConfig.options.map((opt, idx) => (
                      <button
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          backgroundColor: '#4e5058', /* grey button color in discord */
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          padding: '6px 14px',
                          fontSize: '0.82rem',
                          fontWeight: '500',
                          fontFamily: 'sans-serif',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                      >
                        {opt.emoji && <span>{opt.emoji}</span>}
                        <span>{opt.label || roles.find(r => r.id === opt.role_id)?.name || `Role ${idx + 1}`}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* 3. DROPDOWNS PREVIEW */}
                {currentConfig.selection_type === 'dropdowns' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px', fontFamily: 'sans-serif' }}>
                    <div 
                      style={{
                        backgroundColor: '#1e1f22',
                        border: '1px solid #3f4248',
                        borderRadius: '4px',
                        padding: '10px 12px',
                        color: '#949ba4',
                        fontSize: '0.85rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <span>
                        {currentConfig.plain_content ? currentConfig.plain_content.slice(0, 45) : currentConfig.embed_description ? currentConfig.embed_description.slice(0, 45) : 'Pilih opsi...'}
                        {((currentConfig.plain_content && currentConfig.plain_content.length > 45) || (currentConfig.embed_description && currentConfig.embed_description.length > 45)) ? '...' : ''}
                      </span>
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m1 1 4 4 4-4"/></svg>
                    </div>
                    
                    {/* Simulated Select Menu Dropdown Overlay */}
                    <div 
                      style={{
                        backgroundColor: '#2b2d31',
                        border: '1px solid #1e1f22',
                        borderRadius: '4px',
                        marginTop: '4px',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                      }}
                    >
                      {currentConfig.options.map((opt, idx) => (
                        <div 
                          key={idx}
                          style={{
                            padding: '10px 12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            borderBottom: idx === currentConfig.options.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.03)',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                          }}
                          className="simulated-dropdown-option"
                        >
                          <span style={{ fontSize: '1.05rem' }}>{opt.emoji || '⚫'}</span>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ color: '#dbdee1', fontSize: '0.82rem', fontWeight: '500' }}>
                              {opt.label || roles.find(r => r.id === opt.role_id)?.name || `Opsi ${idx + 1}`}
                            </span>
                            {opt.description && (
                              <span style={{ color: '#949ba4', fontSize: '0.72rem' }}>
                                {opt.description}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Quick Helper Tips Card */}
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h4 style={{ color: 'hsl(var(--text-primary))', fontSize: '0.98rem', fontWeight: '700' }}>💡 Tips Reaction Roles</h4>
              <ul style={{ padding: '0 0 0 16px', margin: 0, fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', display: 'flex', flexDirection: 'column', gap: '6px', lineHeight: '1.4' }}>
                <li>Pastikan peran bot <strong>Pandu Discord Bot</strong> berada di urutan atas dalam daftar peran (roles) server.</li>
                <li>Gunakan <strong>Unicode Emoji</strong> standar untuk menjamin kompabilitas reaksi.</li>
                <li><strong>Dropdowns</strong> mendukung penonaktifan secara otomatis antar pilihan role jika salah satu opsi dipilih (eksklusif).</li>
                <li>Klik tombol <strong>"Simpan Setelan"</strong> terlebih dahulu sebelum melakukan posting pertama kali.</li>
              </ul>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
