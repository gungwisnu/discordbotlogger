const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Ensure the data directory exists
const rawEnvPath = process.env.DATABASE_PATH;
const dbPath = rawEnvPath ? (rawEnvPath.endsWith('.json') ? rawEnvPath : path.join(path.dirname(rawEnvPath), 'db.json')) : 'data/db.json';
const dbDir = path.dirname(path.resolve(dbPath));
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// In-memory data store structure
let data = {
  guild_settings: {},
  voice_sessions: [],
  user_history: {},
  mod_logs: [],
  audit_cache: {}
};

// Load data on startup
if (fs.existsSync(dbPath)) {
  try {
    const raw = fs.readFileSync(dbPath, 'utf8');
    data = JSON.parse(raw);
    
    // Ensure all critical root tables exist
    if (!data.guild_settings) data.guild_settings = {};
    if (!data.voice_sessions) data.voice_sessions = [];
    if (!data.user_history) data.user_history = {};
    if (!data.mod_logs) data.mod_logs = [];
    if (!data.audit_cache) data.audit_cache = {};

    console.log('Database JSON loaded successfully from', dbPath);
  } catch (err) {
    console.error('Gagal membaca database JSON, menggunakan database baru:', err.message);
  }
} else {
  // Save initial empty schema
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
  console.log('Database JSON baru dibuat di', dbPath);
}

// Debounced Disk Saving to minimize Disk I/O overhead
let saveTimeout = null;
function triggerSave() {
  if (saveTimeout) clearTimeout(saveTimeout);
  
  saveTimeout = setTimeout(() => {
    fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf8', (err) => {
      if (err) console.error('Gagal menulis data ke disk:', err.message);
    });
  }, 500); // Wait 500ms of quiet before writing
}

// Exported Database Functions
const DatabaseFunctions = {
  // Guild Settings API
  getGuildSettings(guildId) {
    const row = data.guild_settings[guildId];
    if (!row) {
      // Return defaults
      return {
        guild_id: guildId,
        log_channel_id: null,
        categories_enabled: JSON.stringify({
          moderation: true,
          voice_join_leave: true,
          voice_mute_deafen: true,
          member: true,
          server: true,
          gaming_activity: true,
          spotify_activity: true
        }),
        embed_color: '#6366f1',
        ignored_channels: '[]',
        ai_model: 'deepseek-chat',
        welcome_enabled: false,
        welcome_channel_id: null,
        welcome_message: 'Selamat datang, {user}!',
        autorole_enabled: false,
        autorole_role_id: null
      };
    }

    // Perform dynamic migration for newly introduced granular settings to maintain backward compatibility
    try {
      const cats = JSON.parse(row.categories_enabled || '{}');
      let changed = false;

      // Migrate legacy 'voice' category to split 'voice_join_leave' and 'voice_mute_deafen'
      if (cats.voice !== undefined) {
        if (cats.voice_join_leave === undefined) {
          cats.voice_join_leave = cats.voice;
          changed = true;
        }
        if (cats.voice_mute_deafen === undefined) {
          cats.voice_mute_deafen = cats.voice;
          changed = true;
        }
        delete cats.voice;
        changed = true;
      }

      // Migrate legacy 'activity' category to split 'gaming_activity' and 'spotify_activity'
      if (cats.activity !== undefined) {
        if (cats.gaming_activity === undefined) {
          cats.gaming_activity = cats.activity;
          changed = true;
        }
        if (cats.spotify_activity === undefined) {
          cats.spotify_activity = cats.activity;
          changed = true;
        }
        delete cats.activity;
        changed = true;
      }

      // Fill in default values for other missing keys if they don't exist
      const defaults = {
        moderation: true,
        voice_join_leave: true,
        voice_mute_deafen: true,
        member: true,
        server: true,
        gaming_activity: true,
        spotify_activity: true
      };

      for (const [k, v] of Object.entries(defaults)) {
        if (cats[k] === undefined) {
          cats[k] = v;
          changed = true;
        }
      }

      if (!row.ai_model) {
        row.ai_model = 'deepseek-chat';
        changed = true;
      }

      if (row.welcome_enabled === undefined) {
        row.welcome_enabled = false;
        changed = true;
      }
      if (row.welcome_channel_id === undefined) {
        row.welcome_channel_id = null;
        changed = true;
      }
      if (row.welcome_message === undefined) {
        row.welcome_message = 'Selamat datang, {user}!';
        changed = true;
      }
      if (row.autorole_enabled === undefined) {
        row.autorole_enabled = false;
        changed = true;
      }
      if (row.autorole_role_id === undefined) {
        row.autorole_role_id = null;
        changed = true;
      }

      if (changed) {
        row.categories_enabled = JSON.stringify(cats);
        triggerSave();
      }
    } catch (e) {
      console.error('[DATABASE] Gagal migrasi kategori guild categories_enabled:', e.message);
    }

    return row;
  },

  setGuildSettings(guildId, { log_channel_id, categories_enabled, embed_color, ignored_channels, ai_model, welcome_enabled, welcome_channel_id, welcome_message, autorole_enabled, autorole_role_id }) {
    const current = this.getGuildSettings(guildId);
    
    const channel = log_channel_id !== undefined ? log_channel_id : current.log_channel_id;
    const cats = categories_enabled !== undefined ? (typeof categories_enabled === 'string' ? categories_enabled : JSON.stringify(categories_enabled)) : current.categories_enabled;
    const color = embed_color !== undefined ? embed_color : current.embed_color;
    const ignored = ignored_channels !== undefined ? (typeof ignored_channels === 'string' ? ignored_channels : JSON.stringify(ignored_channels)) : current.ignored_channels;
    const model = ai_model !== undefined ? ai_model : current.ai_model || 'deepseek-chat';
    const welcomeEnabled = welcome_enabled !== undefined ? welcome_enabled : current.welcome_enabled !== undefined ? current.welcome_enabled : false;
    const welcomeChannel = welcome_channel_id !== undefined ? welcome_channel_id : current.welcome_channel_id !== undefined ? current.welcome_channel_id : null;
    const welcomeMsg = welcome_message !== undefined ? welcome_message : current.welcome_message !== undefined ? current.welcome_message : 'Selamat datang, {user}!';
    const autoroleEnabled = autorole_enabled !== undefined ? autorole_enabled : current.autorole_enabled !== undefined ? current.autorole_enabled : false;
    const autoroleRoleId = autorole_role_id !== undefined ? autorole_role_id : current.autorole_role_id !== undefined ? current.autorole_role_id : null;

    data.guild_settings[guildId] = {
      guild_id: guildId,
      log_channel_id: channel,
      categories_enabled: cats,
      embed_color: color,
      ignored_channels: ignored,
      ai_model: model,
      welcome_enabled: welcomeEnabled,
      welcome_channel_id: welcomeChannel,
      welcome_message: welcomeMsg,
      autorole_enabled: autoroleEnabled,
      autorole_role_id: autoroleRoleId
    };

    triggerSave();
    return data.guild_settings[guildId];
  },

  // Voice Sessions API
  startVoiceSession(guildId, userId, channelId) {
    // Prevent double-joins by checking active session
    const active = data.voice_sessions.find(s => s.guild_id === guildId && s.user_id === userId && s.leave_time === null);
    if (active) return active.id;

    const id = Date.now() + Math.floor(Math.random() * 1000);
    const newSession = {
      id,
      guild_id: guildId,
      user_id: userId,
      channel_id: channelId,
      join_time: Date.now(),
      leave_time: null,
      duration: 0
    };

    data.voice_sessions.push(newSession);
    
    // Initialize user history if not exists
    this.initUserHistory(guildId, userId);
    triggerSave();
    
    return id;
  },

  endVoiceSession(guildId, userId) {
    const active = data.voice_sessions.find(s => s.guild_id === guildId && s.user_id === userId && s.leave_time === null);
    if (!active) return null;

    const leaveTime = Date.now();
    const duration = Math.max(0, Math.floor((leaveTime - active.join_time) / 1000));

    active.leave_time = leaveTime;
    active.duration = duration;

    // Update aggregated voice time in user history
    this.initUserHistory(guildId, userId);
    const userStats = data.user_history[guildId][userId];
    userStats.voice_time = (userStats.voice_time || 0) + duration;

    // Check for Voice Achievements
    this.checkAndAwardVoiceStats(guildId, userId, duration);
    
    triggerSave();
    return duration;
  },

  // User History & Messaging Stats Helper Initialization
  initUserHistory(guildId, userId) {
    if (!data.user_history[guildId]) {
      data.user_history[guildId] = {};
    }
    if (!data.user_history[guildId][userId]) {
      data.user_history[guildId][userId] = {
        guild_id: guildId,
        user_id: userId,
        msg_count: 0,
        voice_time: 0,
        gaming_time: '{}',
        achievements: '[]'
      };
    }
  },

  addMessageCount(guildId, userId) {
    this.initUserHistory(guildId, userId);
    data.user_history[guildId][userId].msg_count += 1;
    this.checkAndAwardMessageStats(guildId, userId);
    triggerSave();
  },

  getUserStats(guildId, userId) {
    this.initUserHistory(guildId, userId);
    const rawRow = data.user_history[guildId][userId];
    return {
      ...rawRow,
      gaming_time: JSON.parse(rawRow.gaming_time || '{}'),
      achievements: JSON.parse(rawRow.achievements || '[]')
    };
  },

  // Gaming Stats API
  addGamingTime(guildId, userId, gameName, seconds) {
    this.initUserHistory(guildId, userId);
    const stats = this.getUserStats(guildId, userId);
    
    const gaming = stats.gaming_time || {};
    gaming[gameName] = (gaming[gameName] || 0) + seconds;

    data.user_history[guildId][userId].gaming_time = JSON.stringify(gaming);
    
    // Check for Gaming Achievements
    this.checkAndAwardGamingStats(guildId, userId, gameName, gaming[gameName]);
    triggerSave();
  },

  // Achievements Systems
  checkAndAwardMessageStats(guildId, userId) {
    const stats = this.getUserStats(guildId, userId);
    const list = new Set(stats.achievements || []);
    let updated = false;

    if (stats.msg_count >= 1 && !list.has('first_word')) {
      list.add('first_word');
      updated = true;
    }
    if (stats.msg_count >= 100 && !list.has('chatterbox_basic')) {
      list.add('chatterbox_basic');
      updated = true;
    }
    if (stats.msg_count >= 1000 && !list.has('chatterbox_elite')) {
      list.add('chatterbox_elite');
      updated = true;
    }

    if (updated) {
      data.user_history[guildId][userId].achievements = JSON.stringify([...list]);
    }
  },

  checkAndAwardVoiceStats(guildId, userId, sessionDuration) {
    const stats = this.getUserStats(guildId, userId);
    const list = new Set(stats.achievements || []);
    let updated = false;

    // voice_time is in seconds
    const hours = stats.voice_time / 3600;

    if (stats.voice_time >= 3600 && !list.has('vc_rookie')) {
      list.add('vc_rookie');
      updated = true;
    }
    if (stats.voice_time >= 36000 && !list.has('vc_veteran')) { // 10 Hours
      list.add('vc_veteran');
      updated = true;
    }
    if (stats.voice_time >= 360000 && !list.has('vc_deity')) { // 100 Hours
      list.add('vc_deity');
      updated = true;
    }

    // Check session achievements
    if (sessionDuration >= 18000 && !list.has('marathon_vc')) { // 5 hours straight
      list.add('marathon_vc');
      updated = true;
    }

    // Check night owl (Voice between 2 AM and 5 AM)
    const hr = new Date().getHours();
    if ((hr >= 2 && hr <= 5) && !list.has('night_owl')) {
      list.add('night_owl');
      updated = true;
    }

    if (updated) {
      data.user_history[guildId][userId].achievements = JSON.stringify([...list]);
    }
  },

  checkAndAwardGamingStats(guildId, userId, gameName, totalSeconds) {
    const stats = this.getUserStats(guildId, userId);
    const list = new Set(stats.achievements || []);
    let updated = false;

    if (totalSeconds >= 3600 && !list.has('gamer_initiate')) {
      list.add('gamer_initiate');
      updated = true;
    }
    if (totalSeconds >= 36000 && !list.has('hardcore_gamer')) { // 10 hours of a single game
      list.add('hardcore_gamer');
      updated = true;
    }

    if (updated) {
      data.user_history[guildId][userId].achievements = JSON.stringify([...list]);
    }
  },

  // Moderation Logging Storage
  logModeration(guildId, userId, executorId, action, reason) {
    const logItem = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      guild_id: guildId,
      user_id: userId,
      executor_id: executorId,
      action: action,
      reason: reason || 'No reason provided',
      timestamp: Date.now()
    };
    data.mod_logs.push(logItem);
    triggerSave();
  },

  getModerationLogs(guildId, limit = 50, offset = 0) {
    const logs = data.mod_logs
      .filter(l => l.guild_id === guildId)
      .sort((a, b) => b.timestamp - a.timestamp);
      
    return {
      total: logs.length,
      logs: logs.slice(offset, offset + limit)
    };
  },

  // Audit Logs Deduplication Cache API
  cacheAuditEvent(entryId) {
    data.audit_cache[entryId] = Date.now();
    triggerSave();
  },

  isAuditEventCached(entryId) {
    return !!data.audit_cache[entryId];
  },

  pruneAuditCache(olderThanMs = 24 * 60 * 60 * 1000) {
    const cutoff = Date.now() - olderThanMs;
    Object.entries(data.audit_cache).forEach(([entryId, ts]) => {
      if (ts < cutoff) delete data.audit_cache[entryId];
    });
    triggerSave();
  },

  // Leaderboard Statistics API
  getLeaderboard(guildId, type = 'voice', limit = 10) {
    const guildHist = data.user_history[guildId] || {};
    const list = Object.values(guildHist);

    if (type === 'voice') {
      return list
        .filter(u => u.voice_time > 0)
        .sort((a, b) => b.voice_time - a.voice_time)
        .slice(0, limit)
        .map(u => ({ user_id: u.user_id, score: u.voice_time }));
    } else if (type === 'messages') {
      return list
        .filter(u => u.msg_count > 0)
        .sort((a, b) => b.msg_count - a.msg_count)
        .slice(0, limit)
        .map(u => ({ user_id: u.user_id, score: u.msg_count }));
    } else if (type === 'gaming') {
      return list
        .map(u => {
          const gaming = JSON.parse(u.gaming_time || '{}');
          const total = Object.values(gaming).reduce((a, b) => a + b, 0);
          return { user_id: u.user_id, score: total };
        })
        .filter(u => u.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    }
    return [];
  },

  // Server-wide summary stats for dashboard
  getServerAnalytics(guildId) {
    const guildHist = data.user_history[guildId] || {};
    const list = Object.values(guildHist);

    const totalMessages = list.reduce((a, b) => a + (b.msg_count || 0), 0);
    const totalVoiceSecs = list.reduce((a, b) => a + (b.voice_time || 0), 0);
    
    // Active Voice members right now
    const activeVoices = data.voice_sessions.filter(s => s.guild_id === guildId && s.leave_time === null).length;
    
    // Mod log count
    const modCount = data.mod_logs.filter(l => l.guild_id === guildId).length;

    // Get most popular games
    const gameMap = {};
    list.forEach(u => {
      const gaming = JSON.parse(u.gaming_time || '{}');
      Object.entries(gaming).forEach(([game, secs]) => {
        gameMap[game] = (gameMap[game] || 0) + secs;
      });
    });
    
    const popularGames = Object.entries(gameMap)
      .map(([game, seconds]) => ({ game, hours: Math.round((seconds / 3600) * 10) / 10 }))
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 5);

    return {
      total_messages: totalMessages,
      total_voice_hours: Math.round((totalVoiceSecs / 3600) * 10) / 10,
      active_voice_count: activeVoices,
      total_moderations: modCount,
      tracked_users_count: list.length,
      popular_games: popularGames
    };
  }
};

module.exports = DatabaseFunctions;
