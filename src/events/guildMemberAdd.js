const { EmbedBuilder } = require('discord.js');
const { sendLog } = require('../bot');

module.exports = {
  execute(member) {
    const accountAgeDays = Math.floor((Date.now() - member.user.createdTimestamp) / (24 * 60 * 60 * 1000));
    
    const embed = new EmbedBuilder()
      .setColor('#10b981') // Green
      .setDescription(`### **📥 Member Join Server**\n${member} bergabung ke server`)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: 'Umur Akun', value: `\`${accountAgeDays} Hari\` (Dibuat: <t:${Math.floor(member.user.createdTimestamp / 1000)}:R>)` },
        { name: 'Total Member Baru', value: `\`${member.guild.memberCount.toLocaleString()} member\``, inline: true }
      )
      .setTimestamp()
      .setFooter({ text: `${member.user.username}: ${member.user.id}` });

    sendLog(member.guild.id, 'member', embed);
  }
};
