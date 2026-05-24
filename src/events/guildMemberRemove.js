const { EmbedBuilder } = require('discord.js');
const { sendLog } = require('../bot');

module.exports = {
  execute(member) {
    const joinedAt = member.joinedTimestamp ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : '_Tidak diketahui_';
    
    const embed = new EmbedBuilder()
      .setColor('#f43f5e') // Red
      .setDescription(`### **📤 Member Keluar Server**\n${member} keluar dari server`)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: 'Bergabung Sejak', value: joinedAt },
        { name: 'Total Member Sisa', value: `\`${member.guild.memberCount.toLocaleString()} member\``, inline: true }
      )
      .setTimestamp()
      .setFooter({ text: `${member.user.username}: ${member.user.id}` });

    sendLog(member.guild.id, 'member', embed);
  }
};
