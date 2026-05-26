const { EmbedBuilder } = require('discord.js');
const { sendLog } = require('../bot');
const db = require('../database');

module.exports = {
  execute(member) {
    const accountAgeDays = Math.floor((Date.now() - member.user.createdTimestamp) / (24 * 60 * 60 * 1000));
    const settings = db.getGuildSettings(member.guild.id);
    
    // Welcome message sending logic
    if (settings.welcome_enabled && settings.welcome_channel_id) {
      const channel = member.guild.channels.cache.get(settings.welcome_channel_id);
      if (channel && channel.isTextBased()) {
        const rawMsg = settings.welcome_message || 'Selamat datang, {user}!';
        const msg = rawMsg.replace(/{user}/g, member.toString());
        channel.send(msg).catch(err => console.error('[Welcome] Gagal mengirim pesan selamat datang:', err.message));
      }
    }

    // Auto-role assignment logic
    if (settings.autorole_enabled && settings.autorole_role_id) {
      member.roles.add(settings.autorole_role_id)
        .catch(err => console.error(`[Auto-Role] Gagal menetapkan peran ${settings.autorole_role_id} ke ${member.user.username}:`, err.message));
    }

    const embed = new EmbedBuilder()
      .setColor('#10b981') // Green
      .setTitle('📥 Anggota Baru Bergabung')
      .setDescription(`${member} telah bergabung ke dalam server.`)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: 'Umur Akun', value: `\`${accountAgeDays} hari\` (Dibuat: <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>)` },
        { name: 'Total Anggota Baru', value: `\`${member.guild.memberCount.toLocaleString()} anggota\``, inline: true }
      )
      .setTimestamp()
      .setFooter({ text: `${member.user.username}: ${member.user.id}` });

    sendLog(member.guild.id, 'member', embed);
  }
};
