const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const { sendLog } = require('../bot');
const db = require('../database');
const { t } = require('../utils/lang');

module.exports = {
  async execute(messages) {
    const firstMsg = messages.first();
    if (!firstMsg || !firstMsg.guild) return;

    const guildId = firstMsg.guild.id;

    // Check if channel is ignored
    const settings = db.getGuildSettings(guildId);
    const ignored = JSON.parse(settings.ignored_channels || '[]');
    if (ignored.includes(firstMsg.channel.id)) return;

    const lang = settings.language || 'id';

    const embed = new EmbedBuilder()
      .setColor('#ef4444') // Solid Red
      .setTitle(t(lang, 'msg_bulk_title'))
      .setDescription(t(lang, 'msg_bulk_desc', messages.size, `${firstMsg.channel}`))
      .setTimestamp();

    // Attempt to fetch who purged from Audit Logs
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const fetchedLogs = await firstMsg.guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.MessageBulkDelete,
      });

      const purgeLog = fetchedLogs.entries.first();
      if (purgeLog && (Date.now() - purgeLog.createdTimestamp < 5000)) {
        if (!db.isAuditEventCached(purgeLog.id)) {
          db.cacheAuditEvent(purgeLog.id);
          const executor = purgeLog.executor;
          embed.addFields({ name: t(lang, 'msg_bulk_by'), value: `${executor}`, inline: true });
        }
      }
    } catch (err) {
      console.warn('Gagal mengambil audit logs untuk bulk delete:', err.message);
    }

    sendLog(guildId, 'moderation', embed);
  }
};
