const { EmbedBuilder } = require('discord.js');
const { sendLog } = require('../bot');
const db = require('../database');
const { t } = require('../utils/lang');

module.exports = {
  execute(oldMessage, newMessage) {
    if (!newMessage.guild || newMessage.author?.bot) return;
    if (oldMessage.content === newMessage.content) return; // Ignore embed updates or identical content

    // Check if channel is ignored
    const settings = db.getGuildSettings(newMessage.guild.id);
    const ignored = JSON.parse(settings.ignored_channels || '[]');
    if (ignored.includes(newMessage.channel.id)) return;

    const lang = settings.language || 'id';

    const noneOldText = lang === 'id' ? '_Kosong / Tidak Ter-cache_' : '_Empty / Not Cached_';
    const noneNewText = lang === 'id' ? '_Kosong_' : '_Empty_';

    const oldText = oldMessage.content ? (oldMessage.content.length > 1000 ? oldMessage.content.substring(0, 990) + '...' : oldMessage.content) : noneOldText;
    const newText = newMessage.content ? (newMessage.content.length > 1000 ? newMessage.content.substring(0, 990) + '...' : newMessage.content) : noneNewText;

    const embed = new EmbedBuilder()
      .setColor('#eab308') // sleek amber/yellow
      .setTitle(t(lang, 'msg_update_title'))
      .setDescription(t(lang, 'msg_update_desc'))
      .addFields(
        { name: t(lang, 'msg_update_sender'), value: `${newMessage.author}`, inline: true },
        { name: t(lang, 'msg_update_channel'), value: `${newMessage.channel}`, inline: true },
        { name: t(lang, 'msg_update_before'), value: oldText },
        { name: t(lang, 'msg_update_after'), value: newText }
      )
      .setTimestamp();

    sendLog(newMessage.guild.id, 'moderation', embed);
  }
};
