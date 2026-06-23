const db = require('../database');

const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  async execute(message, client) {
    if (!message.guild || message.author.bot) return;

    // --- ADVANCED MODERATION LOGGING SYSTEM ---
    const inviteRegex = /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discord(app)?\.com\/invite)\/[a-zA-Z0-9\-]+/gi;
    const isInvite = inviteRegex.test(message.content);

    const mentionCount = message.mentions.users.size + message.mentions.roles.size;
    const isMassMention = mentionCount > 5;

    const badWords = ['anjing', 'bangsat', 'kontol', 'memek', 'ngentot', 'goblok', 'tolol', 'babi', 'jancok', 'pantek'];
    const containsBadWord = badWords.some(word => message.content.toLowerCase().includes(word));

    if (isInvite || isMassMention || containsBadWord) {
      const { sendLog } = require('../bot');
      
      const modEmbed = new EmbedBuilder()
        .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
        .setTimestamp()
        .setFooter({ text: `${message.author.username}: ${message.author.id} | Saluran: #${message.channel.name}` });

      let logAction = '';
      let logReason = '';

      if (isInvite) {
        logAction = 'DISCORD INVITE';
        logReason = 'Mengirim tautan undangan Discord.';
        modEmbed.setColor('#ef4444') // Red
          .setTitle('⚠️ Tautan Undangan Terdeteksi')
          .setDescription(`Pengguna ${message.author} mengirimkan tautan undangan di saluran ${message.channel}.`)
          .addFields({ name: 'Isi Pesan', value: message.content.substring(0, 1020) });
      } else if (isMassMention) {
        logAction = 'MASS MENTION';
        logReason = `Penyebutan massal (${mentionCount} mention).`;
        modEmbed.setColor('#f59e0b') // Amber
          .setTitle('⚠️ Penyebutan Massal Terdeteksi')
          .setDescription(`Pengguna ${message.author} melakukan penyebutan massal di saluran ${message.channel}.`)
          .addFields(
            { name: 'Jumlah Penyebutan', value: `${mentionCount} kali`, inline: true },
            { name: 'Isi Pesan', value: message.content.substring(0, 1020) }
          );
      } else if (containsBadWord) {
        logAction = 'TOXIC LANGUAGE';
        logReason = 'Menggunakan kata-kata kasar / kotor.';
        modEmbed.setColor('#ef4444') // Red
          .setTitle('⚠️ Bahasa Kasar Terdeteksi')
          .setDescription(`Pengguna ${message.author} terdeteksi menggunakan kata-kata kasar di saluran ${message.channel}.`)
          .addFields(
            { name: 'Isi Pesan', value: message.content.substring(0, 1020) }
          );
      }

      // Send log
      sendLog(message.guild.id, 'moderation', modEmbed);
      
      // Save database log
      db.logModeration(message.guild.id, message.author.id, client.user.id, logAction, logReason);
    }

    const prefix = 'pan!';
    const mentionRegex = new RegExp(`^<@!?${client.user.id}>`);
    const hasPrefix = message.content.startsWith(prefix);
    const hasMention = mentionRegex.test(message.content);

    if (hasPrefix || hasMention) {
      let commandString = '';
      if (hasPrefix) {
        commandString = message.content.slice(prefix.length).trim();
      } else {
        commandString = message.content.replace(mentionRegex, '').trim();
      }

      const args = commandString.split(/ +/);
      const firstArg = args[0] ? args[0].toLowerCase() : '';

      const knownCommands = new Set([
        'stats',
        'leaderboard',
        'achievements',
        'help',
        'status',
        'setlog',
        'setcolor',
        'log',
        'ignore',
        'unignore',
        'setmodel',
        'welcome',
        'setwelcome',
        'welcomemsg',
        'autorole',
        'setrole',
        'setachievement',
        'logchannel',
        'gitpull',
        'join',
        'leave'
      ]);

      const isExplicitAI = (firstArg === 'ask');
      const isKnownCommand = knownCommands.has(firstArg);

      // Route to DeepSeek AI if not a known command or if explicitly calling 'ask'
      if (!isKnownCommand || isExplicitAI) {
        let prompt = '';
        if (isExplicitAI) {
          prompt = commandString.slice(firstArg.length).trim();
        } else {
          prompt = commandString;
        }

        const guildId = message.guild.id;
        const settings = db.getGuildSettings(guildId);
        const aiModel = settings.ai_model || 'deepseek-chat';

        // Check if AI is enabled for this guild
        if (settings.ai_enabled !== true) {
          return message.reply('⚠️ **Fitur AI dinonaktifkan di server ini.**\nPenggunaan AI dibatasi oleh izin khusus untuk menghemat API. Hubungi Administrator server untuk mengaktifkan fitur ini melalui Web Dashboard.');
        }

        // Trigger typing state to indicate the bot is preparing the response (premium UX)
        await message.channel.sendTyping();

        // Loop typing indicator every 8 seconds since standard typing state lasts only ~10s in Discord
        const typingInterval = setInterval(() => {
          message.channel.sendTyping().catch(() => {});
        }, 8000);

        try {
          const { askAI } = require('../utils/ai');
          const aiResponse = await askAI(prompt, aiModel);
          clearInterval(typingInterval);
          return message.reply(aiResponse);
        } catch (error) {
          clearInterval(typingInterval);
          console.error('Error handling AI response:', error);
          if (error.message === 'API_KEY_NOT_CONFIGURED') {
            return message.reply('⚠️ **Maaf, integrasi AI belum dikonfigurasi.** Administrator server harus menambahkan `DEEPSEEK_API_KEY` terlebih dahulu.');
          }
          return message.reply('⚠️ **Maaf, saya sedang mengalami gangguan saat terhubung ke otak AI saya.** Silakan coba beberapa saat lagi!');
        }
      }

      const guildId = message.guild.id;
      const settings = db.getGuildSettings(guildId);

      const commandName = args.shift().toLowerCase();
      const targetUser = message.mentions.users.filter(u => u.id !== client.user.id).first() || message.author;

      if (commandName === 'stats') {
        const { ACHIEVEMENTS_METADATA } = require('../bot');
        const stats = db.getUserStats(guildId, targetUser.id);
        const hrs = Math.round((stats.voice_time / 3600) * 100) / 100;
        
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
          .setFooter({ text: 'Sistem Logger & Analitik Server' })
          .setTimestamp();

        return message.reply({ embeds: [embed] });
      }

      if (commandName === 'leaderboard') {
        const category = args[0] || 'voice';
        if (!['voice', 'messages', 'gaming'].includes(category)) {
          return message.reply('Kategori tidak valid. Silakan gunakan format: `pan!leaderboard voice|messages|gaming`');
        }
        
        const rows = db.getLeaderboard(guildId, category, 10);
        const embed = new EmbedBuilder()
          .setColor(settings.embed_color || '#6366f1')
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

        return message.reply({ embeds: [embed] });
      }

      if (commandName === 'achievements') {
        const { ACHIEVEMENTS_METADATA } = require('../bot');
        const stats = db.getUserStats(guildId, targetUser.id);
        const unlockedSet = new Set(stats.achievements || []);

        const embed = new EmbedBuilder()
          .setColor(settings.embed_color || '#6366f1')
          .setTitle(`🏆 Lencana & Pencapaian Server: ${targetUser.username}`)
          .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
          .setDescription('Selesaikan tantangan server berikut untuk membuka lencana pencapaian eksklusif!')
          .setFooter({ text: 'Aktiflah bermain game, gunakan Voice, dan kirimkan pesan untuk membuka lencana.' })
          .setTimestamp();

        Object.entries(ACHIEVEMENTS_METADATA).forEach(([id, meta]) => {
          const isUnlocked = unlockedSet.has(id);
          const title = `${isUnlocked ? '✅' : '🔒'} ${meta.emoji} ${meta.name}`;
          const desc = `_${meta.desc}_ - **${isUnlocked ? 'TERBUKA' : 'TERKUNCI'}**`;
          embed.addFields({ name: title, value: desc, inline: false });
        });

        return message.reply({ embeds: [embed] });
      }

      if (commandName === 'help') {
        const isHelpAdmin = args[0]?.toLowerCase() === 'admin';

        if (isHelpAdmin) {
          if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild) && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ Anda tidak memiliki izin (Manage Server / Administrator) yang diperlukan untuk melihat menu bantuan admin.');
          }

          const embed = new EmbedBuilder()
            .setColor(settings.embed_color || '#6366f1')
            .setTitle('⚙️ Daftar Command Admin Pandu')
            .setDescription('Berikut adalah daftar command konfigurasi server untuk Administrator:')
            .addFields(
              { name: '🎯 Saluran & Log Utama', value: '`pan!setlog <#channel>` - Mengatur saluran tujuan log utama\n`pan!log <enable|disable> <kategori>` - Mengaktifkan/menonaktifkan kategori log\n*(Kategori: `moderation`, `voice_join_leave`, `voice_mute_deafen`, `member`, `server`, `gaming_activity`, `spotify_activity`, `user_status`)*\n`pan!ignore <#channel>` - Mengabaikan saluran dari pencatatan log/statistik\n`pan!unignore <#channel>` - Menghapus saluran dari daftar abaikan\n`pan!setcolor <hex_code>` - Mengubah warna embed log (contoh: `#ff0000`)' },
              { name: '🤖 Pengaturan AI, Update & Status', value: '`pan!setmodel <faster|thinker>` - Mengubah model AI DeepSeek\n`pan!status` - Memeriksa konfigurasi server saat ini\n`pan!gitpull` - Melakukan git pull dan merestart bot secara otomatis' },
              { name: '📥 Welcome & Pencapaian', value: '`pan!welcome <enable|disable>` - Mengaktifkan/menonaktifkan welcome\n`pan!setwelcome <#channel>` - Mengatur saluran welcome\n`pan!welcomemsg <isi_pesan...>` - Mengatur pesan welcome\n`pan!setachievement <#channel|disable>` - Mengatur saluran notifikasi pencapaian' },
              { name: '🛡️ Pengaturan Auto-Role', value: '`pan!autorole <enable|disable>` - Mengaktifkan/menonaktifkan pemberian peran otomatis\n`pan!setrole <@role|role_id>` - Mengatur peran otomatis bagi anggota baru' },
              { name: '🎯 Granular Log Channels', value: '`pan!logchannel <kategori> <#channel>` - Mengatur log saluran terpisah per kategori\n*(Kategori: `voice`, `gaming`, `spotify`, `mod`, `moderation`, \`voice_join_leave\`, \`voice_mute_deafen\`, `member`, `server`, `gaming_activity`, `spotify_activity`, `status`, `user_status`)*\n`pan!logchannel reset <kategori>` - Mengembalikan kategori log ke saluran utama' }
            )
            .setFooter({ text: 'Sistem Logger & Analitik Server' })
            .setTimestamp();
          return message.reply({ embeds: [embed] });
        } else {
          const embed = new EmbedBuilder()
            .setColor(settings.embed_color || '#6366f1')
            .setTitle('🤖 Daftar Command Pandu')
            .setDescription('Berikut adalah daftar command yang tersedia untuk server ini:')
            .addFields(
              { name: '📊 Statistik & Informasi', value: '`pan!stats [@user]` - Menampilkan statistik pengguna\n`pan!leaderboard [voice|messages|gaming]` - Menampilkan peringkat server\n`pan!achievements [@user]` - Menampilkan lencana pencapaian' },
              { name: '🎙️ Saluran Voice (Streak Helper)', value: '`pan!join` - Bot bergabung ke saluran voice Anda\n`pan!leave` - Bot keluar dari saluran voice' },
              { name: '🧠 Obrolan AI', value: 'Tandai (tag) bot atau gunakan `pan!ask <pertanyaan>` untuk bertanya kepada AI.' }
            )
            .setFooter({ text: 'Gunakan "pan!help admin" jika Anda adalah Administrator untuk konfigurasi bot.' })
            .setTimestamp();
          return message.reply({ embeds: [embed] });
        }
      }

      if (commandName === 'join') {
        const member = message.member;
        const voiceChannel = member?.voice?.channel;
        if (!voiceChannel) {
          return message.reply('❌ Anda harus bergabung ke saluran voice terlebih dahulu agar saya bisa ikut!');
        }
        
        const permissions = voiceChannel.permissionsFor(client.user);
        if (!permissions || !permissions.has(PermissionsBitField.Flags.Connect) || !permissions.has(PermissionsBitField.Flags.Speak)) {
          return message.reply('❌ Saya tidak memiliki izin untuk terhubung atau berbicara di saluran voice tersebut!');
        }

        try {
          const { joinVoiceChannel, getVoiceConnection, VoiceConnectionStatus, VoiceConnectionDisconnectReason, entersState } = require('@discordjs/voice');
          
          const existingConnection = getVoiceConnection(message.guild.id);
          const isNewConnection = !existingConnection;

          const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator,
            selfDeaf: false,
            selfMute: false
          });

          // Save voice channel ID to database
          db.setBotVoiceChannel(message.guild.id, voiceChannel.id);

          if (isNewConnection) {
            connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
              if (newState.reason === VoiceConnectionDisconnectReason.WebSocketClose && newState.closeCode === 4014) {
                try {
                  await Promise.race([
                    entersState(connection, VoiceConnectionStatus.Signalling, 5000),
                    entersState(connection, VoiceConnectionStatus.Connecting, 5000)
                  ]);
                  // Connection is reconnecting or has been moved to a new channel - do nothing
                } catch (error) {
                  // Real disconnect (e.g. kicked by an admin) - clean up connection
                  db.setBotVoiceChannel(message.guild.id, null);
                  connection.destroy();
                }
              } else if (connection.rejoinAttempts < 5) {
                // Standard network drop or disconnect, attempt to rejoin
                await new Promise((resolve) => setTimeout(resolve, (connection.rejoinAttempts + 1) * 5000));
                connection.rejoin();
              } else {
                // Max rejoin attempts exceeded
                db.setBotVoiceChannel(message.guild.id, null);
                connection.destroy();
              }
            });
          }

          return message.reply(`✅ Berhasil bergabung ke saluran voice **${voiceChannel.name}**!`);
        } catch (error) {
          console.error('Gagal bergabung ke voice channel:', error);
          return message.reply('❌ Terjadi kesalahan saat mencoba bergabung ke saluran voice.');
        }
      }

      if (commandName === 'leave') {
        try {
          const { getVoiceConnection } = require('@discordjs/voice');
          const connection = getVoiceConnection(message.guild.id);
          if (!connection) {
            return message.reply('❌ Saya tidak sedang berada di saluran voice apa pun di server ini!');
          }
          // Clear voice channel from database
          db.setBotVoiceChannel(message.guild.id, null);
          connection.destroy();
          return message.reply('✅ Berhasil keluar dari saluran voice.');
        } catch (error) {
          console.error('Gagal keluar dari voice channel:', error);
          return message.reply('❌ Terjadi kesalahan saat mencoba keluar dari saluran voice.');
        }
      }

      // ----------------------------------------------------------------------
      // ADMIN COMMANDS BELOW
      // ----------------------------------------------------------------------
      const isAdminCommand = [
        'setlog', 'log', 'ignore', 'unignore', 'setcolor', 'status', 'setmodel',
        'welcome', 'setwelcome', 'welcomemsg', 'autorole', 'setrole',
        'setachievement', 'logchannel', 'gitpull'
      ].includes(commandName);
      if (isAdminCommand) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild) && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
          return message.reply('❌ Anda tidak memiliki izin (Manage Server / Administrator) yang diperlukan untuk menggunakan perintah pengaturan ini.');
        }
      }

      if (commandName === 'status') {
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
            { name: '📥 Fitur Welcome (Sapaan)', value: welcomeStatus },
            { name: '🏆 Saluran Notifikasi Pencapaian', value: achievementStatus },
            { name: '🛡️ Fitur Auto-Role', value: autoroleStatus },
            { name: '🎯 Granular Log Channels', value: granularStr },
            { name: 'Kategori Log Aktif', value: catStr },
            { name: 'Saluran Diabaikan', value: ignStr }
          )
          .setTimestamp();
        return message.reply({ embeds: [embed] });
      }

      if (commandName === 'setlog') {
        const channel = message.mentions.channels.first();
        if (!channel) return message.reply('❌ Harap tandai (tag) saluran yang ingin digunakan, contoh: `pan!setlog #mod-logs`');
        
        db.setGuildSettings(guildId, { log_channel_id: channel.id });
        return message.reply(`✅ Berhasil mengatur saluran log utama ke ${channel}`);
      }

      if (commandName === 'setcolor') {
        const color = args[0];
        if (!color || !/^#([0-9A-F]{3}){1,2}$/i.test(color)) {
          return message.reply('❌ Harap masukkan kode hex warna yang valid, contoh: `pan!setcolor #ff0000`');
        }
        db.setGuildSettings(guildId, { embed_color: color });
        return message.reply({ embeds: [new EmbedBuilder().setColor(color).setDescription(`✅ Warna embed log berhasil diubah menjadi \`${color}\``)] });
      }

      if (commandName === 'log') {
        const action = args[0]?.toLowerCase();
        let category = args[1]?.toLowerCase();
        if (category === 'status') category = 'user_status';
        const validCats = ['moderation', 'voice_join_leave', 'voice_mute_deafen', 'member', 'server', 'gaming_activity', 'spotify_activity', 'user_status'];
        
        if (!['enable', 'disable'].includes(action) || !validCats.includes(category)) {
          return message.reply(`❌ Format salah. Harap gunakan format:\n\`pan!log <enable|disable> <${validCats.join('|')}>\` (Alias kategori status: \`status\`)`);
        }

        const cats = JSON.parse(settings.categories_enabled || '{}');
        cats[category] = (action === 'enable');
        db.setGuildSettings(guildId, { categories_enabled: JSON.stringify(cats) });
        
        return message.reply(`✅ Kategori log **${category}** berhasil ${action === 'enable' ? 'diaktifkan' : 'dinonaktifkan'}.`);
      }

      if (commandName === 'ignore') {
        const channel = message.mentions.channels.first();
        if (!channel) return message.reply('❌ Harap tandai (tag) saluran yang ingin diabaikan, contoh: `pan!ignore #general`');

        const ign = JSON.parse(settings.ignored_channels || '[]');
        if (!ign.includes(channel.id)) {
          ign.push(channel.id);
          db.setGuildSettings(guildId, { ignored_channels: JSON.stringify(ign) });
        }
        return message.reply(`✅ Saluran ${channel} kini diabaikan dari pencatatan log dan statistik.`);
      }

      if (commandName === 'unignore') {
        const channel = message.mentions.channels.first();
        if (!channel) return message.reply('❌ Harap tandai (tag) saluran, contoh: `pan!unignore #general`');

        let ign = JSON.parse(settings.ignored_channels || '[]');
        ign = ign.filter(id => id !== channel.id);
        db.setGuildSettings(guildId, { ignored_channels: JSON.stringify(ign) });
        
        return message.reply(`✅ Saluran ${channel} tidak lagi diabaikan.`);
      }

      if (commandName === 'setmodel') {
        const modelArg = args[0]?.toLowerCase();
        if (!modelArg || !['faster', 'chat', 'thinker', 'reasoner'].includes(modelArg)) {
          return message.reply('❌ Format salah. Harap gunakan format:\n`pan!setmodel <faster|thinker>` atau `pan!setmodel <chat|reasoner>`');
        }

        const modelValue = ['faster', 'chat'].includes(modelArg) ? 'deepseek-chat' : 'deepseek-reasoner';
        db.setGuildSettings(guildId, { ai_model: modelValue });

        const modelName = modelValue === 'deepseek-reasoner' ? 'Pemikir (deepseek-reasoner) 🧠' : 'Tercepat (deepseek-chat) ⚡';
        return message.reply(`✅ Berhasil mengatur model otak AI server ini ke **${modelName}**.`);
      }

      if (commandName === 'welcome') {
        const action = args[0]?.toLowerCase();
        if (!['enable', 'disable'].includes(action)) {
          return message.reply('❌ Format salah. Harap gunakan format: `pan!welcome <enable|disable>`');
        }

        const isEnable = action === 'enable';
        if (isEnable && !settings.welcome_channel_id) {
          return message.reply('⚠️ Anda belum mengatur saluran sapaan welcome. Harap atur terlebih dahulu menggunakan `pan!setwelcome <#channel>`');
        }

        db.setGuildSettings(guildId, { welcome_enabled: isEnable });
        return message.reply(`✅ Fitur pesan selamat datang berhasil **${isEnable ? 'diaktifkan' : 'dinonaktifkan'}**.`);
      }

      if (commandName === 'setwelcome') {
        const channel = message.mentions.channels.first();
        if (!channel) {
          return message.reply('❌ Format salah. Harap tag saluran welcome, contoh: `pan!setwelcome #welcome-channel`');
        }

        db.setGuildSettings(guildId, {
          welcome_channel_id: channel.id,
          welcome_enabled: true
        });
        return message.reply(`✅ Berhasil mengatur saluran welcome ke ${channel} dan otomatis mengaktifkan fitur welcome.`);
      }

      if (commandName === 'welcomemsg') {
        const welcomeText = args.join(' ');
        if (!welcomeText) {
          return message.reply(`ℹ️ Pesan welcome saat ini:\n\`${settings.welcome_message || 'Selamat datang, {user}!'}\`\n\nUntuk mengubahnya, ketik: \`pan!welcomemsg <pesan baru>\` (Gunakan \`{user}\` sebagai placeholder mention user).`);
        }

        db.setGuildSettings(guildId, { welcome_message: welcomeText });
        return message.reply(`✅ Pesan welcome berhasil diubah menjadi:\n\`${welcomeText}\``);
      }

      if (commandName === 'autorole') {
        const action = args[0]?.toLowerCase();
        if (!['enable', 'disable'].includes(action)) {
          return message.reply('❌ Format salah. Harap gunakan format: `pan!autorole <enable|disable>`');
        }

        const isEnable = action === 'enable';
        if (isEnable && !settings.autorole_role_id) {
          return message.reply('⚠️ Anda belum mengatur peran untuk auto-role. Harap atur terlebih dahulu menggunakan `pan!setrole <@role>`');
        }

        db.setGuildSettings(guildId, { autorole_enabled: isEnable });
        return message.reply(`✅ Fitur auto-role berhasil **${isEnable ? 'diaktifkan' : 'dinonaktifkan'}**.`);
      }

      if (commandName === 'setrole') {
        const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
        if (!role) {
          return message.reply('❌ Format salah. Harap tag peran atau masukkan ID peran yang valid, contoh:\n`pan!setrole @Member` atau `pan!setrole 123456789012345`');
        }

        const botMember = message.guild.members.me;
        if (botMember && role.position >= botMember.roles.highest.position) {
          return message.reply('⚠️ **Peringatan Izin:** Peran tersebut berada di atas atau sejajar dengan peran tertinggi bot saya. Bot tidak akan bisa membagikannya kecuali posisi peran bot ditarik ke atas.');
        }

        db.setGuildSettings(guildId, {
          autorole_role_id: role.id,
          autorole_enabled: true
        });
        return message.reply(`✅ Berhasil mengatur auto-role ke peran **${role.name}** dan otomatis mengaktifkan fitur auto-role.`);
      }

      if (commandName === 'setachievement') {
        const action = args[0]?.toLowerCase();
        if (action === 'disable') {
          db.setGuildSettings(guildId, { achievement_channel_id: null });
          return message.reply('✅ Notifikasi pencapaian berhasil dinonaktifkan.');
        }

        const channel = message.mentions.channels.first();
        if (!channel) {
          return message.reply('❌ Format salah. Harap tag saluran atau ketik `disable`, contoh:\n`pan!setachievement #pencapaian` atau `pan!setachievement disable`');
        }

        db.setGuildSettings(guildId, { achievement_channel_id: channel.id });
        return message.reply(`✅ Berhasil mengatur saluran notifikasi pencapaian ke ${channel}.`);
      }

      if (commandName === 'logchannel') {
        const subCommand = args[0]?.toLowerCase();
        
        if (subCommand === 'reset') {
          const categoryInput = args[1]?.toLowerCase();
          if (!categoryInput) {
            return message.reply('❌ Format salah. Harap ketik kategori yang ingin direset, contoh: `pan!logchannel reset voice`');
          }

          const categories = [];
          if (categoryInput === 'voice') categories.push('voice_join_leave', 'voice_mute_deafen');
          else if (categoryInput === 'gaming') categories.push('gaming_activity');
          else if (categoryInput === 'spotify') categories.push('spotify_activity');
          else if (categoryInput === 'mod') categories.push('moderation');
          else if (categoryInput === 'status') categories.push('user_status');
          else categories.push(categoryInput);

          const validCats = ['moderation', 'voice_join_leave', 'voice_mute_deafen', 'member', 'server', 'gaming_activity', 'spotify_activity', 'user_status'];
          const filtered = categories.filter(c => validCats.includes(c));
          
          if (filtered.length === 0) {
            return message.reply(`❌ Kategori tidak valid. Pilihan kategori:\n\`moderation\`, \`voice_join_leave\`, \`voice_mute_deafen\`, \`member\`, \`server\`, \`gaming_activity\`, \`spotify_activity\`, \`user_status\` (Alias: \`mod\`, \`voice\`, \`gaming\`, \`spotify\`, \`status\`)`);
          }

          const logChannels = JSON.parse(settings.log_channels || '{}');
          filtered.forEach(c => delete logChannels[c]);
          db.setGuildSettings(guildId, { log_channels: JSON.stringify(logChannels) });

          return message.reply(`✅ Berhasil mereset saluran log untuk kategori **${filtered.join(', ')}** ke saluran log utama.`);
        }

        const categoryInput = subCommand;
        const channel = message.mentions.channels.first();

        if (!categoryInput || !channel) {
          return message.reply('❌ Format salah. Harap gunakan format:\n`pan!logchannel <kategori> <#channel>` atau `pan!logchannel reset <kategori>`');
        }

        const categories = [];
        if (categoryInput === 'voice') categories.push('voice_join_leave', 'voice_mute_deafen');
        else if (categoryInput === 'gaming') categories.push('gaming_activity');
        else if (categoryInput === 'spotify') categories.push('spotify_activity');
        else if (categoryInput === 'mod') categories.push('moderation');
        else if (categoryInput === 'status') categories.push('user_status');
        else categories.push(categoryInput);

        const validCats = ['moderation', 'voice_join_leave', 'voice_mute_deafen', 'member', 'server', 'gaming_activity', 'spotify_activity', 'user_status'];
        const filtered = categories.filter(c => validCats.includes(c));

        if (filtered.length === 0) {
          return message.reply(`❌ Kategori tidak valid. Pilihan kategori:\n\`moderation\`, \`voice_join_leave\`, \`voice_mute_deafen\`, \`member\`, \`server\`, \`gaming_activity\`, \`spotify_activity\`, \`user_status\` (Alias: \`mod\`, \`voice\`, \`gaming\`, \`spotify\`, \`status\`)`);
        }

        const logChannels = JSON.parse(settings.log_channels || '{}');
        filtered.forEach(c => logChannels[c] = channel.id);
        db.setGuildSettings(guildId, { log_channels: JSON.stringify(logChannels) });

        return message.reply(`✅ Berhasil mengatur saluran log untuk kategori **${filtered.join(', ')}** ke ${channel}.`);
      }

      if (commandName === 'gitpull') {
        const { exec } = require('child_process');
        message.channel.send('⏳ *Menjalankan git reset & git pull...*');
        
        exec('git reset --hard && git pull', (error, stdout, stderr) => {
          if (error) {
            return message.reply(`❌ **Gagal melakukan git pull:**\n\`\`\`${error.message}\`\`\``);
          }
          
          let output = '';
          if (stdout) output += `**Stdout:**\n\`\`\`\n${stdout}\n\`\`\`\n`;
          if (stderr) output += `**Stderr:**\n\`\`\`\n${stderr}\n\`\`\`\n`;

          message.reply(`✅ **Git pull selesai:**\n${output}\n🔄 *Memulai ulang bot dalam 3 detik untuk menerapkan perubahan...*`);

          setTimeout(() => {
            process.exit(0);
          }, 3000);
        });
      }
    }
    
    // Check if channel is ignored
    const settings = db.getGuildSettings(message.guild.id);
    const ignored = JSON.parse(settings.ignored_channels || '[]');
    if (ignored.includes(message.channel.id)) return;

    const newlyUnlocked = db.addMessageCount(message.guild.id, message.author.id);
    if (newlyUnlocked && newlyUnlocked.length > 0) {
      const { sendAchievementNotification } = require('../bot');
      sendAchievementNotification(message.guild.id, message.author.id, newlyUnlocked);
    }
  }
};
