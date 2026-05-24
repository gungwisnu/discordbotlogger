const db = require('../database');

const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  async execute(message, client) {
    if (!message.guild || message.author.bot) return;

    const prefix = 'pan!';
    if (message.content.startsWith(prefix)) {
      const args = message.content.slice(prefix.length).trim().split(/ +/);
      const commandName = args.shift().toLowerCase();

      const guildId = message.guild.id;
      const targetUser = message.mentions.users.first() || message.author;
      const settings = db.getGuildSettings(guildId);

      if (commandName === 'stats') {
        const { ACHIEVEMENTS_METADATA } = require('../bot');
        const stats = db.getUserStats(guildId, targetUser.id);
        const hrs = Math.round((stats.voice_time / 3600) * 100) / 100;
        
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
          .setFooter({ text: 'Dibuat dengan ❤️ oleh Logging & Analytics System' })
          .setTimestamp();

        return message.reply({ embeds: [embed] });
      }

      if (commandName === 'leaderboard') {
        const category = args[0] || 'voice';
        if (!['voice', 'messages', 'gaming'].includes(category)) {
          return message.reply('Kategori tidak valid! Gunakan: `pan!leaderboard voice|messages|gaming`');
        }
        
        const rows = db.getLeaderboard(guildId, category, 10);
        const embed = new EmbedBuilder()
          .setColor(settings.embed_color || '#6366f1')
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

        return message.reply({ embeds: [embed] });
      }

      if (commandName === 'achievements') {
        const { ACHIEVEMENTS_METADATA } = require('../bot');
        const stats = db.getUserStats(guildId, targetUser.id);
        const unlockedSet = new Set(stats.achievements || []);

        const embed = new EmbedBuilder()
          .setColor(settings.embed_color || '#6366f1')
          .setTitle(`🏆 Server Badges & Achievements: ${targetUser.username}`)
          .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
          .setDescription('Selesaikan tantangan server berikut untuk membuka lencana khusus!')
          .setFooter({ text: 'Mainkan game, nongkrong VC, dan ngobrol aktif untuk membuka lencana.' })
          .setTimestamp();

        Object.entries(ACHIEVEMENTS_METADATA).forEach(([id, meta]) => {
          const isUnlocked = unlockedSet.has(id);
          const title = `${isUnlocked ? '✅' : '🔒'} ${meta.emoji} ${meta.name}`;
          const desc = `_${meta.desc}_ - **${isUnlocked ? 'DIBUKA' : 'TERKUNCI'}**`;
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
            { name: '📊 Statistik & Info', value: '`pan!stats [@user]` - Lihat statistik user\n`pan!leaderboard [voice|messages|gaming]` - Lihat peringkat server\n`pan!achievements [@user]` - Lihat lencana/badges' },
            { name: '⚙️ Admin Configuration', value: '`pan!setlog <#channel>` - Atur channel tujuan log\n`pan!log <enable|disable> <moderation|voice|member|server|activity>` - Nyalakan/Matikan tipe log\n`pan!ignore <#channel>` - Abaikan channel dari statistik/log\n`pan!unignore <#channel>` - Hapus dari daftar abaikan\n`pan!setcolor <hex_code>` - Ubah warna embed log (contoh: `#ff0000`)\n`pan!status` - Cek konfigurasi server saat ini' }
          )
          .setFooter({ text: 'Dibuat dengan ❤️ oleh Logging System' })
          .setTimestamp();
        return message.reply({ embeds: [embed] });
      }

      // ----------------------------------------------------------------------
      // ADMIN COMMANDS BELOW
      // ----------------------------------------------------------------------
      const isAdminCommand = ['setlog', 'log', 'ignore', 'unignore', 'setcolor', 'status'].includes(commandName);
      if (isAdminCommand) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild) && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
          return message.reply('❌ Kamu tidak memiliki izin (Manage Server / Administrator) untuk menggunakan command pengaturan ini.');
        }
      }

      if (commandName === 'status') {
        const cats = JSON.parse(settings.categories_enabled || '{}');
        const ign = JSON.parse(settings.ignored_channels || '[]');
        
        const catStr = Object.entries(cats).map(([k, v]) => `• **${k}**: ${v ? '✅ Aktif' : '❌ Mati'}`).join('\n') || 'Belum ada pengaturan spesifik (default: semua aktif)';
        const ignStr = ign.map(id => `<#${id}>`).join(', ') || 'Tidak ada';

        const embed = new EmbedBuilder()
          .setColor(settings.embed_color || '#6366f1')
          .setTitle('⚙️ Konfigurasi Server Log')
          .addFields(
            { name: 'Log Channel', value: settings.log_channel_id ? `<#${settings.log_channel_id}>` : 'Belum diatur' },
            { name: 'Warna Embed', value: `\`${settings.embed_color || '#6366f1'}\`` },
            { name: 'Kategori Log', value: catStr },
            { name: 'Channel Diabaikan', value: ignStr }
          )
          .setTimestamp();
        return message.reply({ embeds: [embed] });
      }

      if (commandName === 'setlog') {
        const channel = message.mentions.channels.first();
        if (!channel) return message.reply('❌ Harap tag channel yang ingin digunakan, contoh: `pan!setlog #mod-logs`');
        
        db.setGuildSettings(guildId, { log_channel_id: channel.id });
        return message.reply(`✅ Berhasil mengatur log channel ke ${channel}`);
      }

      if (commandName === 'setcolor') {
        const color = args[0];
        if (!color || !/^#([0-9A-F]{3}){1,2}$/i.test(color)) {
          return message.reply('❌ Harap masukkan kode hex warna yang valid, contoh: `pan!setcolor #ff0000`');
        }
        db.setGuildSettings(guildId, { embed_color: color });
        return message.reply({ embeds: [new EmbedBuilder().setColor(color).setDescription(`✅ Warna embed log diubah ke \`${color}\``)] });
      }

      if (commandName === 'log') {
        const action = args[0]?.toLowerCase();
        const category = args[1]?.toLowerCase();
        const validCats = ['moderation', 'voice', 'member', 'server', 'activity'];
        
        if (!['enable', 'disable'].includes(action) || !validCats.includes(category)) {
          return message.reply(`❌ Format salah! Gunakan:\n\`pan!log <enable|disable> <${validCats.join('|')}>\``);
        }

        const cats = JSON.parse(settings.categories_enabled || '{}');
        cats[category] = (action === 'enable');
        db.setGuildSettings(guildId, { categories_enabled: JSON.stringify(cats) });
        
        return message.reply(`✅ Log kategori **${category}** berhasil di-${action === 'enable' ? 'aktifkan' : 'matikan'}.`);
      }

      if (commandName === 'ignore') {
        const channel = message.mentions.channels.first();
        if (!channel) return message.reply('❌ Harap tag channel yang ingin diabaikan, contoh: `pan!ignore #general`');

        const ign = JSON.parse(settings.ignored_channels || '[]');
        if (!ign.includes(channel.id)) {
          ign.push(channel.id);
          db.setGuildSettings(guildId, { ignored_channels: JSON.stringify(ign) });
        }
        return message.reply(`✅ Channel ${channel} sekarang diabaikan dari log & statistik.`);
      }

      if (commandName === 'unignore') {
        const channel = message.mentions.channels.first();
        if (!channel) return message.reply('❌ Harap tag channel, contoh: `pan!unignore #general`');

        let ign = JSON.parse(settings.ignored_channels || '[]');
        ign = ign.filter(id => id !== channel.id);
        db.setGuildSettings(guildId, { ignored_channels: JSON.stringify(ign) });
        
        return message.reply(`✅ Channel ${channel} tidak lagi diabaikan.`);
      }
    }
    
    // Check if channel is ignored
    const settings = db.getGuildSettings(message.guild.id);
    const ignored = JSON.parse(settings.ignored_channels || '[]');
    if (ignored.includes(message.channel.id)) return;

    db.addMessageCount(message.guild.id, message.author.id);
  }
};
