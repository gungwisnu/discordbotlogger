const { Client, GatewayIntentBits, Partials, Collection, REST, Routes, EmbedBuilder, PermissionsBitField, ChannelType } = require('discord.js');
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
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

client.commands = new Collection();

// Command handler definition
const commands = [
  {
    name: 'stats',
    description: 'Menampilkan statistik durasi Voice, durasi bermain game, dan jumlah pesan teks Anda di server.',
    options: [
      {
        name: 'user',
        type: 6, // USER type
        description: 'Pilih anggota untuk melihat statistik mereka.',
        required: false
      }
    ]
  },
  {
    name: 'leaderboard',
    description: 'Menampilkan peringkat server berdasarkan aktivitas anggota.',
    options: [
      {
        name: 'kategori',
        type: 3, // STRING type
        description: 'Kategori peringkat yang ingin dilihat.',
        required: true,
        choices: [
          { name: 'Durasi Sesi Voice', value: 'voice' },
          { name: 'Pesan Teks Terbanyak', value: 'messages' },
          { name: 'Waktu Bermain Game Teraktif', value: 'gaming' }
        ]
      }
    ]
  },
  {
    name: 'achievements',
    description: 'Menampilkan lencana pencapaian server Anda.',
    options: [
      {
        name: 'user',
        type: 6, // USER type
        description: 'Pilih anggota untuk melihat lencana mereka.',
        required: false
      }
    ]
  },
  {
    name: 'help',
    description: 'Menampilkan panduan penggunaan perintah bot Pandu.',
    options: [
      {
        name: 'admin',
        type: 5, // BOOLEAN type
        description: 'Setel ke true untuk melihat menu bantuan konfigurasi admin.',
        required: false
      }
    ]
  },
  {
    name: 'status',
    description: 'Memeriksa seluruh konfigurasi logging & welcome server saat ini.'
  },
  {
    name: 'setlog',
    description: 'Mengatur saluran teks utama tujuan pengiriman log aktivitas.',
    options: [
      {
        name: 'channel',
        type: 7, // CHANNEL type
        description: 'Pilih saluran teks yang ingin dituju.',
        required: true
      }
    ]
  },
  {
    name: 'setcolor',
    description: 'Mengubah warna embed log aktivitas server.',
    options: [
      {
        name: 'hex',
        type: 3, // STRING type
        description: 'Kode hex warna (contoh: #ff0000).',
        required: true
      }
    ]
  },
  {
    name: 'log',
    description: 'Mengaktifkan atau menonaktifkan kategori log aktivitas tertentu.',
    options: [
      {
        name: 'aksi',
        type: 3, // STRING type
        description: 'Pilih aksi log.',
        required: true,
        choices: [
          { name: 'Aktifkan (Enable)', value: 'enable' },
          { name: 'Nonaktifkan (Disable)', value: 'disable' }
        ]
      },
      {
        name: 'kategori',
        type: 3, // STRING type
        description: 'Pilih kategori peristiwa log.',
        required: true,
        choices: [
          { name: 'Log Moderasi', value: 'moderation' },
          { name: 'Log Voice Join/Leave', value: 'voice_join_leave' },
          { name: 'Log Voice Mute/Deafen', value: 'voice_mute_deafen' },
          { name: 'Log Profil Anggota', value: 'member' },
          { name: 'Log Konfigurasi Server', value: 'server' },
          { name: 'Log Aktivitas Game', value: 'gaming_activity' },
          { name: 'Log Spotify', value: 'spotify_activity' },
          { name: 'Log Status Pengguna', value: 'user_status' }
        ]
      }
    ]
  },
  {
    name: 'ignore',
    description: 'Mengabaikan saluran teks dari pencatatan log dan statistik aktivitas.',
    options: [
      {
        name: 'channel',
        type: 7, // CHANNEL type
        description: 'Saluran yang ingin diabaikan.',
        required: true
      }
    ]
  },
  {
    name: 'unignore',
    description: 'Menghapus saluran teks dari daftar saluran diabaikan.',
    options: [
      {
        name: 'channel',
        type: 7, // CHANNEL type
        description: 'Saluran yang ingin dihapus.',
        required: true
      }
    ]
  },
  {
    name: 'setmodel',
    description: 'Mengatur model kecerdasan buatan (AI) DeepSeek untuk server ini.',
    options: [
      {
        name: 'model',
        type: 3, // STRING type
        description: 'Model DeepSeek AI.',
        required: true,
        choices: [
          { name: 'Model Tercepat (deepseek-chat)', value: 'faster' },
          { name: 'Model Pemikir (deepseek-reasoner)', value: 'thinker' }
        ]
      }
    ]
  },
  {
    name: 'welcome',
    description: 'Mengaktifkan atau menonaktifkan fitur sapaan welcome anggota baru.',
    options: [
      {
        name: 'aksi',
        type: 3, // STRING type
        description: 'Pilih aksi.',
        required: true,
        choices: [
          { name: 'Aktifkan (Enable)', value: 'enable' },
          { name: 'Nonaktifkan (Disable)', value: 'disable' }
        ]
      }
    ]
  },
  {
    name: 'setwelcome',
    description: 'Mengatur saluran tujuan pengiriman pesan selamat datang.',
    options: [
      {
        name: 'channel',
        type: 7, // CHANNEL type
        description: 'Saluran teks welcome.',
        required: true
      }
    ]
  },
  {
    name: 'welcomemsg',
    description: 'Mengatur isi pesan selamat datang (Gunakan {user} sebagai mention placeholder).',
    options: [
      {
        name: 'pesan',
        type: 3, // STRING type
        description: 'Isi teks pesan welcome baru (opsional).',
        required: false
      }
    ]
  },
  {
    name: 'autorole',
    description: 'Mengaktifkan atau menonaktifkan pemberian peran otomatis bagi anggota baru.',
    options: [
      {
        name: 'aksi',
        type: 3, // STRING type
        description: 'Pilih aksi.',
        required: true,
        choices: [
          { name: 'Aktifkan (Enable)', value: 'enable' },
          { name: 'Nonaktifkan (Disable)', value: 'disable' }
        ]
      }
    ]
  },
  {
    name: 'setrole',
    description: 'Mengatur peran (role) yang diberikan otomatis bagi anggota baru.',
    options: [
      {
        name: 'role',
        type: 8, // ROLE type
        description: 'Pilih peran Discord.',
        required: true
      }
    ]
  },
  {
    name: 'setachievement',
    description: 'Mengatur atau menonaktifkan saluran notifikasi pencapaian server.',
    options: [
      {
        name: 'aksi',
        type: 3, // STRING type
        description: 'Pilih aksi.',
        required: true,
        choices: [
          { name: 'Aktifkan di Saluran (Enable)', value: 'enable' },
          { name: 'Nonaktifkan (Disable)', value: 'disable' }
        ]
      },
      {
        name: 'channel',
        type: 7, // CHANNEL type
        description: 'Pilih saluran jika aksi disetel ke Aktifkan.',
        required: false
      }
    ]
  },
  {
    name: 'logchannel',
    description: 'Mengatur saluran pengiriman log terpisah secara khusus per kategori.',
    options: [
      {
        name: 'kategori',
        type: 3, // STRING type
        description: 'Pilih kategori peristiwa log.',
        required: true,
        choices: [
          { name: 'Kategori Voice (VC)', value: 'voice' },
          { name: 'Kategori Game (Gaming)', value: 'gaming' },
          { name: 'Kategori Spotify', value: 'spotify' },
          { name: 'Kategori Moderasi', value: 'mod' },
          { name: 'Log Moderasi Spesifik', value: 'moderation' },
          { name: 'Log Voice Join/Leave', value: 'voice_join_leave' },
          { name: 'Log Voice Mute/Deafen', value: 'voice_mute_deafen' },
          { name: 'Log Profil Anggota', value: 'member' },
          { name: 'Log Konfigurasi Server', value: 'server' },
          { name: 'Log Aktivitas Game Spesifik', value: 'gaming_activity' },
          { name: 'Log Spotify Spesifik', value: 'spotify_activity' },
          { name: 'Kategori Status Pengguna', value: 'status' },
          { name: 'Log Status Pengguna Spesifik', value: 'user_status' }
        ]
      },
      {
        name: 'channel',
        type: 7, // CHANNEL type
        description: 'Pilih saluran teks log khusus.',
        required: true
      }
    ]
  },
  {
    name: 'logchannel-reset',
    description: 'Mereset saluran log kategori khusus agar kembali menggunakan Saluran Log Utama.',
    options: [
      {
        name: 'kategori',
        type: 3, // STRING type
        description: 'Pilih kategori peristiwa log.',
        required: true,
        choices: [
          { name: 'Kategori Voice (VC)', value: 'voice' },
          { name: 'Kategori Game (Gaming)', value: 'gaming' },
          { name: 'Kategori Spotify', value: 'spotify' },
          { name: 'Kategori Moderasi', value: 'mod' },
          { name: 'Log Moderasi Spesifik', value: 'moderation' },
          { name: 'Log Voice Join/Leave', value: 'voice_join_leave' },
          { name: 'Log Voice Mute/Deafen', value: 'voice_mute_deafen' },
          { name: 'Log Profil Anggota', value: 'member' },
          { name: 'Log Konfigurasi Server', value: 'server' },
          { name: 'Log Aktivitas Game Spesifik', value: 'gaming_activity' },
          { name: 'Log Spotify Spesifik', value: 'spotify_activity' },
          { name: 'Kategori Status Pengguna', value: 'status' },
          { name: 'Log Status Pengguna Spesifik', value: 'user_status' }
        ]
      }
    ]
  },
  {
    name: 'gitpull',
    description: 'Melakukan git pull untuk memperbarui bot langsung dari repositori GitHub (Admin).'
  }
];

// Map achievements definition
const ACHIEVEMENTS_METADATA = {
  first_word: { emoji: '💬', name: 'First Word', desc: 'Mengirimkan pesan pertama di server.' },
  chatterbox_basic: { emoji: '🗣️', name: 'Chatterbox I', desc: 'Mengirimkan 100 pesan teks.' },
  chatterbox_elite: { emoji: '📢', name: 'Chatterbox II', desc: 'Mengirimkan 1.000 pesan teks.' },
  chatterbox_legend: { emoji: '🏆', name: 'Chatterbox Legend', desc: 'Mengirimkan 10.000 pesan teks di server.' },
  vc_rookie: { emoji: '🎙️', name: 'Voice Rookie', desc: 'Akumulasi aktivitas Voice selama 1 jam.' },
  vc_veteran: { emoji: '👑', name: 'Voice Veteran', desc: 'Akumulasi aktivitas Voice selama 10 jam.' },
  vc_master: { emoji: '👑', name: 'Voice Master', desc: 'Akumulasi aktivitas Voice selama 50 jam.' },
  vc_deity: { emoji: '♾️', name: 'Voice Deity', desc: 'Mengumpulkan 100 jam sesi Voice.' },
  marathon_vc: { emoji: '🏃', name: 'Voice Marathoner', desc: 'Satu sesi Voice tanpa terputus minimal selama 5 jam.' },
  night_owl: { emoji: '🦉', name: 'Night Owl', desc: 'Aktivitas Voice secara aktif pada dini hari (02:00 - 05:00).' },
  early_bird: { emoji: '🌅', name: 'Early Bird', desc: 'Aktif bergabung ke saluran Voice pada pagi hari (05:00 - 08:00).' },
  weekend_warrior: { emoji: '⚔️', name: 'Weekend Warrior', desc: 'Aktif menggunakan saluran Voice pada akhir pekan (Sabtu/Minggu).' },
  gamer_initiate: { emoji: '🎮', name: 'Gamer Initiate', desc: 'Deteksi aktivitas bermain game minimal selama 1 jam.' },
  hardcore_gamer: { emoji: '🔥', name: 'Hardcore Gamer', desc: 'Mencapai bermain satu judul game minimal selama 10 jam.' },
  gamer_expert: { emoji: '🌟', name: 'Gamer Expert', desc: 'Mengumpulkan total durasi bermain seluruh game selama 50 jam.' }
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

  // Set status
  client.user.setPresence({
    activities: [{
      name: 'Menghayal',
      type: 0, // 0 = ActivityType.Playing
      state: 'pan!help for more info',
      timestamps: {
        start: Date.now()
      }
    }]
  });
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
  // Handle reaction roles buttons & select menus
  if (interaction.isButton()) {
    const customId = interaction.customId;
    if (customId.startsWith('rr_btn_')) {
      return handleReactionRoleButton(interaction);
    }
  }

  if (interaction.isStringSelectMenu()) {
    const customId = interaction.customId;
    if (customId.startsWith('rr_select_')) {
      return handleReactionRoleSelect(interaction);
    }
  }

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
    let gameStatsStr = 'Tidak ada aktivitas bermain game yang terdeteksi.';
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
        { name: '💬 Total Pesan Teks', value: `\`${stats.msg_count.toLocaleString()} pesan\``, inline: true },
        { name: '🎙️ Total Durasi Voice', value: `\`${hrs} jam\``, inline: true },
        { name: '🏆 Lencana Terbuka', value: `\`${(stats.achievements || []).length} / ${Object.keys(ACHIEVEMENTS_METADATA).length}\``, inline: true },
        { name: '🕹️ Game Terpopuler Dimainkan', value: gameStatsStr }
      )
      .setFooter({ text: 'Sistem Logger & Analitik Server', iconURL: client.user.displayAvatarURL() })
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
      .setFooter({ text: 'Sistem Logger & Analitik Server', iconURL: client.user.displayAvatarURL() })
      .setTimestamp();

    if (category === 'voice') {
      embed.setTitle('🎙️ Peringkat Server: Durasi Sesi Voice Terlama');
      let desc = '';
      for (let i = 0; i < rows.length; i++) {
        const user = await client.users.fetch(rows[i].user_id).catch(() => null);
        const name = user ? user.username : `User ID: ${rows[i].user_id}`;
        const hrs = Math.round((rows[i].score / 3600) * 100) / 100;
        desc += `**#${i + 1}** - ${name} : \`${hrs} jam\`\n`;
      }
      embed.setDescription(desc || 'Belum ada data aktivitas Voice untuk server ini.');
    } else if (category === 'messages') {
      embed.setTitle('💬 Peringkat Server: Pengirim Pesan Teks Teraktif');
      let desc = '';
      for (let i = 0; i < rows.length; i++) {
        const user = await client.users.fetch(rows[i].user_id).catch(() => null);
        const name = user ? user.username : `User ID: ${rows[i].user_id}`;
        desc += `**#${i + 1}** - ${name} : \`${rows[i].score.toLocaleString()} pesan\`\n`;
      }
      embed.setDescription(desc || 'Belum ada data pesan untuk server ini.');
    } else if (category === 'gaming') {
      embed.setTitle('🎮 Peringkat Server: Durasi Bermain Game Terlama');
      let desc = '';
      for (let i = 0; i < rows.length; i++) {
        const user = await client.users.fetch(rows[i].user_id).catch(() => null);
        const name = user ? user.username : `User ID: ${rows[i].user_id}`;
        const hrs = Math.round((rows[i].score / 3600) * 100) / 100;
        desc += `**#${i + 1}** - ${name} : \`${hrs} jam total bermain game\`\n`;
      }
      embed.setDescription(desc || 'Belum ada data bermain game yang terdeteksi.');
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
      .setTitle(`🏆 Lencana & Pencapaian Server: ${targetUser.username}`)
      .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
      .setDescription('Selesaikan tantangan server berikut untuk membuka lencana pencapaian eksklusif!')
      .setFooter({ text: 'Aktiflah bermain game, gunakan Voice, dan kirimkan pesan untuk membuka lencana.', iconURL: client.user.displayAvatarURL() })
      .setTimestamp();

    Object.entries(ACHIEVEMENTS_METADATA).forEach(([id, meta]) => {
      const isUnlocked = unlockedSet.has(id);
      const title = `${isUnlocked ? '✅' : '🔒'} ${meta.emoji} ${meta.name}`;
      const desc = `_${meta.desc}_ - **${isUnlocked ? 'TERBUKA' : 'TERKUNCI'}**`;
      embed.addFields({ name: title, value: desc, inline: false });
    });

    await interaction.editReply({ embeds: [embed] });
  }

  if (commandName === 'help') {
    const isAdminHelp = options.getBoolean('admin') || false;
    const settings = db.getGuildSettings(guildId);

    if (isAdminHelp) {
      if (!member.permissions.has(PermissionsBitField.Flags.ManageGuild) && !member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply({ content: '❌ Anda tidak memiliki izin (Manage Server / Administrator) yang diperlukan untuk melihat menu bantuan admin.', ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setColor(settings.embed_color || '#6366f1')
        .setTitle('⚙️ Daftar Command Admin Pandu')
        .setDescription('Berikut adalah daftar command konfigurasi server untuk Administrator:')
        .addFields(
          { name: '🎯 Saluran & Log Utama', value: '`/setlog <#channel>` - Mengatur saluran tujuan log utama\n`/log <enable|disable> <kategori>` - Mengaktifkan/menonaktifkan kategori log\n*(Kategori: `moderation`, `voice_join_leave`, `voice_mute_deafen`, `member`, `server`, `gaming_activity`, `spotify_activity`, `user_status`)*\n`/ignore <#channel>` - Mengabaikan saluran dari pencatatan log/statistik\n`/unignore <#channel>` - Menghapus saluran dari daftar abaikan\n`/setcolor <hex_code>` - Mengubah warna embed log (contoh: `#ff0000`)' },
          { name: '🤖 Pengaturan AI, Update & Status', value: '`/setmodel <faster|thinker>` - Mengubah model AI DeepSeek\n`/status` - Memeriksa konfigurasi server saat ini\n`/gitpull` - Melakukan git pull dan merestart bot secara otomatis' },
          { name: '📥 Welcome & Pencapaian', value: '`/welcome <enable|disable>` - Mengaktifkan/menonaktifkan welcome\n`/setwelcome <#channel>` - Mengatur saluran welcome\n`/welcomemsg [pesan]` - Mengatur pesan welcome\n`/setachievement <enable|disable> [channel]` - Mengatur saluran notifikasi pencapaian' },
          { name: '🛡️ Pengaturan Auto-Role', value: '`/autorole <enable|disable>` - Mengaktifkan/menonaktifkan pemberian peran otomatis\n`/setrole <@role>` - Mengatur peran otomatis bagi anggota baru' },
          { name: '🎯 Granular Log Channels', value: '`/logchannel <kategori> <#channel>` - Mengatur log saluran terpisah per kategori\n*(Kategori: `voice`, `gaming`, `spotify`, `mod`, `moderation`, \`voice_join_leave\`, \`voice_mute_deafen\`, `member`, `server`, `gaming_activity`, `spotify_activity`, `status`, `user_status`)*\n`/logchannel-reset <kategori>` - Mengembalikan kategori log ke saluran utama' }
         )
        .setFooter({ text: 'Sistem Logger & Analitik Server', iconURL: client.user.displayAvatarURL() })
        .setTimestamp();
      return interaction.reply({ embeds: [embed] });
    } else {
      const embed = new EmbedBuilder()
        .setColor(settings.embed_color || '#6366f1')
        .setTitle('🤖 Daftar Command Pandu')
        .setDescription('Berikut adalah daftar command yang tersedia untuk server ini:')
        .addFields(
          { name: '📊 Statistik & Informasi', value: '`/stats [user]` - Menampilkan statistik pengguna\n`/leaderboard <voice|messages|gaming>` - Menampilkan peringkat server\n`/achievements [user]` - Menampilkan lencana pencapaian' },
          { name: '🎙️ Saluran Voice (Streak Helper)', value: '`pan!join` - Bot bergabung ke saluran voice Anda\n`pan!leave` - Bot keluar dari saluran voice' },
          { name: '🧠 Obrolan AI', value: 'Tandai (tag) bot atau ketik `pan!ask <pertanyaan>` untuk bertanya kepada AI.' }
        )
        .setFooter({ text: 'Gunakan opsi /help admin:true jika Anda adalah Administrator untuk konfigurasi bot.', iconURL: client.user.displayAvatarURL() })
        .setTimestamp();
      return interaction.reply({ embeds: [embed] });
    }
  }

  if (commandName === 'status') {
    if (!member.permissions.has(PermissionsBitField.Flags.ManageGuild) && !member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: '❌ Anda tidak memiliki izin (Manage Server / Administrator) yang diperlukan untuk menggunakan perintah pengaturan ini.', ephemeral: true });
    }
    
    await interaction.deferReply();
    const settings = db.getGuildSettings(guildId);
    const cats = JSON.parse(settings.categories_enabled || '{}');
    const ign = JSON.parse(settings.ignored_channels || '[]');
    
    const catStr = Object.entries(cats).map(([k, v]) => `• **${k}**: ${v ? '✅ Aktif' : '❌ Nonaktif'}`).join('\n') || 'Belum ada pengaturan spesifik (bawaan: semua aktif)';
    const ignStr = ign.map(id => `<#${id}>`).join(', ') || 'Tidak ada';

    const welcomeChanStr = settings.welcome_channel_id ? `<#${settings.welcome_channel_id}>` : '*Belum diatur*';
    const welcomeStatus = `• Status: ${settings.welcome_enabled ? '✅ Aktif' : '❌ Nonaktif'}\n• Saluran: ${welcomeChanStr}\n• Pesan: \`${settings.welcome_message || 'Selamat datang, {user}!'}\``;

    const roleStr = settings.autorole_role_id ? `<@&${settings.autorole_role_id}>` : '*Belum diatur*';
    const autoroleStatus = `• Status: ${settings.autorole_enabled ? '✅ Aktif' : '❌ Nonaktif'}\n• Peran: ${roleStr}`;

    const achChanStr = settings.achievement_channel_id ? `<#${settings.achievement_channel_id}>` : '*Belum diatur (Dinonaktifkan)*';
    const achievementStatus = `• Saluran: ${achChanStr}`;

    const logChannels = JSON.parse(settings.log_channels || '{}');
    const granularStr = Object.entries(logChannels).map(([k, v]) => `• **${k}**: <#${v}>`).join('\n') || 'Semua kategori menggunakan Saluran Log Utama.';

    const embed = new EmbedBuilder()
      .setColor(settings.embed_color || '#6366f1')
      .setTitle('⚙️ Konfigurasi Log & AI Server')
      .addFields(
        { name: 'Saluran Log Utama', value: settings.log_channel_id ? `<#${settings.log_channel_id}>` : 'Belum diatur', inline: true },
        { name: 'Warna Embed', value: `\`${settings.embed_color || '#6366f1'}\``, inline: true },
        { name: 'Model AI DeepSeek', value: settings.ai_model === 'deepseek-reasoner' ? '🧠 **Pemikir (deepseek-reasoner)**' : '⚡ **Tercepat (deepseek-chat)**', inline: true },
        { name: 'Asisten AI Status', value: settings.ai_enabled ? '✅ **Aktif / Diizinkan**' : '❌ **Dinonaktifkan**', inline: true },
        { name: '📥 Fitur Welcome (Sapaan)', value: welcomeStatus },
        { name: '🏆 Saluran Notifikasi Pencapaian', value: achievementStatus },
        { name: '🛡️ Fitur Auto-Role', value: autoroleStatus },
        { name: '🎯 Granular Log Channels', value: granularStr },
        { name: 'Kategori Log Aktif', value: catStr },
        { name: 'Saluran Diabaikan', value: ignStr }
      )
      .setFooter({ text: 'Sistem Logger & Analitik Server', iconURL: client.user.displayAvatarURL() })
      .setTimestamp();
    return interaction.editReply({ embeds: [embed] });
  }

  if (commandName === 'setlog') {
    if (!member.permissions.has(PermissionsBitField.Flags.ManageGuild) && !member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: '❌ Anda tidak memiliki izin (Manage Server / Administrator) yang diperlukan untuk menggunakan perintah pengaturan ini.', ephemeral: true });
    }
    
    const channel = options.getChannel('channel');
    if (channel.type !== ChannelType.GuildText) {
      return interaction.reply({ content: '❌ Saluran yang dipilih harus berupa saluran teks.', ephemeral: true });
    }

    db.setGuildSettings(guildId, { log_channel_id: channel.id });
    return interaction.reply({ content: `✅ Berhasil mengatur saluran log utama ke <#${channel.id}>` });
  }

  if (commandName === 'setcolor') {
    if (!member.permissions.has(PermissionsBitField.Flags.ManageGuild) && !member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: '❌ Anda tidak memiliki izin (Manage Server / Administrator) yang diperlukan untuk menggunakan perintah pengaturan ini.', ephemeral: true });
    }
    
    const hex = options.getString('hex');
    if (!/^#([0-9A-F]{3}){1,2}$/i.test(hex)) {
      return interaction.reply({ content: '❌ Harap masukkan kode hex warna yang valid, contoh: `#ff0000`', ephemeral: true });
    }

    db.setGuildSettings(guildId, { embed_color: hex });
    const embed = new EmbedBuilder().setColor(hex).setDescription(`✅ Warna embed log berhasil diubah menjadi \`${hex}\``);
    return interaction.reply({ embeds: [embed] });
  }

  if (commandName === 'log') {
    if (!member.permissions.has(PermissionsBitField.Flags.ManageGuild) && !member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: '❌ Anda tidak memiliki izin (Manage Server / Administrator) yang diperlukan untuk menggunakan perintah pengaturan ini.', ephemeral: true });
    }

    const action = options.getString('aksi');
    const category = options.getString('kategori');
    const settings = db.getGuildSettings(guildId);

    const cats = JSON.parse(settings.categories_enabled || '{}');
    cats[category] = (action === 'enable');
    db.setGuildSettings(guildId, { categories_enabled: JSON.stringify(cats) });
    
    return interaction.reply({ content: `✅ Kategori log **${category}** berhasil ${action === 'enable' ? 'diaktifkan' : 'dinonaktifkan'}.` });
  }

  if (commandName === 'ignore') {
    if (!member.permissions.has(PermissionsBitField.Flags.ManageGuild) && !member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: '❌ Anda tidak memiliki izin (Manage Server / Administrator) yang diperlukan untuk menggunakan perintah pengaturan ini.', ephemeral: true });
    }

    const channel = options.getChannel('channel');
    const settings = db.getGuildSettings(guildId);

    const ign = JSON.parse(settings.ignored_channels || '[]');
    if (!ign.includes(channel.id)) {
      ign.push(channel.id);
      db.setGuildSettings(guildId, { ignored_channels: JSON.stringify(ign) });
    }
    return interaction.reply({ content: `✅ Saluran <#${channel.id}> kini diabaikan dari pencatatan log dan statistik.` });
  }

  if (commandName === 'unignore') {
    if (!member.permissions.has(PermissionsBitField.Flags.ManageGuild) && !member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: '❌ Anda tidak memiliki izin (Manage Server / Administrator) yang diperlukan untuk menggunakan perintah pengaturan ini.', ephemeral: true });
    }

    const channel = options.getChannel('channel');
    const settings = db.getGuildSettings(guildId);

    let ign = JSON.parse(settings.ignored_channels || '[]');
    ign = ign.filter(id => id !== channel.id);
    db.setGuildSettings(guildId, { ignored_channels: JSON.stringify(ign) });
    
    return interaction.reply({ content: `✅ Saluran <#${channel.id}> tidak lagi diabaikan.` });
  }

  if (commandName === 'setmodel') {
    if (!member.permissions.has(PermissionsBitField.Flags.ManageGuild) && !member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: '❌ Anda tidak memiliki izin (Manage Server / Administrator) yang diperlukan untuk menggunakan perintah pengaturan ini.', ephemeral: true });
    }

    const modelArg = options.getString('model');
    const modelValue = modelArg === 'faster' ? 'deepseek-chat' : 'deepseek-reasoner';
    db.setGuildSettings(guildId, { ai_model: modelValue });

    const modelName = modelValue === 'deepseek-reasoner' ? 'Pemikir (deepseek-reasoner) 🧠' : 'Tercepat (deepseek-chat) ⚡';
    return interaction.reply({ content: `✅ Berhasil mengatur model otak AI server ini ke **${modelName}**.` });
  }

  if (commandName === 'welcome') {
    if (!member.permissions.has(PermissionsBitField.Flags.ManageGuild) && !member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: '❌ Anda tidak memiliki izin (Manage Server / Administrator) yang diperlukan untuk menggunakan perintah pengaturan ini.', ephemeral: true });
    }

    const action = options.getString('aksi');
    const isEnable = action === 'enable';
    const settings = db.getGuildSettings(guildId);

    if (isEnable && !settings.welcome_channel_id) {
      return interaction.reply({ content: '⚠️ Anda belum mengatur saluran sapaan welcome. Harap atur terlebih dahulu menggunakan `/setwelcome <channel>`', ephemeral: true });
    }

    db.setGuildSettings(guildId, { welcome_enabled: isEnable });
    return interaction.reply({ content: `✅ Fitur pesan selamat datang berhasil **${isEnable ? 'diaktifkan' : 'dinonaktifkan'}**.` });
  }

  if (commandName === 'setwelcome') {
    if (!member.permissions.has(PermissionsBitField.Flags.ManageGuild) && !member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: '❌ Anda tidak memiliki izin (Manage Server / Administrator) yang diperlukan untuk menggunakan perintah pengaturan ini.', ephemeral: true });
    }

    const channel = options.getChannel('channel');
    if (channel.type !== ChannelType.GuildText) {
      return interaction.reply({ content: '❌ Saluran yang dipilih harus berupa saluran teks.', ephemeral: true });
    }

    db.setGuildSettings(guildId, {
      welcome_channel_id: channel.id,
      welcome_enabled: true
    });
    return interaction.reply({ content: `✅ Berhasil mengatur saluran welcome ke <#${channel.id}> dan otomatis mengaktifkan fitur welcome.` });
  }

  if (commandName === 'welcomemsg') {
    if (!member.permissions.has(PermissionsBitField.Flags.ManageGuild) && !member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: '❌ Anda tidak memiliki izin (Manage Server / Administrator) yang diperlukan untuk menggunakan perintah pengaturan ini.', ephemeral: true });
    }

    const welcomeText = options.getString('pesan');
    const settings = db.getGuildSettings(guildId);

    if (!welcomeText) {
      return interaction.reply({ content: `ℹ️ Pesan welcome saat ini:\n\`${settings.welcome_message || 'Selamat datang, {user}!'}\`\n\nUntuk mengubahnya, gunakan opsi \`pesan\` pada command ini.`, ephemeral: true });
    }

    db.setGuildSettings(guildId, { welcome_message: welcomeText });
    return interaction.reply({ content: `✅ Pesan welcome berhasil diubah menjadi:\n\`${welcomeText}\`` });
  }

  if (commandName === 'autorole') {
    if (!member.permissions.has(PermissionsBitField.Flags.ManageGuild) && !member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: '❌ Anda tidak memiliki izin (Manage Server / Administrator) yang diperlukan untuk menggunakan perintah pengaturan ini.', ephemeral: true });
    }

    const action = options.getString('aksi');
    const isEnable = action === 'enable';
    const settings = db.getGuildSettings(guildId);

    if (isEnable && !settings.autorole_role_id) {
      return interaction.reply({ content: '⚠️ Anda belum mengatur peran untuk auto-role. Harap atur terlebih dahulu menggunakan `/setrole <role>`', ephemeral: true });
    }

    db.setGuildSettings(guildId, { autorole_enabled: isEnable });
    return interaction.reply({ content: `✅ Fitur auto-role berhasil **${isEnable ? 'diaktifkan' : 'dinonaktifkan'}**.` });
  }

  if (commandName === 'setrole') {
    if (!member.permissions.has(PermissionsBitField.Flags.ManageGuild) && !member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: '❌ Anda tidak memiliki izin (Manage Server / Administrator) yang diperlukan untuk menggunakan perintah pengaturan ini.', ephemeral: true });
    }

    const role = options.getRole('role');
    const botMember = interaction.guild.members.me;

    if (botMember && role.position >= botMember.roles.highest.position) {
      return interaction.reply({ content: '⚠️ **Peringatan Izin:** Peran tersebut berada di atas atau sejajar dengan peran tertinggi bot saya. Bot tidak akan bisa membagikannya kecuali posisi peran bot ditarik ke atas.', ephemeral: true });
    }

    db.setGuildSettings(guildId, {
      autorole_role_id: role.id,
      autorole_enabled: true
    });
    return interaction.reply({ content: `✅ Berhasil mengatur auto-role ke peran **${role.name}** dan otomatis mengaktifkan fitur auto-role.` });
  }

  if (commandName === 'setachievement') {
    if (!member.permissions.has(PermissionsBitField.Flags.ManageGuild) && !member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: '❌ Anda tidak memiliki izin (Manage Server / Administrator) yang diperlukan untuk menggunakan perintah pengaturan ini.', ephemeral: true });
    }

    const action = options.getString('aksi');
    
    if (action === 'disable') {
      db.setGuildSettings(guildId, { achievement_channel_id: null });
      return interaction.reply({ content: '✅ Notifikasi pencapaian berhasil dinonaktifkan.' });
    }

    const channel = options.getChannel('channel');
    if (!channel) {
      return interaction.reply({ content: '❌ Anda harus memilih saluran teks ketika mengaktifkan notifikasi pencapaian.', ephemeral: true });
    }

    if (channel.type !== ChannelType.GuildText) {
      return interaction.reply({ content: '❌ Saluran yang dipilih harus berupa saluran teks.', ephemeral: true });
    }

    db.setGuildSettings(guildId, { achievement_channel_id: channel.id });
    return interaction.reply({ content: `✅ Berhasil mengatur saluran notifikasi pencapaian ke <#${channel.id}>.` });
  }

  if (commandName === 'logchannel') {
    if (!member.permissions.has(PermissionsBitField.Flags.ManageGuild) && !member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: '❌ Anda tidak memiliki izin (Manage Server / Administrator) yang diperlukan untuk menggunakan perintah pengaturan ini.', ephemeral: true });
    }

    const categoryInput = options.getString('kategori');
    const channel = options.getChannel('channel');

    if (channel.type !== ChannelType.GuildText) {
      return interaction.reply({ content: '❌ Saluran yang dipilih harus berupa saluran teks.', ephemeral: true });
    }

    const categories = [];
    if (categoryInput === 'voice') categories.push('voice_join_leave', 'voice_mute_deafen');
    else if (categoryInput === 'gaming') categories.push('gaming_activity');
    else if (categoryInput === 'spotify') categories.push('spotify_activity');
    else if (categoryInput === 'mod') categories.push('moderation');
    else if (categoryInput === 'status') categories.push('user_status');
    else categories.push(categoryInput);

    const settings = db.getGuildSettings(guildId);
    const logChannels = JSON.parse(settings.log_channels || '{}');
    categories.forEach(c => logChannels[c] = channel.id);
    db.setGuildSettings(guildId, { log_channels: JSON.stringify(logChannels) });

    return interaction.reply({ content: `✅ Berhasil mengatur saluran log untuk kategori **${categories.join(', ')}** ke <#${channel.id}>.` });
  }

  if (commandName === 'logchannel-reset') {
    if (!member.permissions.has(PermissionsBitField.Flags.ManageGuild) && !member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: '❌ Anda tidak memiliki izin (Manage Server / Administrator) yang diperlukan untuk menggunakan perintah pengaturan ini.', ephemeral: true });
    }

    const categoryInput = options.getString('kategori');
    const categories = [];
    if (categoryInput === 'voice') categories.push('voice_join_leave', 'voice_mute_deafen');
    else if (categoryInput === 'gaming') categories.push('gaming_activity');
    else if (categoryInput === 'spotify') categories.push('spotify_activity');
    else if (categoryInput === 'mod') categories.push('moderation');
    else if (categoryInput === 'status') categories.push('user_status');
    else categories.push(categoryInput);

    const settings = db.getGuildSettings(guildId);
    const logChannels = JSON.parse(settings.log_channels || '{}');
    categories.forEach(c => delete logChannels[c]);
    db.setGuildSettings(guildId, { log_channels: JSON.stringify(logChannels) });

    return interaction.reply({ content: `✅ Berhasil mereset saluran log untuk kategori **${categories.join(', ')}** ke saluran log utama.` });
  }

  if (commandName === 'gitpull') {
    if (!member.permissions.has(PermissionsBitField.Flags.ManageGuild) && !member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: '❌ Anda tidak memiliki izin (Manage Server / Administrator) yang diperlukan untuk menggunakan perintah pengaturan ini.', ephemeral: true });
    }

    await interaction.deferReply();
    const { exec } = require('child_process');
    exec('git reset --hard && git pull', (error, stdout, stderr) => {
      if (error) {
        return interaction.editReply({ content: `❌ **Gagal melakukan git pull:**\n\`\`\`${error.message}\`\`\`` });
      }
      
      let output = '';
      if (stdout) output += `**Stdout:**\n\`\`\`\n${stdout}\n\`\`\n`;
      if (stderr) output += `**Stderr:**\n\`\`\`\n${stderr}\n\`\`\n`;

      interaction.editReply({ content: `✅ **Git pull selesai:**\n${output}\n🔄 *Memulai ulang bot dalam 3 detik untuk menerapkan perubahan...*` });

      setTimeout(() => {
        process.exit(0);
      }, 3000);
    });
  }
});

// Helper function to send log to guild channel
async function sendLog(guildId, category, embed) {
  const settings = db.getGuildSettings(guildId);

  // Resolve category specific channel or fallback to main log channel
  const logChannels = JSON.parse(settings.log_channels || '{}');
  const targetChannelId = logChannels[category] || settings.log_channel_id;

  if (!targetChannelId) return;

  // Check if category is enabled
  const cats = JSON.parse(settings.categories_enabled || '{}');

  // Fallback check for new granular categories to maintain backward compatibility
  if (category === 'voice_join_leave' || category === 'voice_mute_deafen') {
    if (cats[category] === false || (cats[category] === undefined && cats['voice'] === false)) {
      return;
    }
  } else if (category === 'gaming_activity' || category === 'spotify_activity') {
    if (cats[category] === false || (cats[category] === undefined && cats['activity'] === false)) {
      return;
    }
  } else {
    if (cats[category] === false) return;
  }

  try {
    const guild = await client.guilds.fetch(guildId).catch(() => null);
    if (!guild) return;

    const channel = await guild.channels.fetch(targetChannelId).catch(() => null);
    if (!channel || !channel.isTextBased()) return;

    // Apply standard guild theme color if embed has no color
    if (!embed.data.color) {
      const colInt = parseInt(settings.embed_color.replace('#', ''), 16);
      embed.setColor(colInt || 0x6366f1);
    }

    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error(`Gagal mengirim log ke channel ${targetChannelId}:`, error);
  }
}

// Helper function to send achievement unlock notification
async function sendAchievementNotification(guildId, userId, newlyUnlocked) {
  if (!newlyUnlocked || newlyUnlocked.length === 0) return;
  const settings = db.getGuildSettings(guildId);
  const chanId = settings.achievement_channel_id;
  if (!chanId) return;

  try {
    const guild = await client.guilds.fetch(guildId).catch(() => null);
    if (!guild) return;

    const channel = await guild.channels.fetch(chanId).catch(() => null);
    if (!channel || !channel.isTextBased()) return;

    const member = await guild.members.fetch(userId).catch(() => null);
    if (!member) return;

    for (const achievementId of newlyUnlocked) {
      const meta = ACHIEVEMENTS_METADATA[achievementId];
      if (!meta) continue;

      const embed = new EmbedBuilder()
        .setColor(settings.embed_color || '#6366f1')
        .setTitle('🏆 Pencapaian Terbuka')
        .setDescription(`Selamat kepada ${member}! Anda telah membuka pencapaian baru di server ini.`)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: 'Pencapaian', value: `${meta.emoji} **${meta.name}**`, inline: true },
          { name: 'Tantangan', value: meta.desc, inline: true }
        )
        .setTimestamp();

      await channel.send({ embeds: [embed] }).catch(err => console.error('Gagal mengirim notifikasi pencapaian:', err.message));
    }
  } catch (error) {
    console.error('Error saat mengirim notifikasi pencapaian:', error);
  }
}

// Helper to check Allowed & Ignored roles for Reaction Roles
function checkRolePermissions(member, config) {
  const allowed = config.allowed_roles || [];
  const ignored = config.ignored_roles || [];

  if (ignored.length > 0) {
    const hasIgnored = ignored.some(id => member.roles.cache.has(id));
    if (hasIgnored) {
      return { allowed: false, reason: 'Anda memiliki peran yang dilarang untuk mengeklaim role dari Reaction Roles ini.' };
    }
  }

  if (allowed.length > 0) {
    const hasAllowed = allowed.some(id => member.roles.cache.has(id));
    if (!hasAllowed) {
      return { allowed: false, reason: 'Anda tidak memiliki peran yang diizinkan untuk mengeklaim role dari Reaction Roles ini.' };
    }
  }

  return { allowed: true };
}

// Handlers for Reaction Roles Buttons and Dropdowns
async function handleReactionRoleButton(interaction) {
  const parts = interaction.customId.split('_'); // rr, btn, configId, optionIndex
  if (parts.length < 4) return;

  const configId = parts[2];
  const optionIndex = parseInt(parts[3]);
  const guildId = interaction.guildId;

  const configs = db.getReactionRoles(guildId);
  const config = configs.find(c => c.id === configId);
  if (!config) {
    return interaction.reply({ content: 'Konfigurasi Reaction Roles tidak ditemukan.', ephemeral: true });
  }

  const member = interaction.member;

  // Check Allowed & Ignored roles
  const permCheck = checkRolePermissions(member, config);
  if (!permCheck.allowed) {
    return interaction.reply({ content: `❌ Akses Ditolak: ${permCheck.reason}`, ephemeral: true });
  }

  const option = config.options[optionIndex];
  const roleIds = option?.role_ids || (option?.role_id ? [option.role_id] : []);
  if (roleIds.length === 0) {
    return interaction.reply({ content: 'Role untuk tombol ini tidak ditemukan.', ephemeral: true });
  }

  try {
    await interaction.deferReply({ ephemeral: true });

    const guild = interaction.guild;
    const type = config.type || 'Normal';

    // Check if user has the roles (for toggling, we check if they have the first role)
    const hasRole = member.roles.cache.has(roleIds[0]);

    if (type === 'Take') {
      // ONLY REMOVE ROLES
      let removedNames = [];
      for (const id of roleIds) {
        if (member.roles.cache.has(id)) {
          await member.roles.remove(id);
          removedNames.push(guild.roles.cache.get(id)?.name || 'Role');
        }
      }
      if (removedNames.length > 0) {
        await interaction.editReply({ content: `✓ Peran **${removedNames.join(', ')}** telah dihapus dari profil Anda.` });
      } else {
        await interaction.editReply({ content: `Anda tidak memiliki peran terkait untuk dicabut.` });
      }
    } else if (type === 'Give') {
      // ONLY GIVE ROLES
      let addedNames = [];
      for (const id of roleIds) {
        if (!member.roles.cache.has(id)) {
          await member.roles.add(id);
          addedNames.push(guild.roles.cache.get(id)?.name || 'Role');
        }
      }
      if (addedNames.length > 0) {
        await interaction.editReply({ content: `✓ Peran **${addedNames.join(', ')}** telah ditambahkan ke profil Anda.` });
      } else {
        await interaction.editReply({ content: `Anda sudah memiliki peran terkait.` });
      }
    } else {
      // NORMAL OR TOGGLE
      if (hasRole) {
        // REMOVE ROLES
        for (const id of roleIds) {
          if (member.roles.cache.has(id)) await member.roles.remove(id);
        }
        const roleNames = roleIds.map(id => guild.roles.cache.get(id)?.name || 'Role').join(', ');
        await interaction.editReply({ content: `✓ Peran **${roleNames}** telah dihapus dari profil Anda.` });
      } else {
        // ADD ROLES
        // If allow_multiple_roles is false, we should remove roles of other options in this config first!
        if (config.allow_multiple_roles === false) {
          const allOtherOptionRoleIds = [];
          config.options.forEach((opt, idx) => {
            if (idx !== optionIndex) {
              const ids = opt.role_ids || (opt.role_id ? [opt.role_id] : []);
              allOtherOptionRoleIds.push(...ids);
            }
          });
          for (const id of allOtherOptionRoleIds) {
            if (member.roles.cache.has(id)) await member.roles.remove(id);
          }
        }

        for (const id of roleIds) {
          if (!member.roles.cache.has(id)) await member.roles.add(id);
        }
        const roleNames = roleIds.map(id => guild.roles.cache.get(id)?.name || 'Role').join(', ');
        await interaction.editReply({ content: `✓ Peran **${roleNames}** telah ditambahkan ke profil Anda.` });
      }
    }
  } catch (err) {
    console.error('Gagal memproses tombol reaction role:', err);
    await interaction.editReply({ content: '❌ Terjadi kesalahan saat memproses peran Anda. Pastikan role bot berada di atas role tersebut dalam daftar peran server.' });
  }
}

async function handleReactionRoleSelect(interaction) {
  const parts = interaction.customId.split('_'); // rr, select, configId
  if (parts.length < 3) return;

  const configId = parts[2];
  const selectedIndex = parseInt(interaction.values[0]);
  const guildId = interaction.guildId;

  const configs = db.getReactionRoles(guildId);
  const config = configs.find(c => c.id === configId);
  if (!config) {
    return interaction.reply({ content: 'Konfigurasi Reaction Roles tidak ditemukan.', ephemeral: true });
  }

  const member = interaction.member;

  // Check Allowed & Ignored roles
  const permCheck = checkRolePermissions(member, config);
  if (!permCheck.allowed) {
    return interaction.reply({ content: `❌ Akses Ditolak: ${permCheck.reason}`, ephemeral: true });
  }

  const option = config.options[selectedIndex];
  const roleIds = option?.role_ids || (option?.role_id ? [option.role_id] : []);
  if (roleIds.length === 0) {
    return interaction.reply({ content: 'Role untuk opsi ini tidak ditemukan.', ephemeral: true });
  }

  try {
    await interaction.deferReply({ ephemeral: true });

    const guild = interaction.guild;
    const type = config.type || 'Normal';

    if (type === 'Take') {
      // ONLY REMOVE ROLES
      let removedNames = [];
      for (const id of roleIds) {
        if (member.roles.cache.has(id)) {
          await member.roles.remove(id);
          removedNames.push(guild.roles.cache.get(id)?.name || 'Role');
        }
      }
      if (removedNames.length > 0) {
        await interaction.editReply({ content: `✓ Peran **${removedNames.join(', ')}** telah dihapus dari profil Anda.` });
      } else {
        await interaction.editReply({ content: `Anda tidak memiliki peran terkait untuk dicabut.` });
      }
    } else if (type === 'Give') {
      // ONLY GIVE ROLES
      let addedNames = [];
      for (const id of roleIds) {
        if (!member.roles.cache.has(id)) {
          await member.roles.add(id);
          addedNames.push(guild.roles.cache.get(id)?.name || 'Role');
        }
      }
      if (addedNames.length > 0) {
        await interaction.editReply({ content: `✓ Peran **${addedNames.join(', ')}** telah ditambahkan ke profil Anda.` });
      } else {
        await interaction.editReply({ content: `Anda sudah memiliki peran terkait.` });
      }
    } else {
      // NORMAL OR TOGGLE
      // If allow_multiple_roles is false, we strip all other options' roles!
      if (config.allow_multiple_roles === false) {
        const allMenuRoleIds = [];
        config.options.forEach((opt, idx) => {
          if (idx !== selectedIndex) {
            const ids = opt.role_ids || (opt.role_id ? [opt.role_id] : []);
            allMenuRoleIds.push(...ids);
          }
        });

        // Strip other roles
        for (const id of allMenuRoleIds) {
          if (member.roles.cache.has(id)) await member.roles.remove(id);
        }
      }

      // Check if they already have all the selected roles. If yes, we toggle (remove them).
      // Otherwise, we add them.
      const alreadyHasSelected = member.roles.cache.has(roleIds[0]);

      if (alreadyHasSelected) {
        for (const id of roleIds) {
          if (member.roles.cache.has(id)) await member.roles.remove(id);
        }
        const roleNames = roleIds.map(id => guild.roles.cache.get(id)?.name || 'Role').join(', ');
        await interaction.editReply({ content: `✓ Peran **${roleNames}** telah dihapus dari profil Anda.` });
      } else {
        for (const id of roleIds) {
          if (!member.roles.cache.has(id)) await member.roles.add(id);
        }
        const roleNames = roleIds.map(id => guild.roles.cache.get(id)?.name || 'Role').join(', ');
        await interaction.editReply({ content: `✓ Peran **${roleNames}** telah ditambahkan ke profil Anda (dan peran pilihan lain dari menu ini telah diselaraskan jika berlaku).` });
      }
    }
  } catch (err) {
    console.error('Gagal memproses pilihan dropdown reaction role:', err);
    await interaction.editReply({ content: '❌ Terjadi kesalahan saat memproses peran Anda. Pastikan role bot berada di atas role tersebut dalam daftar peran server.' });
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
  sendAchievementNotification,
  ACHIEVEMENTS_METADATA
};
