const { EmbedBuilder } = require('discord.js');
const { sendLog } = require('../bot');

module.exports = {
  execute(oldMember, newMember) {
    const guildId = newMember.guild.id;
    const embed = new EmbedBuilder()
      .setAuthor({ name: newMember.user.tag, iconURL: newMember.user.displayAvatarURL() })
      .setThumbnail(newMember.user.displayAvatarURL())
      .setTimestamp()
      .setFooter({ text: `${newMember.user.username}: ${newMember.id}` });

    let logged = false;

    // 1. Nickname changed
    if (oldMember.nickname !== newMember.nickname) {
      embed.setColor('#3b82f6') // Blue
        .setDescription(`### **👤 Nickname Berubah**\n${newMember} mengubah nickname mereka`)
        .addFields(
          { name: 'Sebelum', value: oldMember.nickname || '_Tidak ada (Default)_', inline: true },
          { name: 'Sesudah', value: newMember.nickname || '_Tidak ada (Default)_', inline: true }
        );
      logged = true;
    }

    // 2. Roles updated
    const oldRoles = oldMember.roles.cache;
    const newRoles = newMember.roles.cache;

    if (oldRoles.size !== newRoles.size) {
      const addedRoles = newRoles.filter(role => !oldRoles.has(role.id));
      const removedRoles = oldRoles.filter(role => !newRoles.has(role.id));

      if (addedRoles.size > 0) {
        const list = addedRoles.map(r => `${r}`).join(', ');
        embed.setColor('#10b981')
          .setDescription(`### **🛡️ Role Ditambahkan**\n${newMember} mendapatkan role baru`)
          .addFields({ name: 'Role Baru', value: list });
        logged = true;
      }
      
      if (removedRoles.size > 0) {
        const list = removedRoles.map(r => `${r}`).join(', ');
        embed.setColor('#ef4444')
          .setDescription(`### **🛡️ Role Dihapus**\n${newMember} kehilangan role`)
          .addFields({ name: 'Role Dihapus', value: list });
        logged = true;
      }
    }

    if (logged) {
      sendLog(guildId, 'member', embed);
    }
  }
};
