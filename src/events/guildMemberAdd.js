const { EmbedBuilder } = require('discord.js');
const { sendLog } = require('../bot');
const db = require('../database');
const { t } = require('../utils/lang');

module.exports = {
  execute(member) {
    const accountAgeDays = Math.floor((Date.now() - member.user.createdTimestamp) / (24 * 60 * 60 * 1000));
    const settings = db.getGuildSettings(member.guild.id);
    const lang = settings.language || 'id';
    
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
      .setTitle(t(lang, 'mem_add_title'))
      .setDescription(t(lang, 'mem_add_desc', `${member}`))
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: t(lang, 'mem_add_age'), value: `\`${t(lang, 'mem_add_age_val', accountAgeDays)}\` (<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>)` },
        { name: t(lang, 'mem_add_total'), value: `\`${t(lang, 'mem_add_total_val', member.guild.memberCount.toLocaleString())}\``, inline: true }
      )
      .setTimestamp();

    sendLog(member.guild.id, 'member', embed);
  }
};
