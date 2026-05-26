const { EmbedBuilder } = require('discord.js');
const { sendLog } = require('../bot');
const db = require('../database');

module.exports = {
  execute(oldMessage, newMessage) {
    if (!newMessage.guild || newMessage.author?.bot) return;
    if (oldMessage.content === newMessage.content) return; // Ignore embed updates or identical content

    // Check if channel is ignored
    const settings = db.getGuildSettings(newMessage.guild.id);
    const ignored = JSON.parse(settings.ignored_channels || '[]');
    if (ignored.includes(newMessage.channel.id)) return;

    const oldText = oldMessage.content ? (oldMessage.content.length > 1000 ? oldMessage.content.substring(0, 990) + '...' : oldMessage.content) : '_Kosong / Tidak Ter-cache_';
    const newText = newMessage.content ? (newMessage.content.length > 1000 ? newMessage.content.substring(0, 990) + '...' : newMessage.content) : '_Kosong_';

    const embed = new EmbedBuilder()
      .setColor('#eab308') // sleek amber/yellow
      .setTitle('📝 Pesan Diedit')
      .setDescription(`Sebuah pesan teks telah disunting di saluran.`)
      .addFields(
        { name: 'Pengirim', value: `${newMessage.author}`, inline: true },
        { name: 'Channel', value: `${newMessage.channel}`, inline: true },
        { name: 'Sebelum', value: oldText },
        { name: 'Sesudah', value: newText }
      )
      .setTimestamp()
      .setFooter({ text: `${newMessage.author.username}: ${newMessage.author.id} | #${newMessage.channel.name}: ${newMessage.channel.id}` });

    sendLog(newMessage.guild.id, 'moderation', embed);
  }
};
