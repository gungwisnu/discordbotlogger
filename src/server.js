const express = require('express');
const session = require('express-session');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const db = require('./database');
const { client, sendLog } = require('./bot');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || process.env.SERVER_PORT || 5000;
const buildPath = path.join(__dirname, '../frontend/dist');

// Enable CORS for frontend dev server
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'pandu-discord-bot-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 Hours
}));

// Session restoration middleware from cookie
app.use((req, res, next) => {
  if (!req.session.user && req.headers.cookie) {
    const match = req.headers.cookie.match(/(?:^|;)\s*session_token\s*=\s*([^;]+)/);
    if (match) {
      const token = decodeURIComponent(match[1]);
      const sessionData = db.getSession(token);
      if (sessionData) {
        req.session.user = sessionData.user;
        req.session.guilds = sessionData.guilds;
      }
    }
  }
  next();
});

// Helper: check auth middleware
function checkAuth(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized. Silakan masuk terlebih dahulu.' });
  }
}

// Helper: Compare configurations and generate audit trail differences
function getSettingsDiff(oldSettings, newSettings) {
  const diffs = [];
  const fieldNames = {
    log_channel_id: 'Saluran Log Utama',
    embed_color: 'Warna Embed',
    ai_model: 'Model AI',
    welcome_enabled: 'Status Welcome Message',
    welcome_channel_id: 'Saluran Welcome Message',
    welcome_message: 'Pesan Welcome',
    autorole_enabled: 'Status Auto-Role',
    autorole_role_id: 'Role Auto-Role',
    achievement_channel_id: 'Saluran Pencapaian',
    ai_enabled: 'Status Asisten AI'
  };

  // Compare standard fields
  for (const [key, label] of Object.entries(fieldNames)) {
    if (newSettings[key] !== undefined) {
      let oldVal = oldSettings[key];
      let newVal = newSettings[key];

      // Standardize booleans
      if (typeof oldVal === 'string' && (oldVal === 'true' || oldVal === 'false')) oldVal = oldVal === 'true';
      if (typeof newVal === 'string' && (newVal === 'true' || newVal === 'false')) newVal = newVal === 'true';

      if (oldVal !== newVal) {
        const formatVal = (v) => {
          if (v === null || v === undefined || v === '') return 'Tidak disetel';
          if (v === true) return 'Aktif';
          if (v === false) return 'Nonaktif';
          return v;
        };
        diffs.push({
          field: key,
          label: label,
          old: formatVal(oldVal),
          new: formatVal(newVal)
        });
      }
    }
  }

  // Compare categories_enabled (JSON string or object)
  if (newSettings.categories_enabled !== undefined) {
    let oldCats = {};
    let newCats = {};
    try {
      oldCats = typeof oldSettings.categories_enabled === 'string' ? JSON.parse(oldSettings.categories_enabled) : oldSettings.categories_enabled || {};
    } catch (e) {}
    try {
      newCats = typeof newSettings.categories_enabled === 'string' ? JSON.parse(newSettings.categories_enabled) : newSettings.categories_enabled || {};
    } catch (e) {}

    const catLabels = {
      moderation: 'Log Moderasi',
      voice_join_leave: 'Log Voice Join/Leave',
      voice_mute_deafen: 'Log Voice Mute/Deafen',
      member: 'Log Profil Anggota',
      server: 'Log Konfigurasi Server',
      gaming_activity: 'Log Aktivitas Game',
      spotify_activity: 'Log Spotify',
      user_status: 'Log Status Pengguna'
    };

    for (const [cat, label] of Object.entries(catLabels)) {
      const oldVal = !!oldCats[cat];
      const newVal = !!newCats[cat];
      if (oldVal !== newVal) {
        diffs.push({
          field: `category_${cat}`,
          label: `Kategori ${label}`,
          old: oldVal ? 'Aktif' : 'Nonaktif',
          new: newVal ? 'Aktif' : 'Nonaktif'
        });
      }
    }
  }

  // Compare log_channels (JSON string or object)
  if (newSettings.log_channels !== undefined) {
    let oldChans = {};
    let newChans = {};
    try {
      oldChans = typeof oldSettings.log_channels === 'string' ? JSON.parse(oldSettings.log_channels) : oldSettings.log_channels || {};
    } catch (e) {}
    try {
      newChans = typeof newSettings.log_channels === 'string' ? JSON.parse(newSettings.log_channels) : newSettings.log_channels || {};
    } catch (e) {}

    const catLabels = {
      moderation: 'Saluran Log Moderasi',
      voice_join_leave: 'Saluran Log Voice Join/Leave',
      voice_mute_deafen: 'Saluran Log Voice Mute/Deafen',
      member: 'Saluran Log Profil Anggota',
      server: 'Saluran Log Konfigurasi Server',
      gaming_activity: 'Saluran Log Aktivitas Game',
      spotify_activity: 'Saluran Log Spotify',
      user_status: 'Saluran Log Status Pengguna'
    };

    for (const [cat, label] of Object.entries(catLabels)) {
      const oldChan = oldChans[cat] || null;
      const newChan = newChans[cat] || null;
      if (oldChan !== newChan) {
        diffs.push({
          field: `log_chan_${cat}`,
          label: label,
          old: oldChan ? oldChan : 'Sama dengan Log Utama',
          new: newChan ? newChan : 'Sama dengan Log Utama'
        });
      }
    }
  }

  return diffs;
}

// ----------------------------------------------------
// DEMO / MOCK DATA FOR DEMO MODE
// ----------------------------------------------------
const DEMO_USER = {
  id: '123456789012345',
  username: 'GamerKalong',
  discriminator: '0000',
  avatar: 'a_demo_avatar',
  demo: true
};

const DEMO_GUILDS = [
  {
    id: '99999999999999',
    name: '🌟 Neon Sanctuary (Demo)',
    icon: 'a_demo_icon',
    owner: true,
    permissions: '8', // Admin
    botInGuild: true
  },
  {
    id: '88888888888888',
    name: '🎮 Valorant Indo Indo (Demo)',
    icon: 'a_demo_icon_2',
    owner: false,
    permissions: '8',
    botInGuild: false
  }
];

const DEMO_CHANNELS = [
  { id: '111', name: '📢-announcements' },
  { id: '222', name: '💬-general-chat' },
  { id: '333', name: '🤖-bot-commands' },
  { id: '444', name: '📝-logs-channel' },
  { id: '555', name: '🎵-music-commands' }
];

const DEMO_ANALYTICS = {
  total_messages: 14850,
  total_voice_hours: 382.4,
  active_voice_count: 5,
  total_moderations: 18,
  tracked_users_count: 142,
  popular_games: [
    { game: 'Valorant', hours: 148.5 },
    { game: 'Minecraft', hours: 94.2 },
    { game: 'Roblox', hours: 74.8 },
    { game: 'Mobile Legends', hours: 42.1 },
    { game: 'Grand Theft Auto V', hours: 22.8 }
  ]
};

const DEMO_LOGS = {
  total: 4,
  logs: [
    { id: 101, guild_id: '99999999999999', user_id: '11111', executor_id: '123456789012345', action: 'TIMEOUT', reason: 'Spam chat di #general-chat selama 10 menit.', timestamp: Date.now() - 3600000 * 2 },
    { id: 102, guild_id: '99999999999999', user_id: '22222', executor_id: '123456789012345', action: 'BAN', reason: 'Mengirimkan link phising berbahaya.', timestamp: Date.now() - 3600000 * 5 },
    { id: 103, guild_id: '99999999999999', user_id: '33333', executor_id: '123456789012345', action: 'KICK', reason: 'Toxic berlebihan di voice channel.', timestamp: Date.now() - 3600000 * 12 },
    { id: 104, guild_id: '99999999999999', user_id: '44444', executor_id: '123456789012345', action: 'UNBAN', reason: 'Masa ban selesai dan mengajukan banding.', timestamp: Date.now() - 3600000 * 24 }
  ]
};

const DEMO_LEADERBOARD = {
  voice: [
    { username: 'GamerKalong', score: 3600 * 42.5 },
    { username: 'ValkyrieVC', score: 3600 * 38.2 },
    { username: 'NightOwl99', score: 3600 * 32.1 },
    { username: 'WumpusFan', score: 3600 * 22.4 },
    { username: 'SilentReader', score: 3600 * 18.9 }
  ],
  messages: [
    { username: 'ChatterBox', score: 4820 },
    { username: 'GamerKalong', score: 2850 },
    { username: 'HelperBot', score: 2100 },
    { username: 'AdminGanteng', score: 1840 },
    { username: 'SavagePlayer', score: 1205 }
  ],
  gaming: [
    { username: 'ValkyrieVC', score: 3600 * 98.4 },
    { username: 'GamerKalong', score: 3600 * 74.8 },
    { username: 'Speedrunner', score: 3600 * 68.2 },
    { username: 'BuilderPro', score: 3600 * 52.1 },
    { username: 'CasualGamer', score: 3600 * 24.5 }
  ]
};

const DEMO_SETTINGS = {
  guild_id: '99999999999999',
  log_channel_id: '44444',
  categories_enabled: JSON.stringify({
    moderation: true,
    voice_join_leave: true,
    voice_mute_deafen: true,
    member: true,
    server: true,
    gaming_activity: true,
    spotify_activity: true,
    user_status: false
  }),
  embed_color: '#6366f1',
  ignored_channels: '["555"]',
  ai_model: 'deepseek-chat',
  welcome_enabled: true,
  welcome_channel_id: '222',
  welcome_message: 'Selamat datang, {user}!',
  autorole_enabled: true,
  autorole_role_id: '111222',
  achievement_channel_id: '333',
  log_channels: '{}',
  ai_enabled: false,
  timezone_offset: 8
};

let DEMO_REACTION_ROLES = [
  {
    id: 'demo-rr-1',
    guild_id: '99999999999999',
    name: 'Warnai Aku',
    channel_id: '222',
    message_id: '999999999999999',
    message_type: 'plain',
    plain_content: 'Pilih dropdown dibawah untuk memilih warna yang kalian sukai!',
    embed_title: 'Warna Aku',
    embed_description: 'Pilih dropdown dibawah untuk memilih warna yang kalian sukai!',
    embed_color: '#6366f1',
    selection_type: 'dropdowns',
    options: [
      { emoji: '⚫', role_id: '111222', label: 'Hitam', description: 'Ganti warna nama profil menjadi Hitam' },
      { emoji: '🔴', role_id: '333444', label: 'Merah', description: 'Ganti warna nama profil menjadi Merah' },
      { emoji: '🟠', role_id: '555666', label: 'Oranye', description: 'Ganti warna nama profil menjadi Oranye' },
      { emoji: '🟡', role_id: '111222', label: 'Kuning', description: 'Ganti warna nama profil menjadi Kuning' },
      { emoji: '🟢', role_id: '333444', label: 'Hijau', description: 'Ganti warna nama profil menjadi Hijau' }
    ]
  }
];

// ----------------------------------------------------
// AUTHENTICATION ROUTES
// ----------------------------------------------------

// Bypass Login for DEMO Mode
app.get('/api/auth/demo', (req, res) => {
  req.session.user = DEMO_USER;
  req.session.guilds = DEMO_GUILDS;

  // Save persistent session for Demo Mode
  const sessionToken = crypto.randomBytes(32).toString('hex');
  db.saveSession(sessionToken, { user: DEMO_USER, guilds: DEMO_GUILDS });
  res.cookie('session_token', sessionToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, path: '/' });

  res.json({ success: true, user: DEMO_USER });
});

// OAuth2 Discord Login redirect
app.get('/api/auth/login', (req, res) => {
  const clientId = process.env.DISCORD_CLIENT_ID;

  // Dynamically determine redirect URI if not explicitly configured
  let rawRedirectUri = process.env.REDIRECT_URI;
  const currentHost = req.get('host');
  const isLocalHost = currentHost.includes('localhost') || currentHost.includes('127.0.0.1');

  if (!rawRedirectUri || rawRedirectUri === 'your_redirect_uri_here' || (!isLocalHost && rawRedirectUri.includes('localhost'))) {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    rawRedirectUri = `${protocol}://${currentHost}/api/auth/callback`;
  }

  const redirectUri = encodeURIComponent(rawRedirectUri);

  if (!clientId || clientId === 'your_client_id_here') {
    return res.status(400).send('Client ID is not configured in .env file.');
  }

  const oauthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=identify%20guilds`;
  res.redirect(oauthUrl);
});

// OAuth2 Discord Login Callback
app.get('/api/auth/callback', async (req, res) => {
  const { code } = req.query;

  // Dynamically determine redirect base (dev vs prod)
  let redirectBase = process.env.FRONTEND_URL;
  const currentHost = req.get('host');
  const isLocalHost = currentHost.includes('localhost') || currentHost.includes('127.0.0.1');

  if (!redirectBase || (!isLocalHost && redirectBase.includes('localhost'))) {
    if (fs.existsSync(buildPath)) {
      // In production hosting (serving frontend and backend on the same port)
      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      redirectBase = `${protocol}://${currentHost}`;
    } else {
      // In local development
      redirectBase = 'http://localhost:5173';
    }
  }

  // Construct dynamic redirect URI for Discord swap code validation
  let rawRedirectUri = process.env.REDIRECT_URI;
  if (!rawRedirectUri || rawRedirectUri === 'your_redirect_uri_here' || (!isLocalHost && rawRedirectUri.includes('localhost'))) {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    rawRedirectUri = `${protocol}://${currentHost}/api/auth/callback`;
  }

  if (!code) {
    return res.redirect(redirectBase);
  }

  try {
    // Swap code for access token
    const tokenResponse = await axios.post('https://discord.com/api/v10/oauth2/token', new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: rawRedirectUri,
    }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const accessToken = tokenResponse.data.access_token;

    // Fetch user profile
    const userResponse = await axios.get('https://discord.com/api/v10/users/@me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    // Fetch user guilds
    const guildsResponse = await axios.get('https://discord.com/api/v10/users/@me/guilds', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    // Save profile and credentials
    req.session.user = userResponse.data;

    // Filter and check which guilds the bot is in
    const botGuilds = client.readyAt ? client.guilds.cache : new Map();

    req.session.guilds = guildsResponse.data.map(g => {
      // User must be owner or have MANAGE_GUILD (0x20) or ADMINISTRATOR (0x8)
      const hasPermissions = (BigInt(g.permissions) & 0x8n) === 0x8n ||
        (BigInt(g.permissions) & 0x20n) === 0x20n ||
        g.owner;

      return {
        id: g.id,
        name: g.name,
        icon: g.icon,
        owner: g.owner,
        permissions: g.permissions,
        hasAdmin: hasPermissions,
        botInGuild: botGuilds.has(g.id)
      };
    }).filter(g => g.hasAdmin);

    // Save persistent session for Discord login
    const sessionToken = crypto.randomBytes(32).toString('hex');
    db.saveSession(sessionToken, { user: req.session.user, guilds: req.session.guilds });
    res.cookie('session_token', sessionToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, path: '/' });

    res.redirect(`${redirectBase}/dashboard`);
  } catch (error) {
    console.error('Error swap OAuth2 Token:', error.response?.data || error.message);
    res.redirect(`${redirectBase}?error=auth_failed`);
  }
});

// Get Session User profile details
app.get('/api/auth/user', (req, res) => {
  if (req.session.user) {
    const superAdminIds = (process.env.SUPER_ADMIN_IDS || '').split(',');
    const isSuperAdmin = superAdminIds.includes(req.session.user.id);
    const isAIWhitelisted = db.isUserAIWhitelisted(req.session.user.id);
    res.json({ 
      user: {
        ...req.session.user,
        superAdmin: isSuperAdmin,
        aiWhitelisted: isAIWhitelisted
      }, 
      guilds: req.session.guilds 
    });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Get Discord Client ID
app.get('/api/auth/client-id', (req, res) => {
  res.json({ clientId: process.env.DISCORD_CLIENT_ID });
});

// Logout Session
app.get('/api/auth/logout', (req, res) => {
  let token = null;
  if (req.headers.cookie) {
    const match = req.headers.cookie.match(/(?:^|;)\s*session_token\s*=\s*([^;]+)/);
    if (match) {
      token = decodeURIComponent(match[1]);
    }
  }
  if (token) {
    db.deleteSession(token);
  }

  req.session.destroy(err => {
    res.clearCookie('session_token');
    res.clearCookie('connect.sid');
    if (err) {
      return res.status(500).json({ error: 'Gagal logout.' });
    }
    res.json({ success: true });
  });
});

// Middleware to verify Super Admin status
const checkSuperAdmin = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const superAdminIds = (process.env.SUPER_ADMIN_IDS || '').split(',');
  if (!superAdminIds.includes(req.session.user.id)) {
    return res.status(403).json({ error: 'Forbidden: Akses Super Admin diperlukan.' });
  }
  next();
};

// GET Bot Global stats & Joined guilds for Super Admin dashboard
app.get('/api/admin/bot-stats', checkSuperAdmin, (req, res) => {
  const isReady = !!client.readyAt;
  
  let guilds = [];
  let guildsCount = 0;
  let usersCount = 0;
  let ping = -1;

  if (isReady) {
    guildsCount = client.guilds.cache.size;
    ping = client.ws.ping;
    
    // Sum up cached users across guilds
    usersCount = client.users.cache.size;

    guilds = client.guilds.cache.map(g => {
      const iconUrl = g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png` : null;
      return {
        id: g.id,
        name: g.name,
        iconUrl,
        memberCount: g.memberCount,
        joinedAt: g.joinedAt ? g.joinedAt.getTime() : null,
        ownerId: g.ownerId
      };
    });
  }

  res.json({
    isReady,
    uptime: process.uptime(),
    ping,
    memory: process.memoryUsage(),
    stats: {
      guildsCount,
      usersCount
    },
    guilds
  });
});

// GET AI Whitelist for Super Admin dashboard
app.get('/api/admin/ai-whitelist', checkSuperAdmin, async (req, res) => {
  const list = db.getAIWhitelist();
  const detailedList = [];
  for (const userId of list) {
    try {
      if (client.readyAt) {
        const user = await client.users.fetch(userId);
        detailedList.push({
          id: userId,
          username: user.username,
          avatar: user.avatar,
          avatarUrl: user.displayAvatarURL({ dynamic: true })
        });
      } else {
        detailedList.push({ id: userId, username: `User ${userId}`, avatar: null });
      }
    } catch (e) {
      detailedList.push({ id: userId, username: `ID: ${userId} (Unknown Discord User)`, avatar: null });
    }
  }
  res.json(detailedList);
});

// POST AI Whitelist (Add User ID)
app.post('/api/admin/ai-whitelist', checkSuperAdmin, async (req, res) => {
  const { userId } = req.body;
  if (!userId || !/^\d{17,19}$/.test(userId)) {
    return res.status(400).json({ error: 'ID Pengguna Discord tidak valid.' });
  }

  if (client.readyAt) {
    try {
      await client.users.fetch(userId);
    } catch (e) {
      return res.status(400).json({ error: 'Pengguna Discord tidak ditemukan dengan ID tersebut.' });
    }
  }

  db.addToAIWhitelist(userId);
  res.json({ success: true });
});

// DELETE AI Whitelist (Remove User ID)
app.delete('/api/admin/ai-whitelist/:userId', checkSuperAdmin, (req, res) => {
  const { userId } = req.params;
  db.removeFromAIWhitelist(userId);
  res.json({ success: true });
});

// ----------------------------------------------------
// GUILDS CONFIGURATIONS & ANALYTICS API
// ----------------------------------------------------

// Get Guild Settings
app.get('/api/guilds/:guildId/settings', checkAuth, (req, res) => {
  const { guildId } = req.params;
  const isDemo = req.session.user.demo;

  if (isDemo && guildId === '99999999999999') {
    return res.json(DEMO_SETTINGS);
  }

  const settings = db.getGuildSettings(guildId);
  res.json({
    ...settings,
    categories_enabled: JSON.parse(settings.categories_enabled || '{}'),
    ignored_channels: JSON.parse(settings.ignored_channels || '[]'),
    log_channels: JSON.parse(settings.log_channels || '{}')
  });
});

// Get Guild Settings History
app.get('/api/guilds/:guildId/settings-history', checkAuth, (req, res) => {
  const { guildId } = req.params;
  const isDemo = req.session.user.demo;

  if (isDemo && guildId === '99999999999999') {
    return res.json([
      {
        id: 1,
        guild_id: '99999999999999',
        executor: 'GamerKalong (Demo)',
        changes: [
          { field: 'welcome_enabled', label: 'Status Welcome Message', old: 'Nonaktif', new: 'Aktif' },
          { field: 'welcome_channel_id', label: 'Saluran Welcome Message', old: 'Tidak disetel', new: '#general-chat' }
        ],
        timestamp: Date.now() - 600000
      },
      {
        id: 2,
        guild_id: '99999999999999',
        executor: 'SystemBot (Demo)',
        changes: [
          { field: 'ai_model', label: 'Model AI', old: 'deepseek-chat', new: 'deepseek-reasoner' }
        ],
        timestamp: Date.now() - 3600000 * 3
      }
    ]);
  }

  const history = db.getSettingsHistory(guildId);
  res.json(history);
});

// Update Guild Settings
app.post('/api/guilds/:guildId/settings', checkAuth, (req, res) => {
  const { guildId } = req.params;
  const { log_channel_id, categories_enabled, embed_color, ignored_channels, ai_model, welcome_enabled, welcome_channel_id, welcome_message, autorole_enabled, autorole_role_id, achievement_channel_id, log_channels, ai_enabled, timezone_offset } = req.body;
  const isDemo = req.session.user.demo;
  const username = req.session.user ? req.session.user.username : 'Web Dashboard';

  const superAdminIds = (process.env.SUPER_ADMIN_IDS || '').split(',');
  const isSuperAdmin = superAdminIds.includes(req.session.user?.id);
  const isAIWhitelisted = db.isUserAIWhitelisted(req.session.user?.id);
  const current = db.getGuildSettings(guildId);

  // Security check: Only whitelisted users or Super Admins can enable AI
  if (ai_enabled === true && current.ai_enabled !== true && !isDemo) {
    if (!isSuperAdmin && !isAIWhitelisted) {
      return res.status(403).json({ error: 'Akses ditolak: Anda tidak memiliki izin khusus (AI Whitelist) untuk mengaktifkan fitur AI di server ini.' });
    }
  }

  if (isDemo && guildId === '99999999999999') {
    const oldClean = {
      ...DEMO_SETTINGS,
      categories_enabled: JSON.parse(DEMO_SETTINGS.categories_enabled || '{}'),
      ignored_channels: JSON.parse(DEMO_SETTINGS.ignored_channels || '[]'),
      log_channels: JSON.parse(DEMO_SETTINGS.log_channels || '{}'),
      ai_enabled: DEMO_SETTINGS.ai_enabled
    };

    const diffs = getSettingsDiff(oldClean, req.body);
    if (diffs.length > 0) {
      db.logSettingsChange(guildId, diffs, username + ' (Demo)');
    }

    Object.assign(DEMO_SETTINGS, {
      log_channel_id,
      categories_enabled: typeof categories_enabled === 'string' ? categories_enabled : JSON.stringify(categories_enabled),
      embed_color,
      ignored_channels: typeof ignored_channels === 'string' ? ignored_channels : JSON.stringify(ignored_channels),
      ai_model: ai_model !== undefined ? ai_model : DEMO_SETTINGS.ai_model,
      welcome_enabled: welcome_enabled !== undefined ? welcome_enabled : DEMO_SETTINGS.welcome_enabled,
      welcome_channel_id: welcome_channel_id !== undefined ? welcome_channel_id : DEMO_SETTINGS.welcome_channel_id,
      welcome_message: welcome_message !== undefined ? welcome_message : DEMO_SETTINGS.welcome_message,
      autorole_enabled: autorole_enabled !== undefined ? autorole_enabled : DEMO_SETTINGS.autorole_enabled,
      autorole_role_id: autorole_role_id !== undefined ? autorole_role_id : DEMO_SETTINGS.autorole_role_id,
      achievement_channel_id: achievement_channel_id !== undefined ? achievement_channel_id : DEMO_SETTINGS.achievement_channel_id,
      log_channels: typeof log_channels === 'string' ? log_channels : JSON.stringify(log_channels || {}),
      ai_enabled: ai_enabled !== undefined ? ai_enabled : DEMO_SETTINGS.ai_enabled,
      timezone_offset: timezone_offset !== undefined ? parseInt(timezone_offset) : DEMO_SETTINGS.timezone_offset
    });
    return res.json({ success: true, settings: {
      ...DEMO_SETTINGS,
      categories_enabled: JSON.parse(DEMO_SETTINGS.categories_enabled || '{}'),
      ignored_channels: JSON.parse(DEMO_SETTINGS.ignored_channels || '[]'),
      log_channels: JSON.parse(DEMO_SETTINGS.log_channels || '{}'),
      ai_enabled: DEMO_SETTINGS.ai_enabled,
      timezone_offset: DEMO_SETTINGS.timezone_offset
    }});
  }

  const cleanCurrent = {
    ...current,
    categories_enabled: JSON.parse(current.categories_enabled || '{}'),
    ignored_channels: JSON.parse(current.ignored_channels || '[]'),
    log_channels: JSON.parse(current.log_channels || '{}')
  };

  const diffs = getSettingsDiff(cleanCurrent, req.body);

  if (diffs.length > 0) {
    db.logSettingsChange(guildId, diffs, username);

    // Send professional embed changelog to Discord logs
    if (client.readyAt) {
      const embed = new EmbedBuilder()
        .setTitle('📝 Konfigurasi Server Diperbarui')
        .setDescription(`Konfigurasi server telah diperbarui oleh **${username}** via Web Dashboard.`)
        .setColor(cleanCurrent.embed_color || '#6366f1')
        .setTimestamp();

      diffs.forEach(diff => {
        embed.addFields({
          name: diff.label,
          value: `Sebelum: \`${diff.old}\`\nSesudah: \`${diff.new}\``,
          inline: false
        });
      });

      sendLog(guildId, 'server', embed);
    }
  }

  const updated = db.setGuildSettings(guildId, {
    log_channel_id,
    categories_enabled,
    embed_color,
    ignored_channels,
    ai_model,
    welcome_enabled,
    welcome_channel_id,
    welcome_message,
    autorole_enabled,
    autorole_role_id,
    achievement_channel_id,
    log_channels,
    ai_enabled,
    timezone_offset
  });

  res.json({
    success: true,
    settings: {
      ...updated,
      categories_enabled: JSON.parse(updated.categories_enabled || '{}'),
      ignored_channels: JSON.parse(updated.ignored_channels || '[]'),
      log_channels: JSON.parse(updated.log_channels || '{}')
    }
  });
});

// Get Guild Text Channels list for log dropdown
app.get('/api/guilds/:guildId/channels', checkAuth, async (req, res) => {
  const { guildId } = req.params;
  const isDemo = req.session.user.demo;

  if (isDemo && guildId === '99999999999999') {
    return res.json(DEMO_CHANNELS);
  }

  try {
    if (!client.readyAt) {
      return res.status(503).json({ error: 'Discord bot client belum siap.' });
    }

    const guild = await client.guilds.fetch(guildId).catch(() => null);
    if (!guild) {
      return res.status(404).json({ error: 'Server tidak ditemukan atau bot belum masuk.' });
    }

    const channels = guild.channels.cache
      .filter(c => c.isTextBased())
      .map(c => ({ id: c.id, name: c.name }));

    res.json(channels);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil channels.', details: error.message });
  }
});

// Get Guild Roles list for auto-role dropdown
app.get('/api/guilds/:guildId/roles', checkAuth, async (req, res) => {
  const { guildId } = req.params;
  const isDemo = req.session.user.demo;

  if (isDemo && guildId === '99999999999999') {
    return res.json([
      { id: '111222', name: 'Member' },
      { id: '333444', name: 'Gamer' },
      { id: '555666', name: 'Moderator' }
    ]);
  }

  try {
    if (!client.readyAt) {
      return res.status(503).json({ error: 'Discord bot client belum siap.' });
    }

    const guild = await client.guilds.fetch(guildId).catch(() => null);
    if (!guild) {
      return res.status(404).json({ error: 'Server tidak ditemukan atau bot belum masuk.' });
    }

    // Filter out @everyone and managed/bot roles
    const roles = guild.roles.cache
      .filter(r => r.name !== '@everyone' && !r.managed)
      .map(r => ({ id: r.id, name: r.name }));

    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil roles.', details: error.message });
  }
});

// Get Guild Emojis list for emoji selector
app.get('/api/guilds/:guildId/emojis', checkAuth, async (req, res) => {
  const { guildId } = req.params;
  const isDemo = req.session.user.demo;

  if (isDemo && guildId === '99999999999999') {
    return res.json([
      { name: 'neonstar', id: '111111111111111111', url: 'https://cdn.discordapp.com/emojis/111111111111111111.png' },
      { name: 'pandawave', id: '222222222222222222', url: 'https://cdn.discordapp.com/emojis/222222222222222222.png' },
      { name: 'pepehype', id: '333333333333333333', url: 'https://cdn.discordapp.com/emojis/333333333333333333.png' }
    ]);
  }

  try {
    if (!client.readyAt) {
      return res.status(503).json({ error: 'Discord bot client belum siap.' });
    }

    const guild = await client.guilds.fetch(guildId).catch(() => null);
    if (!guild) {
      return res.status(404).json({ error: 'Server tidak ditemukan.' });
    }

    const emojis = guild.emojis.cache.map(e => ({
      name: e.name,
      id: e.id,
      animated: e.animated,
      url: e.url
    }));

    res.json(emojis);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil custom emojis.', details: error.message });
  }
});

// ----------------------------------------------------
// REACTION ROLES API ENDPOINTS
// ----------------------------------------------------

// Get all reaction roles for a guild
app.get('/api/guilds/:guildId/reaction-roles', checkAuth, (req, res) => {
  const { guildId } = req.params;
  const isDemo = req.session.user.demo;

  if (isDemo && guildId === '99999999999999') {
    return res.json(DEMO_REACTION_ROLES);
  }

  const list = db.getReactionRoles(guildId);
  res.json(list);
});

// Create new reaction role configuration
app.post('/api/guilds/:guildId/reaction-roles', checkAuth, (req, res) => {
  const { guildId } = req.params;
  const config = req.body;
  const isDemo = req.session.user.demo;

  // Generate ID if not present
  if (!config.id) {
    config.id = Date.now().toString() + Math.floor(Math.random() * 1000).toString();
  }

  if (isDemo && guildId === '99999999999999') {
    config.guild_id = guildId;
    DEMO_REACTION_ROLES.push(config);
    return res.json({ success: true, config });
  }

  const saved = db.saveReactionRole(guildId, config);
  res.json({ success: true, config: saved });
});

// Update existing reaction role configuration
app.put('/api/guilds/:guildId/reaction-roles/:id', checkAuth, (req, res) => {
  const { guildId, id } = req.params;
  const config = req.body;
  const isDemo = req.session.user.demo;

  config.id = id;

  if (isDemo && guildId === '99999999999999') {
    const idx = DEMO_REACTION_ROLES.findIndex(rr => rr.id === id);
    if (idx !== -1) {
      DEMO_REACTION_ROLES[idx] = { ...DEMO_REACTION_ROLES[idx], ...config, guild_id: guildId };
      return res.json({ success: true, config: DEMO_REACTION_ROLES[idx] });
    }
    return res.status(404).json({ error: 'Konfigurasi tidak ditemukan.' });
  }

  const saved = db.saveReactionRole(guildId, config);
  res.json({ success: true, config: saved });
});

// Delete reaction role configuration
app.delete('/api/guilds/:guildId/reaction-roles/:id', checkAuth, (req, res) => {
  const { guildId, id } = req.params;
  const isDemo = req.session.user.demo;

  if (isDemo && guildId === '99999999999999') {
    DEMO_REACTION_ROLES = DEMO_REACTION_ROLES.filter(rr => rr.id !== id);
    return res.json({ success: true });
  }

  const success = db.deleteReactionRole(guildId, id);
  if (success) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Konfigurasi tidak ditemukan.' });
  }
});

// Post/Sync the reaction role message to Discord!
app.post('/api/guilds/:guildId/reaction-roles/:id/post', checkAuth, async (req, res) => {
  const { guildId, id } = req.params;
  const isDemo = req.session.user.demo;
  
  if (isDemo && guildId === '99999999999999') {
    return res.json({ success: true, messageId: '999999999999999' });
  }

  try {
    if (!client.readyAt) {
      return res.status(503).json({ error: 'Discord bot client belum siap.' });
    }

    const guild = await client.guilds.fetch(guildId).catch(() => null);
    if (!guild) {
      return res.status(404).json({ error: 'Server tidak ditemukan.' });
    }

    const configs = db.getReactionRoles(guildId);
    const config = configs.find(c => c.id === id);
    if (!config) {
      return res.status(404).json({ error: 'Konfigurasi Reaction Roles tidak ditemukan.' });
    }

    const channel = await guild.channels.fetch(config.channel_id).catch(() => null);
    if (!channel || !channel.isTextBased()) {
      return res.status(400).json({ error: 'Saluran tidak ditemukan atau bukan saluran teks.' });
    }

    const messagePayload = {};

    // 1. Build Content or Embed
    if (config.message_type === 'plain') {
      messagePayload.content = config.plain_content || 'Pilih peran di bawah ini:';
    } else {
      const embed = new EmbedBuilder()
        .setTitle(config.embed_title || 'Reaction Roles')
        .setDescription(config.embed_description || 'Pilih peran di bawah ini untuk mendapatkan role.')
        .setColor(config.embed_color || '#6366f1');
      messagePayload.embeds = [embed];
    }

    // 2. Build Components
    let mappedOptions = config.options.map((opt, idx) => ({ ...opt, originalIndex: idx }));
    if (config.shuffle_roles) {
      mappedOptions.sort(() => Math.random() - 0.5);
    }

    const components = [];
    if (config.selection_type === 'buttons') {
      // Split buttons into rows of 5 (Discord maximum is 5 buttons per ActionRow)
      let currentRow = new ActionRowBuilder();
      mappedOptions.forEach((opt, idx) => {
        let resolvedLabel = opt.label;
        if (!resolvedLabel) {
          const firstRoleId = opt.role_ids?.[0] || opt.role_id;
          if (firstRoleId) {
            const role = guild.roles.cache.get(firstRoleId);
            if (role) resolvedLabel = role.name;
          }
        }
        if (!resolvedLabel) resolvedLabel = `Role ${opt.originalIndex + 1}`;

        const btn = new ButtonBuilder()
          .setCustomId(`rr_btn_${config.id}_${opt.originalIndex}`)
          .setLabel(resolvedLabel)
          .setStyle(ButtonStyle.Secondary);

        if (opt.emoji) {
          btn.setEmoji(opt.emoji);
        }

        currentRow.addComponents(btn);

        if (currentRow.components.length === 5 || idx === mappedOptions.length - 1) {
          components.push(currentRow);
          currentRow = new ActionRowBuilder();
        }
      });
      if (components.length > 0) {
        messagePayload.components = components;
      }
    } else if (config.selection_type === 'dropdowns') {
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`rr_select_${config.id}`)
        .setPlaceholder(config.dropdown_placeholder || 'Pilih opsi...');

      const selectOptions = mappedOptions.map((opt) => {
        let resolvedLabel = opt.label;
        if (!resolvedLabel) {
          const firstRoleId = opt.role_ids?.[0] || opt.role_id;
          if (firstRoleId) {
            const role = guild.roles.cache.get(firstRoleId);
            if (role) resolvedLabel = role.name;
          }
        }
        if (!resolvedLabel) resolvedLabel = `Opsi ${opt.originalIndex + 1}`;

        const selectOpt = {
          label: resolvedLabel,
          value: `${opt.originalIndex}`,
        };
        if (opt.description) {
          selectOpt.description = opt.description.slice(0, 100);
        }
        if (opt.emoji) {
          selectOpt.emoji = opt.emoji;
        }
        return selectOpt;
      });

      selectMenu.addOptions(selectOptions);
      components.push(new ActionRowBuilder().addComponents(selectMenu));
      messagePayload.components = components;
    }

    // Send or Edit the message
    let sentMessage = null;
    if (config.message_id) {
      try {
        const existingMessage = await channel.messages.fetch(config.message_id);
        if (existingMessage) {
          await existingMessage.edit(messagePayload);
          sentMessage = existingMessage;
        }
      } catch (err) {
        console.log('Pesan sebelumnya tidak ditemukan atau sudah terhapus, mengirim pesan baru...');
      }
    }

    if (!sentMessage) {
      sentMessage = await channel.send(messagePayload);
    }

    // 3. Add reactions if selection type is reactions
    if (config.selection_type === 'reactions') {
      // Respect shuffle for reactions order too!
      for (const opt of mappedOptions) {
        if (opt.emoji) {
          try {
            await sentMessage.react(opt.emoji);
          } catch (reactErr) {
            console.error(`Gagal bereaksi dengan ${opt.emoji}:`, reactErr.message);
          }
        }
      }
    }

    // Save message ID to database
    config.message_id = sentMessage.id;
    db.saveReactionRole(guildId, config);

    res.json({ success: true, messageId: sentMessage.id });
  } catch (error) {
    console.error('Gagal mengirim pesan reaction role ke Discord:', error);
    res.status(500).json({ error: 'Gagal mengirim pesan ke Discord.', details: error.message });
  }
});

// Get Server analytics statistics
app.get('/api/guilds/:guildId/analytics', checkAuth, (req, res) => {
  const { guildId } = req.params;
  const isDemo = req.session.user.demo;

  if (isDemo && guildId === '99999999999999') {
    return res.json(DEMO_ANALYTICS);
  }

  const stats = db.getServerAnalytics(guildId);
  res.json(stats);
});

// Get Server moderation audit logs feed
app.get('/api/guilds/:guildId/logs', checkAuth, (req, res) => {
  const { guildId } = req.params;
  const limit = parseInt(req.query.limit) || 20;
  const offset = parseInt(req.query.offset) || 0;
  const isDemo = req.session.user.demo;

  if (isDemo && guildId === '99999999999999') {
    return res.json(DEMO_LOGS);
  }

  const logs = db.getModerationLogs(guildId, limit, offset);
  res.json(logs);
});

// GET all members' stats for a guild (Admin only)
app.get('/api/guilds/:guildId/members-stats', checkAuth, async (req, res) => {
  const { guildId } = req.params;
  const isDemo = req.session.user.demo;

  if (isDemo && guildId === '99999999999999') {
    return res.json([
      {
        user_id: '123456789012345',
        username: 'GamerKalong (Demo)',
        avatarUrl: null,
        msg_count: 2850,
        voice_time: 3600 * 42.5,
        gaming_time: { 'Valorant': 3600 * 30.5, 'Minecraft': 3600 * 12.0 },
        achievements: ['first_word', 'chatterbox_basic', 'gamer_initiate']
      },
      {
        user_id: '222222222222222',
        username: 'ValkyrieVC (Demo)',
        avatarUrl: null,
        msg_count: 820,
        voice_time: 3600 * 38.2,
        gaming_time: { 'Valorant': 3600 * 38.2 },
        achievements: ['first_word']
      }
    ]);
  }

  try {
    const list = db.getAllUserStats(guildId);
    const detailedList = [];

    for (const member of list) {
      let username = `User ID: ${member.user_id}`;
      let avatarUrl = null;

      if (client.readyAt) {
        try {
          const user = await client.users.fetch(member.user_id);
          if (user) {
            username = user.username;
            avatarUrl = user.displayAvatarURL({ dynamic: true });
          }
        } catch (e) {
          // Fallback if user is not found or API fails
        }
      }

      detailedList.push({
        user_id: member.user_id,
        username,
        avatarUrl,
        msg_count: member.msg_count,
        voice_time: member.voice_time,
        gaming_time: member.gaming_time,
        achievements: member.achievements
      });
    }

    res.json(detailedList);
  } catch (error) {
    console.error('Error fetching members-stats:', error);
    res.status(500).json({ error: 'Gagal mengambil data statistik anggota.', details: error.message });
  }
});

// POST update stats for a specific user in a guild (Admin only)
app.post('/api/guilds/:guildId/members-stats/:userId', checkAuth, (req, res) => {
  const { guildId, userId } = req.params;
  const { msg_count, voice_time, gaming_time, achievements } = req.body;
  const isDemo = req.session.user.demo;

  if (isDemo && guildId === '99999999999999') {
    return res.json({ success: true });
  }

  try {
    const updated = db.updateUserStats(guildId, userId, {
      msg_count: msg_count !== undefined ? parseInt(msg_count) : undefined,
      voice_time: voice_time !== undefined ? parseInt(voice_time) : undefined,
      gaming_time,
      achievements: Array.isArray(achievements) ? achievements : undefined
    });

    res.json({ success: true, stats: updated });
  } catch (error) {
    console.error('Error updating member stats:', error);
    res.status(500).json({ error: 'Gagal memperbarui data statistik anggota.', details: error.message });
  }
});

// Get Server active achievements leaderboards
app.get('/api/guilds/:guildId/leaderboard', checkAuth, async (req, res) => {
  const { guildId } = req.params;
  const type = req.query.type || 'voice'; // voice, messages, gaming
  const isDemo = req.session.user.demo;

  if (isDemo && guildId === '99999999999999') {
    return res.json(DEMO_LEADERBOARD[type] || []);
  }

  const rows = db.getLeaderboard(guildId, type, 10);
  const formatted = [];

  for (let i = 0; i < rows.length; i++) {
    let name = `User ID: ${rows[i].user_id}`;
    if (client.readyAt) {
      const user = await client.users.fetch(rows[i].user_id).catch(() => null);
      if (user) name = user.username;
    }
    formatted.push({
      username: name,
      score: rows[i].score
    });
  }

  res.json(formatted);
});

// Serve frontend assets in production build
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
  app.get('*', (req, res) => {
    // SPA Fallback React Routing compatibility
    res.sendFile(path.join(buildPath, 'index.html'));
  });
} else {
  // If not built, present a lightweight REST server landing page
  app.get('/', (req, res) => {
    res.send('API Server Discord Logging & Analytics online. Frontend assets belum dibuild. Jalankan npm run build:frontend');
  });
}

// Start API Server
function startServer() {
  app.listen(PORT, () => {
    console.log(`Sistem Logger & Analitik: API Web & Dashboard berjalan lancar pada port ${PORT}`);
  });
}

module.exports = {
  startServer
};
