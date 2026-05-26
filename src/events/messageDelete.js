const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const { sendLog } = require('../bot');
const db = require('../database');

module.exports = {
  async execute(message) {
    if (!message.guild || message.author?.bot) return;

    // Check if channel is ignored
    const settings = db.getGuildSettings(message.guild.id);
    const ignored = JSON.parse(settings.ignored_channels || '[]');
    if (ignored.includes(message.channel.id)) return;

    const content = message.content ? (message.content.length > 1024 ? message.content.substring(0, 1020) + '...' : message.content) : '_Tidak ada konten teks_';

    const embed = new EmbedBuilder()
      .setColor('#f43f5e') // sleek red
      .setTitle('🗑️ Pesan Dihapus')
      .setDescription(`Sebuah pesan teks telah dihapus dari saluran.`)
      .addFields(
        { name: 'Pengirim', value: `${message.author}`, inline: true },
        { name: 'Channel', value: `${message.channel}`, inline: true },
        { name: 'Isi Pesan', value: content }
      )
      .setTimestamp()
      .setFooter({ text: `${message.author.username}: ${message.author.id} | #${message.channel.name}: ${message.channel.id}` });

    // Check if there are attachments
    if (message.attachments && message.attachments.size > 0) {
      const names = message.attachments.map(a => `\`${a.name}\``).join(', ');
      embed.addFields({ name: 'Lampiran / Attachments', value: names });
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
            embed.addFields({ name: 'Dihapus Oleh', value: `${executor}`, inline: true });
          }
        }
      }
    } catch (err) {
      console.warn('Gagal mengambil audit logs untuk penghapusan pesan:', err.message);
    }

    sendLog(message.guild.id, 'moderation', embed);
  }
};
