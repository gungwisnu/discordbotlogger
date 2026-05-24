const express = require('express');
const session = require('express-session');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const db = require('./database');
const { client } = require('./bot');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || process.env.SERVER_PORT || 5000;

// Enable CORS for frontend dev server
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'antigravity-logging-bot-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 Hours
}));

// Helper: check auth middleware
function checkAuth(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized. Silakan masuk terlebih dahulu.' });
  }
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
    voice: true,
    member: true,
    server: true,
    activity: true
  }),
  embed_color: '#6366f1',
  ignored_channels: '["555"]'
};

// ----------------------------------------------------
// AUTHENTICATION ROUTES
// ----------------------------------------------------

// Bypass Login for DEMO Mode
app.get('/api/auth/demo', (req, res) => {
  req.session.user = DEMO_USER;
  req.session.guilds = DEMO_GUILDS;
  res.json({ success: true, user: DEMO_USER });
});

// OAuth2 Discord Login redirect
app.get('/api/auth/login', (req, res) => {
  const clientId = process.env.DISCORD_CLIENT_ID;

  // Dynamically determine redirect URI if not explicitly configured
  let rawRedirectUri = process.env.REDIRECT_URI;
  if (!rawRedirectUri || rawRedirectUri === 'your_redirect_uri_here') {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    rawRedirectUri = `${protocol}://${req.get('host')}/api/auth/callback`;
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
  let redirectBase = process.env.FRONTEND_URL || 'http://localhost:5173';
  if (req.get('host') && (req.get('host').includes('5000') || !process.env.FRONTEND_URL)) {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    redirectBase = `${protocol}://${req.get('host')}`;
  }

  // Construct dynamic redirect URI for Discord swap code validation
  let rawRedirectUri = process.env.REDIRECT_URI;
  if (!rawRedirectUri || rawRedirectUri === 'your_redirect_uri_here') {
    rawRedirectUri = `${redirectBase}/api/auth/callback`;
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

    res.redirect(`${redirectBase}/dashboard`);
  } catch (error) {
    console.error('Error swap OAuth2 Token:', error.response?.data || error.message);
    res.redirect(`${redirectBase}?error=auth_failed`);
  }
});

// Get Session User profile details
app.get('/api/auth/user', (req, res) => {
  if (req.session.user) {
    res.json({ user: req.session.user, guilds: req.session.guilds });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Logout Session
app.get('/api/auth/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'Gagal logout.' });
    }
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
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
    ignored_channels: JSON.parse(settings.ignored_channels || '[]')
  });
});

// Update Guild Settings
app.post('/api/guilds/:guildId/settings', checkAuth, (req, res) => {
  const { guildId } = req.params;
  const { log_channel_id, categories_enabled, embed_color, ignored_channels } = req.body;
  const isDemo = req.session.user.demo;

  if (isDemo && guildId === '99999999999999') {
    Object.assign(DEMO_SETTINGS, {
      log_channel_id,
      categories_enabled: typeof categories_enabled === 'string' ? categories_enabled : JSON.stringify(categories_enabled),
      embed_color,
      ignored_channels: typeof ignored_channels === 'string' ? ignored_channels : JSON.stringify(ignored_channels)
    });
    return res.json({ success: true, settings: DEMO_SETTINGS });
  }

  const updated = db.setGuildSettings(guildId, {
    log_channel_id,
    categories_enabled,
    embed_color,
    ignored_channels
  });

  res.json({
    success: true,
    settings: {
      ...updated,
      categories_enabled: JSON.parse(updated.categories_enabled || '{}'),
      ignored_channels: JSON.parse(updated.ignored_channels || '[]')
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
const buildPath = path.join(__dirname, '../frontend/dist');
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
    console.log(`API Web & OAuth2 Dashboard berjalan lancar di http://localhost:${PORT}`);
  });
}

module.exports = {
  startServer
};
