const { EmbedBuilder } = require('discord.js');
const { sendLog } = require('../bot');

module.exports = {
  execute(member) {
    const accountAgeDays = Math.floor((Date.now() - member.user.createdTimestamp) / (24 * 60 * 60 * 1000));
    
    const embed = new EmbedBuilder()
      .setColor('#10b981') // Green
      .setDescription(`### **📥 Anggota Baru Bergabung**\n${member} telah bergabung ke dalam server.`)
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
