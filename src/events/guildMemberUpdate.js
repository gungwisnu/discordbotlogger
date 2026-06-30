const { EmbedBuilder } = require('discord.js');
const { sendLog } = require('../bot');
const db = require('../database');
const { t } = require('../utils/lang');

module.exports = {
  async execute(oldMember, newMember) {
    const guildId = newMember.guild.id;
    const settings = db.getGuildSettings(guildId);
    const lang = settings.language || 'id';

    const embed = new EmbedBuilder()
      .setAuthor({ name: newMember.user.tag, iconURL: newMember.user.displayAvatarURL() })
      .setThumbnail(newMember.user.displayAvatarURL())
      .setTimestamp();

    let logged = false;

    // 1. Nickname changed
    if (oldMember.nickname !== newMember.nickname) {
      const noneNick = lang === 'id' ? '_Tidak ada (Bawaan)_' : '_None (Default)_';
      embed.setColor('#3b82f6') // Blue
        .setTitle(t(lang, 'mem_update_nick_title'))
        .setDescription(t(lang, 'mem_update_nick_desc', `${newMember}`))
        .addFields(
          { name: t(lang, 'voice_before'), value: oldMember.nickname || noneNick, inline: true },
          { name: t(lang, 'voice_after'), value: newMember.nickname || noneNick, inline: true }
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
      let executorText = lang === 'id' ? 'Tidak diketahui / Sistem' : 'Unknown / System';
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
          .setTitle(t(lang, 'mem_update_role_add_title'))
          .setDescription(t(lang, 'mem_update_role_add_desc', `${newMember}`))
          .addFields(
            { name: t(lang, 'mem_update_role_field'), value: list, inline: true },
            { name: t(lang, 'mem_update_by_field'), value: executorText, inline: true }
          );
        logged = true;
      }
      
      if (removedRoles.size > 0) {
        const list = removedRoles.map(r => `${r}`).join(', ');
        embed.setColor('#ef4444')
          .setTitle(t(lang, 'mem_update_role_rem_title'))
          .setDescription(t(lang, 'mem_update_role_rem_desc', `${newMember}`))
          .addFields(
            { name: t(lang, 'mem_update_role_field'), value: list, inline: true },
            { name: t(lang, 'mem_update_by_field'), value: executorText, inline: true }
          );
        logged = true;
      }
    }

    if (logged) {
      sendLog(guildId, 'member', embed);
    }
  }
};
