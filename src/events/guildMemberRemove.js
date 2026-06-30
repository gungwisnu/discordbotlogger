const { EmbedBuilder } = require('discord.js');
const { sendLog } = require('../bot');
const db = require('../database');
const { t } = require('../utils/lang');

module.exports = {
  execute(member) {
    const settings = db.getGuildSettings(member.guild.id);
    const lang = settings.language || 'id';

    const noneText = lang === 'id' ? '_Tidak diketahui_' : '_Unknown_';
    const joinedAt = member.joinedTimestamp ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : noneText;
    
    const embed = new EmbedBuilder()
      .setColor('#f43f5e') // Red
      .setTitle(t(lang, 'mem_rem_title'))
      .setDescription(t(lang, 'mem_rem_desc', `${member}`))
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: t(lang, 'mem_rem_joined'), value: joinedAt },
        { name: t(lang, 'mem_rem_total'), value: `\`${t(lang, 'mem_rem_total_val', member.guild.memberCount.toLocaleString())}\``, inline: true }
      )
      .setTimestamp();

    sendLog(member.guild.id, 'member', embed);
  }
};
