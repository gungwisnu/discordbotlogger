const { EmbedBuilder } = require('discord.js');
const { sendLog } = require('../bot');
const db = require('../database');
const { t } = require('../utils/lang');

// In-memory gaming session tracker
const activeGamingSessions = {};

module.exports = {
  execute(oldPresence, newPresence) {
    if (!newPresence || !newPresence.member || newPresence.member.user.bot) return;

    const guildId = newPresence.guild.id;
    const userId = newPresence.member.user.id;
    const key = `${guildId}-${userId}`;

    const settings = db.getGuildSettings(guildId);
    const lang = settings.language || 'id';

    // Case 0: User Status Change Log (online, idle, dnd, offline)
    const oldStatus = oldPresence?.status || 'offline';
    const newStatus = newPresence?.status || 'offline';

    if (oldStatus !== newStatus) {
      const statusMap = {
        online: { emoji: '🟢', labelId: 'Online', labelEn: 'Online', color: '#10b981' },
        idle: { emoji: '🟡', labelId: 'Idle', labelEn: 'Idle', color: '#f59e0b' },
        dnd: { emoji: '🔴', labelId: 'Jangan Ganggu (DND)', labelEn: 'Do Not Disturb (DND)', color: '#ef4444' },
        offline: { emoji: '⚫', labelId: 'Offline / Invisible', labelEn: 'Offline / Invisible', color: '#6b7280' }
      };

      const oldInfo = statusMap[oldStatus] || { emoji: '❓', labelId: oldStatus, labelEn: oldStatus, color: '#6b7280' };
      const newInfo = statusMap[newStatus] || { emoji: '❓', labelId: newStatus, labelEn: newStatus, color: '#6b7280' };

      const oldLabel = lang === 'id' ? oldInfo.labelId : oldInfo.labelEn;
      const newLabel = lang === 'id' ? newInfo.labelId : newInfo.labelEn;

      const statusEmbed = new EmbedBuilder()
        .setAuthor({ name: newPresence.member.user.tag, iconURL: newPresence.member.user.displayAvatarURL({ dynamic: true }) })
        .setTitle(t(lang, 'pres_status_title'))
        .setDescription(t(lang, 'pres_status_desc', `${newPresence.member}`))
        .addFields(
          { name: t(lang, 'pres_status_old'), value: `${oldInfo.emoji} **${oldLabel}**`, inline: true },
          { name: t(lang, 'pres_status_new'), value: `${newInfo.emoji} **${newLabel}**`, inline: true }
        )
        .setColor(newInfo.color)
        .setTimestamp();

      sendLog(guildId, 'user_status', statusEmbed);
    }

    const oldActivity = oldPresence?.activities?.find(a => a.type === 0); // Type 0 is Playing
    const newActivity = newPresence?.activities?.find(a => a.type === 0); // Type 0 is Playing

    const embed = new EmbedBuilder()
      .setAuthor({ name: newPresence.member.user.tag, iconURL: newPresence.member.user.displayAvatarURL() })
      .setTimestamp();

    // Case 1: Stopped playing old game
    if (oldActivity && (!newActivity || oldActivity.name !== newActivity.name)) {
      const session = activeGamingSessions[key];
      let durationMins = 0;
      
      if (session && session.gameName === oldActivity.name) {
        const durationSecs = Math.max(0, Math.floor((Date.now() - session.startTime) / 1000));
        db.addGamingTime(guildId, userId, oldActivity.name, durationSecs);
        delete activeGamingSessions[key];

        durationMins = Math.floor(durationSecs / 60);
      }

      embed.setColor('#6b7280') // Neutral grey
        .setTitle(t(lang, 'pres_game_stop_title'))
        .setDescription(t(lang, 'pres_game_stop_desc', `${newPresence.member}`, oldActivity.name, durationMins));
      
      sendLog(guildId, 'gaming_activity', embed);
    }

    // Case 2: Started playing a game (or changed to a new game)
    if (newActivity && (!oldActivity || oldActivity.name !== newActivity.name)) {
      // If there was an old session running, close it first
      if (activeGamingSessions[key]) {
        const session = activeGamingSessions[key];
        const durationSecs = Math.max(0, Math.floor((Date.now() - session.startTime) / 1000));
        db.addGamingTime(guildId, userId, session.gameName, durationSecs);
      }

      // Record new session
      activeGamingSessions[key] = {
        gameName: newActivity.name,
        startTime: Date.now()
      };

      embed.setColor('#10b981') // Green
        .setTitle(t(lang, 'pres_game_start_title'))
        .setDescription(t(lang, 'pres_game_start_desc', `${newPresence.member}`, newActivity.name));
      
      if (newActivity.details) {
        embed.addFields({ name: t(lang, 'pres_game_detail'), value: `\`${newActivity.details}\` ${newActivity.state ? `- ${newActivity.state}` : ''}` });
      }
      
      sendLog(guildId, 'gaming_activity', embed);
    }

    // Case 3: Spotify Rich Presence tracking
    const oldSpotify = oldPresence?.activities?.find(a => a.name === 'Spotify');
    const newSpotify = newPresence?.activities?.find(a => a.name === 'Spotify');

    if (newSpotify && (!oldSpotify || oldSpotify.details !== newSpotify.details)) {
      embed.setColor('#1db954') // Spotify green
        .setTitle(t(lang, 'pres_spotify_title'))
        .setDescription(t(lang, 'pres_spotify_desc', `${newPresence.member}`))
        .addFields(
          { name: t(lang, 'pres_spotify_song'), value: `**${newSpotify.details}**`, inline: true },
          { name: t(lang, 'pres_spotify_artist'), value: `*${newSpotify.state}*`, inline: true }
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
