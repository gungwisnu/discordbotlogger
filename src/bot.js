const { Client, GatewayIntentBits, Collection, REST, Routes, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const db = require('./database');
require('dotenv').config();

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildModeration
  ]
});

client.commands = new Collection();

// Command handler definition
const commands = [
  {
    name: 'stats',
    description: 'Tampilkan statistik voice time, game time, dan chat pesan Anda di server.',
    options: [
      {
        name: 'user',
        type: 6, // USER type
        description: 'Pilih member untuk melihat statistik mereka.',
        required: false
      }
    ]
  },
  {
    name: 'leaderboard',
    description: 'Lihat peringkat server berdasarkan aktivitas.',
    options: [
      {
        name: 'kategori',
        type: 3, // STRING type
        description: 'Kategori peringkat yang ingin dilihat.',
        required: true,
        choices: [
          { name: 'Voice Time (Nongkrong VC)', value: 'voice' },
          { name: 'Pesan Chat terbanyak', value: 'messages' },
          { name: 'Gamer Teraktif (Gaming Time)', value: 'gaming' }
        ]
      }
    ]
  },
  {
    name: 'achievements',
    description: 'Tampilkan lencana/badges pencapaian server Anda.',
    options: [
      {
        name: 'user',
        type: 6, // USER type
        description: 'Pilih member untuk melihat lencana mereka.',
        required: false
      }
    ]
  }
];

// Map achievements definition
const ACHIEVEMENTS_METADATA = {
  first_word: { emoji: '💬', name: 'First Word', desc: 'Mengirimkan pesan pertama di server.' },
  chatterbox_basic: { emoji: '🗣️', name: 'Chatterbox I', desc: 'Mengirimkan 100 pesan chat.' },
  chatterbox_elite: { emoji: '📢', name: 'Chatterbox II', desc: 'Mengirimkan 1,000 pesan chat.' },
  vc_rookie: { emoji: '🎙️', name: 'VC Rookie', desc: 'Akumulasi nongkrong VC selama 1 jam.' },
  vc_veteran: { emoji: '👑', name: 'VC Veteran', desc: 'Akumulasi nongkrong VC selama 10 jam.' },
  vc_deity: { emoji: '♾️', name: 'VC Deity', desc: 'Akumulasi nongkrong VC selama 100 jam.' },
  marathon_vc: { emoji: '🏃', name: 'VC Marathoner', desc: 'Satu sesi VC tanpa putus minimal 5 jam.' },
  night_owl: { emoji: '🦉', name: 'Night Owl', desc: 'Nongkrong VC aktif di jam kalong (02:00 - 05:00).' },
  gamer_initiate: { emoji: '🎮', name: 'Gamer Initiate', desc: 'Bermain game terdeteksi minimal 1 jam.' },
  hardcore_gamer: { emoji: '🔥', name: 'Hardcore Gamer', desc: 'Bermain satu judul game minimal selama 10 jam.' }
};

// Ready event handling & slash command registration
client.once('ready', async () => {
  console.log(`Bot Discord online sebagai ${client.user.tag}!`);
  
  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.DISCORD_CLIENT_ID || client.user.id;
  
  if (token && token !== 'your_bot_token_here') {
    try {
      const rest = new REST({ version: '10' }).setToken(token);
      console.log('Mendaftarkan slash commands (/)...');
      
      await rest.put(
        Routes.applicationCommands(clientId),
        { body: commands }
      );
      
      console.log('Slash commands mumpuni terdaftar secara global!');
    } catch (error) {
      console.error('Gagal mendaftarkan slash commands:', error);
    }
  }

});

// Setup dynamic event listeners
function loadEvents() {
  const eventsPath = path.join(__dirname, 'events');
  if (!fs.existsSync(eventsPath)) {
    fs.mkdirSync(eventsPath, { recursive: true });
    return;
  }

  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    const eventName = file.split('.')[0];
    
    if (event.once) {
      client.once(eventName, (...args) => event.execute(...args, client));
    } else {
      client.on(eventName, (...args) => event.execute(...args, client));
    }
  }
  console.log(`Berhasil memuat ${eventFiles.length} event bot.`);
}

// Slash Command router handler
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, options, guildId, member } = interaction;
  if (!guildId) return interaction.reply({ content: 'Slash commands hanya bisa dijalankan di dalam Server/Guild.', ephemeral: true });

  const targetMember = options.getMember('user') || member;
  const targetUser = targetMember.user;

  if (commandName === 'stats') {
    await interaction.deferReply();
    const stats = db.getUserStats(guildId, targetUser.id);
    const settings = db.getGuildSettings(guildId);

    const hrs = Math.round((stats.voice_time / 3600) * 100) / 100;
    
    // Process game activity text
    let gameStatsStr = 'Tidak ada aktivitas game terdeteksi.';
    const games = Object.entries(stats.gaming_time || {});
    if (games.length > 0) {
      gameStatsStr = games
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([game, secs]) => {
          const gameHrs = Math.round((secs / 3600) * 100) / 100;
          return `• **${game}**: ${gameHrs} Jam`;
        })
        .join('\n');
    }

    const embed = new EmbedBuilder()
      .setColor(settings.embed_color || '#6366f1')
      .setTitle(`📈 Aktivitas & Statistik: ${targetUser.username}`)
      .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: '💬 Total Pesan Chat', value: `\`${stats.msg_count.toLocaleString()} pesan\``, inline: true },
        { name: '🎙️ Total Waktu Voice VC', value: `\`${hrs} jam\``, inline: true },
        { name: '🎮 Lencana/Badge Terbuka', value: `\`${(stats.achievements || []).length} / ${Object.keys(ACHIEVEMENTS_METADATA).length}\``, inline: true },
        { name: '🕹️ Top Game Dimainkan', value: gameStatsStr }
      )
      .setFooter({ text: 'Dibuat dengan ❤️ oleh Logging & Analytics System', iconURL: client.user.displayAvatarURL() })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }

  if (commandName === 'leaderboard') {
    await interaction.deferReply();
    const category = options.getString('kategori');
    const settings = db.getGuildSettings(guildId);
    
    const rows = db.getLeaderboard(guildId, category, 10);

    const embed = new EmbedBuilder()
      .setColor(settings.embed_color || '#6366f1')
      .setFooter({ text: 'Dibuat dengan ❤️ oleh Logging & Analytics System', iconURL: client.user.displayAvatarURL() })
      .setTimestamp();

    if (category === 'voice') {
      embed.setTitle('🎙️ Peringkat Server: Nongkrong VC Terlama');
      let desc = '';
      for (let i = 0; i < rows.length; i++) {
        const user = await client.users.fetch(rows[i].user_id).catch(() => null);
        const name = user ? user.username : `User ID: ${rows[i].user_id}`;
        const hrs = Math.round((rows[i].score / 3600) * 100) / 100;
        desc += `**#${i + 1}** - ${name} : \`${hrs} jam\`\n`;
      }
      embed.setDescription(desc || 'Belum ada data voice untuk server ini.');
    } else if (category === 'messages') {
      embed.setTitle('💬 Peringkat Server: Chat Pesan Teraktif');
      let desc = '';
      for (let i = 0; i < rows.length; i++) {
        const user = await client.users.fetch(rows[i].user_id).catch(() => null);
        const name = user ? user.username : `User ID: ${rows[i].user_id}`;
        desc += `**#${i + 1}** - ${name} : \`${rows[i].score.toLocaleString()} pesan\`\n`;
      }
      embed.setDescription(desc || 'Belum ada data pesan untuk server ini.');
    } else if (category === 'gaming') {
      embed.setTitle('🎮 Peringkat Server: Gaming Sessions Teraktif');
      let desc = '';
      for (let i = 0; i < rows.length; i++) {
        const user = await client.users.fetch(rows[i].user_id).catch(() => null);
        const name = user ? user.username : `User ID: ${rows[i].user_id}`;
        const hrs = Math.round((rows[i].score / 3600) * 100) / 100;
        desc += `**#${i + 1}** - ${name} : \`${hrs} jam total gaming\`\n`;
      }
      embed.setDescription(desc || 'Belum ada data game terdeteksi.');
    }

    await interaction.editReply({ embeds: [embed] });
  }

  if (commandName === 'achievements') {
    await interaction.deferReply();
    const stats = db.getUserStats(guildId, targetUser.id);
    const settings = db.getGuildSettings(guildId);
    
    const unlockedSet = new Set(stats.achievements || []);

    const embed = new EmbedBuilder()
      .setColor(settings.embed_color || '#6366f1')
      .setTitle(`🏆 Server Badges & Achievements: ${targetUser.username}`)
      .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
      .setDescription('Selesaikan tantangan server berikut untuk membuka lencana khusus!')
      .setFooter({ text: 'Mainkan game, nongkrong VC, dan ngobrol aktif untuk membuka lencana.', iconURL: client.user.displayAvatarURL() })
      .setTimestamp();

    Object.entries(ACHIEVEMENTS_METADATA).forEach(([id, meta]) => {
      const isUnlocked = unlockedSet.has(id);
      const title = `${isUnlocked ? '✅' : '🔒'} ${meta.emoji} ${meta.name}`;
      const desc = `_${meta.desc}_ - **${isUnlocked ? 'DIBUKA' : 'TERKUNCI'}**`;
      embed.addFields({ name: title, value: desc, inline: false });
    });

    await interaction.editReply({ embeds: [embed] });
  }
});

// Helper function to send log to guild channel
async function sendLog(guildId, category, embed) {
  const settings = db.getGuildSettings(guildId);
  
  // Check if log channel is set
  if (!settings.log_channel_id) return;
  
  // Check if category is enabled
  const cats = JSON.parse(settings.categories_enabled || '{}');
  if (cats[category] === false) return;

  try {
    const guild = await client.guilds.fetch(guildId).catch(() => null);
    if (!guild) return;

    const channel = await guild.channels.fetch(settings.log_channel_id).catch(() => null);
    if (!channel || !channel.isTextBased()) return;

    // Apply standard guild theme color if embed has no color
    if (!embed.data.color) {
      const colInt = parseInt(settings.embed_color.replace('#', ''), 16);
      embed.setColor(colInt || 0x6366f1);
    }

    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error(`Gagal mengirim log ke channel ${settings.log_channel_id}:`, error);
  }
}

// Function to start the Discord Client
function startBot() {
  const token = process.env.DISCORD_TOKEN;
  if (!token || token === 'your_bot_token_here') {
    console.warn('\x1b[33m%s\x1b[0m', '[WARN] DISCORD_TOKEN tidak diatur dengan benar di file .env. Bot tidak akan berjalan.');
    return null;
  }
  
  loadEvents();
  
  client.login(token).catch(err => {
    console.error('\x1b[31m%s\x1b[0m', 'Gagal masuk ke client Discord. Silakan periksa kembali Token Anda.', err.message);
  });
  
  return client;
}

module.exports = {
  client,
  startBot,
  sendLog,
  ACHIEVEMENTS_METADATA
};
