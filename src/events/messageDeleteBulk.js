const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const { sendLog } = require('../bot');
const db = require('../database');

module.exports = {
  async execute(messages) {
    const firstMsg = messages.first();
    if (!firstMsg || !firstMsg.guild) return;

    const guildId = firstMsg.guild.id;

    // Check if channel is ignored
    const settings = db.getGuildSettings(guildId);
    const ignored = JSON.parse(settings.ignored_channels || '[]');
    if (ignored.includes(firstMsg.channel.id)) return;

    const embed = new EmbedBuilder()
      .setColor('#ef4444') // Solid Red
      .setDescription(`### **🗑️ Pesan Dihapus Secara Massal (Purge)**\nSebanyak **${messages.size}** pesan telah dihapus secara massal di saluran ${firstMsg.channel}.`)
      .setTimestamp()
      .setFooter({ text: `#${firstMsg.channel.name}: ${firstMsg.channel.id}` });

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
          embed.addFields({ name: 'Dihapus Oleh', value: `${executor}`, inline: true });
          embed.setFooter({ text: `${executor.username}: ${executor.id} | #${firstMsg.channel.name}: ${firstMsg.channel.id} | Audit Log: ${purgeLog.id}` });
        }
      }
    } catch (err) {
      console.warn('Gagal mengambil audit logs untuk bulk delete:', err.message);
    }

    sendLog(guildId, 'moderation', embed);
  }
};
