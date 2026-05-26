const { EmbedBuilder } = require('discord.js');
const { sendLog } = require('../bot');
const db = require('../database');

// In-memory gaming session tracker
const activeGamingSessions = {};

module.exports = {
  execute(oldPresence, newPresence) {
    if (!newPresence || !newPresence.member || newPresence.member.user.bot) return;

    const guildId = newPresence.guild.id;
    const userId = newPresence.member.user.id;
    const key = `${guildId}-${userId}`;

    const oldActivity = oldPresence?.activities?.find(a => a.type === 0); // Type 0 is Playing
    const newActivity = newPresence?.activities?.find(a => a.type === 0); // Type 0 is Playing

    const embed = new EmbedBuilder()
      .setAuthor({ name: newPresence.member.user.tag, iconURL: newPresence.member.user.displayAvatarURL() })
      .setTimestamp()
      .setFooter({ text: `${newPresence.member.user.username}: ${userId}` });

    // Case 1: Stopped playing old game
    if (oldActivity && (!newActivity || oldActivity.name !== newActivity.name)) {
      const session = activeGamingSessions[key];
      let durationStr = '';
      
      if (session && session.gameName === oldActivity.name) {
        const durationSecs = Math.max(0, Math.floor((Date.now() - session.startTime) / 1000));
        const newlyUnlocked = db.addGamingTime(guildId, userId, oldActivity.name, durationSecs);
        delete activeGamingSessions[key];

        const mins = Math.floor(durationSecs / 60);
        durationStr = ` selama \`${mins} menit\``;

        if (newlyUnlocked && newlyUnlocked.length > 0) {
          const { sendAchievementNotification } = require('../bot');
          sendAchievementNotification(guildId, userId, newlyUnlocked);
        }
      }

      embed.setColor('#6b7280') // Neutral grey
        .setDescription(`### **🎮 Selesai Bermain Game**\n${newPresence.member} telah selesai bermain **${oldActivity.name}**${durationStr}.`);
      
      sendLog(guildId, 'gaming_activity', embed);
    }

    // Case 2: Started playing a game (or changed to a new game)
    if (newActivity && (!oldActivity || oldActivity.name !== newActivity.name)) {
      // If there was an old session running, close it first
      if (activeGamingSessions[key]) {
        const session = activeGamingSessions[key];
        const durationSecs = Math.max(0, Math.floor((Date.now() - session.startTime) / 1000));
        const newlyUnlocked = db.addGamingTime(guildId, userId, session.gameName, durationSecs);

        if (newlyUnlocked && newlyUnlocked.length > 0) {
          const { sendAchievementNotification } = require('../bot');
          sendAchievementNotification(guildId, userId, newlyUnlocked);
        }
      }

      // Record new session
      activeGamingSessions[key] = {
        gameName: newActivity.name,
        startTime: Date.now()
      };

      embed.setColor('#10b981') // Green
        .setDescription(`### **🎮 Mulai Bermain Game**\n${newPresence.member} telah mulai bermain **${newActivity.name}**.`);
      
      if (newActivity.details) {
        embed.addFields({ name: 'Detail Aktivitas', value: `\`${newActivity.details}\` ${newActivity.state ? `- ${newActivity.state}` : ''}` });
      }
      
      sendLog(guildId, 'gaming_activity', embed);
    }

    // Case 3: Spotify Rich Presence tracking
    const oldSpotify = oldPresence?.activities?.find(a => a.name === 'Spotify');
    const newSpotify = newPresence?.activities?.find(a => a.name === 'Spotify');

    if (newSpotify && (!oldSpotify || oldSpotify.details !== newSpotify.details)) {
      embed.setColor('#1db954') // Spotify green
        .setDescription(`### **🎵 Mendengarkan Spotify**\n${newPresence.member} sedang mendengarkan musik`)
        .addFields(
          { name: 'Judul Lagu', value: `**${newSpotify.details}**`, inline: true },
          { name: 'Artis', value: `*${newSpotify.state}*`, inline: true }
        );
      
      if (newSpotify.assets && newSpotify.assets.largeImage) {
        // Embed album cover if available
        const albumId = newSpotify.assets.largeImage.replace('spotify:', '');
        embed.setThumbnail(`https://i.scdn.co/image/${albumId}`);
      }
      
      sendLog(guildId, 'spotify_activity', embed);
    }
  }
};
