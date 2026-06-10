const { EmbedBuilder } = require('discord.js');
const { sendLog } = require('../bot');

module.exports = {
  async execute(oldMember, newMember) {
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
        .setTitle('👤 Nama Panggilan Berubah')
        .setDescription(`Nama panggilan ${newMember} telah diperbarui di server.`)
        .addFields(
          { name: 'Sebelum', value: oldMember.nickname || '_Tidak ada (Bawaan)_', inline: true },
          { name: 'Sesudah', value: newMember.nickname || '_Tidak ada (Bawaan)_', inline: true }
        );
      logged = true;
    }

    // 2. Roles updated
    const oldRoles = oldMember.roles.cache;
    const newRoles = newMember.roles.cache;

    if (oldRoles.size !== newRoles.size) {
      const addedRoles = newRoles.filter(role => !oldRoles.has(role.id));
      const removedRoles = oldRoles.filter(role => !newRoles.has(role.id));

      const { AuditLogEvent } = require('discord.js');
      let executorText = 'Tidak diketahui / Sistem';
      try {
        const auditLogs = await newMember.guild.fetchAuditLogs({
          limit: 1,
          type: AuditLogEvent.MemberRoleUpdate,
        });
        const entry = auditLogs.entries.first();
        if (entry && entry.target.id === newMember.id && (Date.now() - entry.createdTimestamp) < 10000) {
          executorText = `${entry.executor}`;
        }
      } catch (error) {
        console.error('Gagal mengambil audit log untuk perubahan peran:', error);
      }

      if (addedRoles.size > 0) {
        const list = addedRoles.map(r => `${r}`).join(', ');
        embed.setColor('#10b981')
          .setTitle('🛡️ Peran Ditambahkan')
          .setDescription(`${newMember} mendapatkan peran baru.`)
          .addFields(
            { name: 'Peran Baru', value: list, inline: true },
            { name: 'Diberikan Oleh', value: executorText, inline: true }
          );
        logged = true;
      }
      
      if (removedRoles.size > 0) {
        const list = removedRoles.map(r => `${r}`).join(', ');
        embed.setColor('#ef4444')
          .setTitle('🛡️ Peran Dihapus')
          .setDescription(`${newMember} kehilangan peran.`)
          .addFields(
            { name: 'Peran Dihapus', value: list, inline: true },
            { name: 'Dicabut Oleh', value: executorText, inline: true }
          );
        logged = true;
      }
    }

    if (logged) {
      sendLog(guildId, 'member', embed);
    }
  }
};
