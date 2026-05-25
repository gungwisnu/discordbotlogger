const db = require('../database');

const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  async execute(message, client) {
    if (!message.guild || message.author.bot) return;

    const prefix = 'pan!';
    const mentionRegex = new RegExp(`^<@!?${client.user.id}>`);
    const hasPrefix = message.content.startsWith(prefix);
    const hasMention = mentionRegex.test(message.content);

    if (hasPrefix || hasMention) {
      let args;
      if (hasPrefix) {
        args = message.content.slice(prefix.length).trim().split(/ +/);
      } else {
        args = message.content.replace(mentionRegex, '').trim().split(/ +/);
      }

      const guildId = message.guild.id;
      const settings = db.getGuildSettings(guildId);

      // Welcome introduction if bot is tagged with no commands
      if (hasMention && (args.length === 0 || args[0] === '')) {
        const introEmbed = new EmbedBuilder()
          .setColor(settings.embed_color || '#6366f1')
          .setTitle('👋 Halo! Saya adalah Sistem Logger & Analitik Server')
          .setDescription('Saya dirancang khusus untuk memantau aktivitas server Anda secara terperinci, melacak durasi aktivitas Voice, mencatat waktu bermain game, serta merekam tindakan moderasi demi keamanan server.')
          .addFields(
            {
              name: '📋 Kategori Pemantauan Utama',
              value: '• **Log Voice**: Sesi bergabung, keluar, mute/deafen, kamera, dan berbagi layar secara real-time.\n• **Log Aktivitas**: Deteksi bermain game dan integrasi lagu Spotify secara real-time.\n• **Log Profil Anggota**: Perubahan nama panggilan (nickname), peran (role), bergabung, dan keluar server.\n• **Log Moderasi & Keamanan**: Rekaman tindakan ban, kick, timeout, pesan dihapus, dan pesan diedit.'
            },
            {
              name: '🛠️ Perintah Utama (Gunakan prefix `pan!` atau tag saya)',
              value: '• `pan!stats` atau `@Bot stats` - Menampilkan statistik aktivitas Anda.\n• `pan!leaderboard` atau `@Bot leaderboard` - Menampilkan peringkat teraktif server.\n• `pan!achievements` or `@Bot achievements` - Memeriksa lencana pencapaian Anda.\n• `pan!help` atau `@Bot help` - Menampilkan panduan konfigurasi administrator secara lengkap.'
            },
            {
              name: '💡 Butuh Bantuan Lebih Lanjut?',
              value: 'Silakan ketik perintah `pan!help` atau kunjungi dasbor web premium kami untuk mengonfigurasi saluran log secara praktis.'
            }
          )
          .setFooter({ text: 'Sistem Logger & Analitik Server', iconURL: client.user.displayAvatarURL() })
          .setTimestamp();

        return message.reply({ embeds: [introEmbed] });
      }

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
        const embed = new EmbedBuilder()
          .setColor(settings.embed_color || '#6366f1')
          .setTitle('🤖 Daftar Command PanBot')
          .setDescription('Berikut adalah daftar command yang tersedia untuk server ini:')
          .addFields(
            { name: '📊 Statistik & Informasi', value: '`pan!stats [@user]` - Menampilkan statistik pengguna\n`pan!leaderboard [voice|messages|gaming]` - Menampilkan peringkat server\n`pan!achievements [@user]` - Menampilkan lencana pencapaian' },
            { name: '⚙️ Konfigurasi Admin', value: '`pan!setlog <#channel>` - Mengatur saluran tujuan log\n`pan!log <enable|disable> <kategori>` - Mengaktifkan atau menonaktifkan kategori log\n`pan!ignore <#channel>` - Mengabaikan saluran dari pencatatan log/statistik\n`pan!unignore <#channel>` - Menghapus saluran dari daftar abaikan\n`pan!setcolor <hex_code>` - Mengubah warna embed log (contoh: `#ff0000`)\n`pan!status` - Memeriksa konfigurasi server saat ini' }
          )
          .setFooter({ text: 'Sistem Logger & Analitik Server' })
          .setTimestamp();
        return message.reply({ embeds: [embed] });
      }

      // ----------------------------------------------------------------------
      // ADMIN COMMANDS BELOW
      // ----------------------------------------------------------------------
      const isAdminCommand = ['setlog', 'log', 'ignore', 'unignore', 'setcolor', 'status'].includes(commandName);
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

        const embed = new EmbedBuilder()
          .setColor(settings.embed_color || '#6366f1')
          .setTitle('⚙️ Konfigurasi Log Server')
          .addFields(
            { name: 'Saluran Log', value: settings.log_channel_id ? `<#${settings.log_channel_id}>` : 'Belum diatur' },
            { name: 'Warna Embed', value: `\`${settings.embed_color || '#6366f1'}\`` },
            { name: 'Kategori Log', value: catStr },
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
        const category = args[1]?.toLowerCase();
        const validCats = ['moderation', 'voice_join_leave', 'voice_mute_deafen', 'member', 'server', 'gaming_activity', 'spotify_activity'];
        
        if (!['enable', 'disable'].includes(action) || !validCats.includes(category)) {
          return message.reply(`❌ Format salah. Harap gunakan format:\n\`pan!log <enable|disable> <${validCats.join('|')}>\``);
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
    }
    
    // Check if channel is ignored
    const settings = db.getGuildSettings(message.guild.id);
    const ignored = JSON.parse(settings.ignored_channels || '[]');
    if (ignored.includes(message.channel.id)) return;

    db.addMessageCount(message.guild.id, message.author.id);
  }
};
