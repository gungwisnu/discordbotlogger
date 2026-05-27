import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../App';
import './ReactionRoles.css';

const STANDARD_EMOJIS = {
  smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😋', '😛', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳', '😏', '😒', '😞', '😔', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '🤔', '🤫', '🫠', '🫣', '🫡', '🥱'],
  animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🕷️', 'Scorpion', '🐢', '🐍', '🦎', ' Octopus ', ' Squid ', ' Lobster ', ' Crab ', '🐡', '🐠', '🐬', '🐳', '🦈'],
  food: ['🍏', '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', ' Broccoli ', '🥬', '🥒', '🌶️', '🌽', '🥕', '🥔', '🍞', '🥐', '🥖', '🥨', '🧀', '🍳', '🥞', ' waffle ', '🥓', '🥩', '🍔', '🍟', '🍕', '🌭', '🥪', '🌮', '🌯', '🍿', '🧁', '🍩', '🍪', '🎂', '🍫', '🍬', '🍭'],
  activities: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🏒', '🏹', '🎣', '🥊', '🥋', '🛹', '🛼', '🏋️', '🚴', '🏊', '🤽', '🤸', '🤾', '🏌️', '🏇', '🧘', '🎮', '🕹️', '🎰', '🎲', '🧩', '🎭', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸', '🪕', '🎻'],
  travel: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🛵', '🚲', '🛴', '🛹', '🚏', '🛣️', '🚂', '✈️', '🚁', '🚀', '🛸', '⛵', '🚢', '⚓', '🌙', '☀️', '☁️', '🌧️', '❄️', '🌋', '⛺', '🏕️', '🏖️', '⛰️', '🏛️', '⛪', '🕌', '⛩️', '🎡', '🎢', '🗼', '🗻'],
  objects: ['💡', '🔦', '🕯️', '🗑️', '🛒', '💸', '💵', '🪙', '💳', '💎', '⚖️', '🔧', '🔨', '⚒️', '⛏️', '🪓', '⚙️', '🧲', '🔫', '💣', '🛡️', '⚔️', '🔮', '🔭', '🔬', '🧪', '🩹', '🩺', '🔑', '🗝️', '📦', '📫', '✉️', '✏️', '📝', '📂', '📅', '📖', '📌', '📎', '✂️', '☎️', '💻', '📷', '📺', '⌚'],
  symbols: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☯️', '✡️', '☸️', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '⛎', '🎴', '🌀', '💤', '🛑', '⚠️', '🚫', '💯', '💲'],
  flags: ['🏁', '🚩', '🏴', '🏳️', '🇮🇩', '🇺🇸', '🇯🇵', '🇬🇧', '🇰🇷', '🇨🇳', '🇩🇪', '🇫🇷', '🇪🇸', '🇮🇹', '🇷🇺', '🇨🇦', '🇦🇺', '🇧🇷', '🇮🇳', '🇸🇬', '🇲🇾', '🇹🇭', '🇻🇳', '🇵🇭', '🇸🇦', '🇹🇷', '🇪🇬', '🇿🇦', '🇳🇿', '🇲🇽', '🇨🇭', '🇳🇱', '🇧🇪', '🇸🇪', '🇳🇴', '🇫🇮', '🇩🇰', '🇮🇪', '🇦🇹', '🇵🇱', '🇺🇦']
};

const CATEGORY_NAMES = {
  custom: 'Server Custom Emojis',
  smileys: 'Smileys & People',
  animals: 'Animals & Nature',
  food: 'Food & Drink',
  activities: 'Activities & Sports',
  travel: 'Travel & Places',
  objects: 'Objects',
  symbols: 'Symbols',
  flags: 'Flags'
};

// Premium Custom Reusable Emoji Picker Component
function EmojiPicker({ selectedEmoji, onSelect, customEmojis }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(customEmojis.length > 0 ? 'custom' : 'smileys');
  const [searchQuery, setSearchQuery] = useState('');
  const pickerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter emojis based on query
  const getFilteredEmojis = () => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      if (activeTab === 'custom') return { custom: customEmojis };
      return { [activeTab]: STANDARD_EMOJIS[activeTab] };
    }

    const filtered = {};
    
    // Filter Custom Emojis
    const matchingCustom = customEmojis.filter(e => e.name.toLowerCase().includes(query));
    if (matchingCustom.length > 0) filtered.custom = matchingCustom;

    // Filter Standard Emojis
    Object.entries(STANDARD_EMOJIS).forEach(([cat, list]) => {
      const match = list.filter(emoji => emoji.includes(query) || cat.includes(query));
      if (match.length > 0) filtered[cat] = match;
    });

    return filtered;
  };

  const filteredData = getFilteredEmojis();

  // Helper to draw emoji representation
  const renderEmojiIcon = (val) => {
    if (!val) return '⚫';
    // Check if Custom Emoji (e.g. numeric ID or <a:name:id> or custom object representation)
    const matchedCustom = customEmojis.find(e => e.id === val || e.name === val || val.includes(e.id));
    if (matchedCustom) {
      return <img src={matchedCustom.url} alt={matchedCustom.name} style={{ width: '20px', height: '20px', objectFit: 'contain', borderRadius: '4px' }} />;
    }
    return val;
  };

  return (
    <div style={{ position: 'relative' }} ref={pickerRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '10px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.2rem',
          transition: 'all 0.2s'
        }}
        title="Klik untuk memilih emoji"
      >
        {renderEmojiIcon(selectedEmoji)}
      </div>

      {isOpen && (
        <div className="emoji-picker-container">
          {/* Search bar */}
          <div className="emoji-picker-search">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-glass"
              style={{ fontSize: '0.8rem', padding: '6px 12px', width: '100%' }}
              placeholder="🔍 Search emoji..."
              autoFocus
            />
          </div>

          {/* Tabs */}
          {!searchQuery && (
            <div className="emoji-picker-tabs">
              {customEmojis.length > 0 && (
                <button 
                  onClick={() => setActiveTab('custom')}
                  className={`emoji-picker-tab-btn ${activeTab === 'custom' ? 'active' : ''}`}
                  title="Server Emojis"
                >
                  ⭐
                </button>
              )}
              {Object.keys(STANDARD_EMOJIS).map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  className={`emoji-picker-tab-btn ${activeTab === cat ? 'active' : ''}`}
                  title={CATEGORY_NAMES[cat]}
                >
                  {cat === 'smileys' ? '😀' : cat === 'animals' ? '🐶' : cat === 'food' ? '🍏' : cat === 'activities' ? '⚽' : cat === 'travel' ? '🚗' : cat === 'objects' ? '💡' : cat === 'symbols' ? '❤️' : '🏁'}
                </button>
              ))}
            </div>
          )}

          {/* Emoji Grid Scroll */}
          <div className="emoji-picker-scroll">
            {Object.entries(filteredData).map(([cat, list]) => (
              <div key={cat} style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="emoji-picker-category-title">{CATEGORY_NAMES[cat]}</span>
                <div className="emoji-picker-grid">
                  {cat === 'custom' ? (
                    list.map(e => (
                      <button
                        key={e.id}
                        onClick={() => {
                          onSelect(e.id); // store by numeric custom ID
                          setIsOpen(false);
                        }}
                        className="emoji-picker-btn emoji-picker-custom-btn"
                        title={`:${e.name}:`}
                      >
                        <img src={e.url} alt={e.name} className="emoji-picker-custom-img" />
                      </button>
                    ))
                  ) : (
                    list.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => {
                          onSelect(emoji);
                          setIsOpen(false);
                        }}
                        className="emoji-picker-btn"
                      >
                        {emoji}
                      </button>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Premium Custom Reusable Multi-Select Role Dropdown Component
function MultiSelect({ allRoles, selectedIds, onChange, placeholder = 'Pilih peran...' }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (id) => {
    const list = [...selectedIds];
    const idx = list.indexOf(id);
    if (idx !== -1) {
      list.splice(idx, 1);
    } else {
      list.push(id);
    }
    onChange(list);
  };

  const handleRemove = (e, id) => {
    e.stopPropagation();
    onChange(selectedIds.filter(x => x !== id));
  };

  return (
    <div className="multi-select-container" ref={containerRef}>
      <div className="multi-select-box" onClick={() => setIsOpen(!isOpen)}>
        {selectedIds.length === 0 ? (
          <span className="multi-select-placeholder">{placeholder}</span>
        ) : (
          selectedIds.map(id => {
            const role = allRoles.find(r => r.id === id);
            return (
              <span key={id} className="multi-select-chip">
                {role ? role.name : `Peran: ${id.slice(-4)}`}
                <button type="button" className="multi-select-chip-remove" onClick={(e) => handleRemove(e, id)}>×</button>
              </span>
            );
          })
        )}
      </div>

      {isOpen && (
        <div className="multi-select-dropdown">
          {allRoles.length === 0 ? (
            <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', padding: '10px', textAlign: 'center' }}>Tidak ada peran.</span>
          ) : (
            allRoles.map(role => {
              const isSelected = selectedIds.includes(role.id);
              return (
                <div 
                  key={role.id}
                  onClick={() => handleToggle(role.id)}
                  className={`multi-select-option ${isSelected ? 'selected' : ''}`}
                >
                  <span>🛡️ {role.name}</span>
                  {isSelected && <span style={{ color: '#818cf8', fontWeight: 'bold' }}>✓</span>}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default function ReactionRoles() {
  const { selectedGuild } = useApp();
  const [reactionRoles, setReactionRoles] = useState([]);
  const [channels, setChannels] = useState([]);
  const [roles, setRoles] = useState([]);
  const [customEmojis, setCustomEmojis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentConfig, setCurrentConfig] = useState(null);
  const [saving, setSaving] = useState(false);
  const [postingId, setPostingId] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success'); 
  const [optionsExpanded, setOptionsExpanded] = useState(true);

  // Load reaction roles, channels, roles, and emojis
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

    // Fetch Custom Emojis
    fetch(`/api/guilds/${selectedGuild.id}/emojis`)
      .then(res => res.json())
      .then(data => setCustomEmojis(data || []))
      .catch(err => console.error('Gagal memuat custom emojis:', err));

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
      
      // Advanced Options properties matching screenshot 2
      type: 'Normal',
      allowed_roles: [],
      ignored_roles: [],
      allow_multiple_roles: false, // exclusive by default for dropdown
      shuffle_roles: false,

      options: [
        { emoji: '⚫', role_ids: [], label: 'Hitam', description: 'Ganti warna nama profil menjadi Hitam' }
      ]
    });
    setOptionsExpanded(true);
    setIsEditing(true);
  };

  const handleEdit = (config) => {
    setCurrentConfig(JSON.parse(JSON.stringify(config))); // Deep copy
    setOptionsExpanded(true);
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
    const missingRoles = currentConfig.options.some(opt => !opt.role_ids || opt.role_ids.length === 0);
    if (missingRoles) return showFeedback('❌ Seluruh opsi harus memiliki minimal 1 peran (Role) yang terpilih.', 'error');

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
      options: [...prev.options, { emoji: '⚫', role_ids: [], label: 'Role Baru', description: 'Deskripsi Opsi' }]
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

  // Helper to draw emoji representation in visual previews
  const renderEmojiRepresentation = (val) => {
    if (!val) return '⚫';
    const matched = customEmojis.find(e => e.id === val || e.name === val || val.includes(e.id));
    if (matched) {
      return <img src={matched.url} alt={matched.name} style={{ width: '18px', height: '18px', objectFit: 'contain', display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }} />;
    }
    return <span style={{ marginRight: '4px' }}>{val}</span>;
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
                        <span style={{ fontWeight: '600' }}>Tipe:</span>
                        <span>{rr.type || 'Normal'}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', fontSize: '0.82rem', color: 'hsl(var(--text-secondary))' }}>
                        <span style={{ fontWeight: '600' }}>Jumlah Opsi:</span>
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
                      onChange={() => setCurrentConfig(prev => ({ ...prev, selection_type: 'reactions', allow_multiple_roles: true }))}
                      style={{ cursor: 'pointer', accentColor: 'hsl(var(--primary-glow))' }}
                    />
                    Reactions
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'hsl(var(--text-primary))' }}>
                    <input 
                      type="radio" 
                      name="sel_type"
                      checked={currentConfig.selection_type === 'buttons'}
                      onChange={() => setCurrentConfig(prev => ({ ...prev, selection_type: 'buttons', allow_multiple_roles: true }))}
                      style={{ cursor: 'pointer', accentColor: 'hsl(var(--primary-glow))' }}
                    />
                    Buttons
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'hsl(var(--text-primary))' }}>
                    <input 
                      type="radio" 
                      name="sel_type"
                      checked={currentConfig.selection_type === 'dropdowns'}
                      onChange={() => setCurrentConfig(prev => ({ ...prev, selection_type: 'dropdowns', allow_multiple_roles: false }))}
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

            {/* SELECTION SETTINGS PANEL (DYNAMIC LIST WITH EMOJI PICKER & MULTI-SELECT ROLES) */}
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', zIndex: 2 }}>
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
                        gridTemplateColumns: '60px 1.8fr 1.2fr 1.2fr 40px',
                        alignItems: 'center', 
                        gap: '12px',
                        padding: '16px',
                        borderRadius: '12px',
                        backgroundColor: 'hsla(var(--border-glass), 0.08)',
                        border: '1px solid hsl(var(--border-glass))'
                      }}
                      className="expandable-card-grid"
                    >
                      {/* Premium Emoji Picker */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.72rem', color: 'hsl(var(--text-muted))', fontWeight: 'bold' }}>Emoji</label>
                        <EmojiPicker 
                          selectedEmoji={opt.emoji} 
                          onSelect={(emojiVal) => handleOptionChange(idx, 'emoji', emojiVal)}
                          customEmojis={customEmojis}
                        />
                      </div>

                      {/* Multi-Select Roles (chip systems!) */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.72rem', color: 'hsl(var(--text-muted))', fontWeight: 'bold' }}>Roles</label>
                        <MultiSelect 
                          allRoles={roles} 
                          selectedIds={opt.role_ids || []} 
                          onChange={(ids) => handleOptionChange(idx, 'role_ids', ids)}
                          placeholder="Pilih Peran..."
                        />
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
                          style={{ padding: '6px 8px', fontSize: '0.82rem', height: '42px' }}
                          placeholder="Nama Tombol"
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
                          style={{ padding: '6px 8px', fontSize: '0.82rem', height: '42px' }}
                          placeholder="Deskripsi..."
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
                          height: '42px',
                          transition: 'all 0.2s'
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

            {/* COLLAPSIBLE OPTIONS PANEL (AS SHOWN IN PICTURE 2) */}
            <div className="glass-panel" style={{ padding: '24px', position: 'relative', zIndex: 1 }}>
              <div 
                className="collapsible-header"
                onClick={() => setOptionsExpanded(!optionsExpanded)}
              >
                <h3 style={{ fontSize: '1.25rem', color: 'hsl(var(--text-primary))', fontWeight: '750', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg 
                    width="14" height="8" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2.5"
                    style={{ transform: optionsExpanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.25s' }}
                  >
                    <path d="m1 1 4 4 4-4"/>
                  </svg>
                  OPTIONS
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'hsl(var(--text-muted))', fontWeight: '500' }}>
                  {optionsExpanded ? 'Tutup Parameter' : 'Buka Parameter'}
                </span>
              </div>

              <div 
                className="collapsible-content"
                style={{ 
                  maxHeight: optionsExpanded ? '1000px' : '0px', 
                  marginTop: optionsExpanded ? '16px' : '0px',
                  borderTop: optionsExpanded ? '1px solid hsl(var(--border-glass))' : 'none',
                  paddingTop: optionsExpanded ? '16px' : '0px'
                }}
              >
                {/* Type Selection */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.88rem', color: 'hsl(var(--text-primary))', fontWeight: '600' }}>Type</label>
                  <select
                    value={currentConfig.type || 'Normal'}
                    onChange={(e) => setCurrentConfig(prev => ({ ...prev, type: e.target.value }))}
                    className="input-glass"
                    style={{ backgroundColor: 'hsl(var(--panel-glass))', color: 'hsl(var(--text-primary))' }}
                  >
                    <option value="Normal" style={{ backgroundColor: 'hsl(var(--bg-space))' }}>Normal (Toggle role saat berinteraksi)</option>
                    <option value="Toggle" style={{ backgroundColor: 'hsl(var(--bg-space))' }}>Toggle (Sama dengan Normal)</option>
                    <option value="Give" style={{ backgroundColor: 'hsl(var(--bg-space))' }}>Give (Hanya menyematkan peran, tidak bisa dicabut)</option>
                    <option value="Take" style={{ backgroundColor: 'hsl(var(--bg-space))' }}>Take (Hanya mencabut peran terkait)</option>
                  </select>
                </div>

                {/* Allowed Roles & Ignored Roles (Picture 2 Double Column) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="expandable-card-grid">
                  
                  {/* Allowed Roles */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.88rem', color: 'hsl(var(--text-primary))', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Allowed Roles 
                      <span style={{ cursor: 'help', color: 'hsl(var(--text-muted))' }} title="Hanya anggota dengan peran ini yang bisa mengeklaim peran">🛈</span>
                    </label>
                    <MultiSelect 
                      allRoles={roles} 
                      selectedIds={currentConfig.allowed_roles || []} 
                      onChange={(ids) => setCurrentConfig(prev => ({ ...prev, allowed_roles: ids }))}
                      placeholder="Semua peran diizinkan..."
                    />
                  </div>

                  {/* Ignored Roles */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.88rem', color: 'hsl(var(--text-primary))', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Ignored Roles 
                      <span style={{ cursor: 'help', color: 'hsl(var(--text-muted))' }} title="Anggota dengan peran ini diblokir dari mengeklaim peran">🛈</span>
                    </label>
                    <MultiSelect 
                      allRoles={roles} 
                      selectedIds={currentConfig.ignored_roles || []} 
                      onChange={(ids) => setCurrentConfig(prev => ({ ...prev, ignored_roles: ids }))}
                      placeholder="Tidak ada peran diabaikan..."
                    />
                  </div>

                </div>

                {/* Two checkboxes side by side (Picture 2 layout) */}
                <div style={{ display: 'flex', gap: '40px', marginTop: '4px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'hsl(var(--text-primary))' }}>
                    <input 
                      type="checkbox" 
                      checked={!!currentConfig.allow_multiple_roles}
                      onChange={(e) => setCurrentConfig(prev => ({ ...prev, allow_multiple_roles: e.target.checked }))}
                      style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'hsl(var(--primary-glow))' }}
                    />
                    Allow members to get multiple roles 
                    <span style={{ cursor: 'help', color: 'hsl(var(--text-muted))', marginLeft: '2px' }} title="Jika dicentang, anggota bisa mengeklaim lebih dari 1 peran. Jika tidak dicentang, peran lama dari Reaction Roles ini akan otomatis dicabut.">🛈</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', color: 'hsl(var(--text-primary))' }}>
                    <input 
                      type="checkbox" 
                      checked={!!currentConfig.shuffle_roles}
                      onChange={(e) => setCurrentConfig(prev => ({ ...prev, shuffle_roles: e.target.checked }))}
                      style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'hsl(var(--primary-glow))' }}
                    />
                    Shuffle roles and their emojis 
                    <span style={{ cursor: 'help', color: 'hsl(var(--text-muted))', marginLeft: '2px' }} title="Jika diaktifkan, urutan peran dan emoji akan diacak saat diposting di Discord untuk variasi letak visual.">🛈</span>
                  </label>
                </div>

              </div>
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

                {/* RENDER SELECTION COMPONENTS BELOW MESSAGE (Respect Shuffle Preview if active) */}
                {(() => {
                  let options = [...currentConfig.options];
                  // If shuffle is checked, we can simulate the random ordering!
                  if (currentConfig.shuffle_roles) {
                    // Let's do a deterministic shuffle so it doesn't bounce endlessly on rerenders
                    options.reverse();
                  }

                  return (
                    <>
                      {/* 1. REACTIONS PREVIEW */}
                      {currentConfig.selection_type === 'reactions' && (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                          {options.map((opt, idx) => {
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
                                {renderEmojiRepresentation(opt.emoji)}
                                <span style={{ fontWeight: '600', color: '#5865f2', fontSize: '0.78rem' }}>1</span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* 2. BUTTONS PREVIEW */}
                      {currentConfig.selection_type === 'buttons' && (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                          {options.map((opt, idx) => {
                            const selectedRoleNames = (opt.role_ids || []).map(id => roles.find(r => r.id === id)?.name).filter(x => !!x).join(', ');
                            return (
                              <button
                                key={idx}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  backgroundColor: '#4e5058', 
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
                                {opt.emoji && renderEmojiRepresentation(opt.emoji)}
                                <span>{opt.label || selectedRoleNames || `Role ${idx + 1}`}</span>
                              </button>
                            );
                          })}
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
                            {options.map((opt, idx) => {
                              const selectedRoleNames = (opt.role_ids || []).map(id => roles.find(r => r.id === id)?.name).filter(x => !!x).join(', ');
                              return (
                                <div 
                                  key={idx}
                                  style={{
                                    padding: '10px 12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    borderBottom: idx === options.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.03)',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s'
                                  }}
                                  className="simulated-dropdown-option"
                                >
                                  <span style={{ fontSize: '1.05rem', display: 'flex', alignItems: 'center' }}>
                                    {renderEmojiRepresentation(opt.emoji || '⚫')}
                                  </span>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <span style={{ color: '#dbdee1', fontSize: '0.82rem', fontWeight: '500' }}>
                                      {opt.label || selectedRoleNames || `Opsi ${idx + 1}`}
                                    </span>
                                    {opt.description && (
                                      <span style={{ color: '#949ba4', fontSize: '0.72rem' }}>
                                        {opt.description}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}

              </div>
            </div>

            {/* Quick Helper Tips Card */}
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h4 style={{ color: 'hsl(var(--text-primary))', fontSize: '0.98rem', fontWeight: '750' }}>💡 Tips Setelan Lanjutan</h4>
              <ul style={{ padding: '0 0 0 16px', margin: 0, fontSize: '0.8rem', color: 'hsl(var(--text-secondary))', display: 'flex', flexDirection: 'column', gap: '6px', lineHeight: '1.4' }}>
                <li><strong>Allowed/Ignored Roles</strong> membatasi secara spesifik siapa saja anggota yang boleh mengeklaim setelan peran ini.</li>
                <li>Matikan <strong>"Allow members to get multiple roles"</strong> jika Anda membuat pilihan warna eksklusif seperti di mockup.</li>
                <li><strong>Custom Emojis Picker</strong> mendukung penelusuran custom emoji resmi langsung dari *database* server Discord aktif Anda.</li>
                <li>Pastikan urutan peran bot Anda berada di urutan teratas agar bot diizinkan menyematkan peran tersebut.</li>
              </ul>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
