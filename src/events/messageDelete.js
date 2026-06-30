const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const { sendLog } = require('../bot');
const db = require('../database');
const { t } = require('../utils/lang');

module.exports = {
  async execute(message) {
    if (!message.guild || message.author?.bot) return;

    // Check if channel is ignored
    const settings = db.getGuildSettings(message.guild.id);
    const ignored = JSON.parse(settings.ignored_channels || '[]');
    if (ignored.includes(message.channel.id)) return;

    const lang = settings.language || 'id';
    const noneText = lang === 'id' ? '_Tidak ada konten teks_' : '_No text content_';
    const content = message.content ? (message.content.length > 1024 ? message.content.substring(0, 1020) + '...' : message.content) : noneText;

    const embed = new EmbedBuilder()
      .setColor('#f43f5e') // sleek red
      .setTitle(t(lang, 'msg_del_title'))
      .setDescription(t(lang, 'msg_del_desc'))
      .addFields(
        { name: t(lang, 'msg_del_sender'), value: `${message.author}`, inline: true },
        { name: t(lang, 'msg_del_channel'), value: `${message.channel}`, inline: true },
        { name: t(lang, 'msg_del_content'), value: content }
      )
      .setTimestamp();

    // Check if there are attachments
    if (message.attachments && message.attachments.size > 0) {
      const names = message.attachments.map(a => `\`${a.name}\``).join(', ');
      embed.addFields({ name: t(lang, 'msg_del_attachments'), value: names });
    }

    // Attempt to fetch who deleted the message from Audit Logs
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const fetchedLogs = await message.guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.MessageDelete,
      });

      const deletionLog = fetchedLogs.entries.first();
      if (deletionLog) {
        const { executor, target } = deletionLog;

        if (target.id === message.author.id && (Date.now() - deletionLog.createdTimestamp < 5000)) {
          if (!db.isAuditEventCached(deletionLog.id)) {
            db.cacheAuditEvent(deletionLog.id);
            embed.addFields({ name: t(lang, 'msg_del_by'), value: `${executor}`, inline: true });
          }
        }
      }
    } catch (err) {
      console.warn('Gagal mengambil audit logs untuk penghapusan pesan:', err.message);
    }

    sendLog(message.guild.id, 'moderation', embed);
  }
};
