const { EmbedBuilder } = require('discord.js');
const { sendLog } = require('../bot');
const db = require('../database');
const { t } = require('../utils/lang');

module.exports = {
  execute(oldState, newState) {
    const guildId = newState.guild.id;
    const userId = newState.id;
    const member = newState.member;

    if (!member || member.user.bot) return;

    const settings = db.getGuildSettings(guildId);
    const lang = settings.language || 'id';

    const embed = new EmbedBuilder()
      .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
      .setTimestamp();

    // 1. JOIN Voice
    if (!oldState.channelId && newState.channelId) {
      db.startVoiceSession(guildId, userId, newState.channelId);

      embed.setColor('#10b981') // Green
        .setTitle(t(lang, 'voice_join_title'))
        .setDescription(t(lang, 'voice_join_desc', `${member}`, `${newState.channel}`));
      sendLog(guildId, 'voice_join_leave', embed);
    }

    // 2. LEAVE Voice
    else if (oldState.channelId && !newState.channelId) {
      const result = db.endVoiceSession(guildId, userId);
      const durationSecs = result.duration;
      const newlyUnlocked = result.newlyUnlocked;
      let durationStr = lang === 'id' ? 'Tidak diketahui' : 'Unknown';

      if (durationSecs !== null && durationSecs !== undefined) {
        const hrs = Math.floor(durationSecs / 3600);
        const mins = Math.floor((durationSecs % 3600) / 60);
        const secs = durationSecs % 60;
        durationStr = t(lang, 'voice_duration_val', hrs, mins, secs);
      }

      embed.setColor('#ef4444') // Red
        .setTitle(t(lang, 'voice_leave_title'))
        .setDescription(t(lang, 'voice_leave_desc', `${member}`, `${oldState.channel}`));

      if (settings.show_session_duration !== false) {
        embed.addFields({ name: t(lang, 'voice_duration_title'), value: `\`${durationStr}\`` });
      }

      sendLog(guildId, 'voice_join_leave', embed);

      if (newlyUnlocked && newlyUnlocked.length > 0) {
        const { sendAchievementNotification } = require('../bot');
        sendAchievementNotification(guildId, userId, newlyUnlocked);
      }
    }

    // 3. MOVE Voice
    else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
      // Re-trigger session tracking
      const result = db.endVoiceSession(guildId, userId);
      db.startVoiceSession(guildId, userId, newState.channelId);

      embed.setColor('#3b82f6') // Blue
        .setTitle(t(lang, 'voice_move_title'))
        .setDescription(t(lang, 'voice_move_desc', `${member}`))
        .addFields(
          { name: t(lang, 'voice_before'), value: `${oldState.channel}`, inline: true },
          { name: t(lang, 'voice_after'), value: `${newState.channel}`, inline: true }
        );
      sendLog(guildId, 'voice_join_leave', embed);

      if (result.newlyUnlocked && result.newlyUnlocked.length > 0) {
        const { sendAchievementNotification } = require('../bot');
        sendAchievementNotification(guildId, userId, result.newlyUnlocked);
      }
    }

    // 4. MUTE / DEAF / CAMERA / GO LIVE (Within same channel)
    else if (oldState.channelId === newState.channelId) {
      let logged = false;

      // Self Mute
      if (oldState.selfMute !== newState.selfMute) {
        embed.setColor(newState.selfMute ? '#f59e0b' : '#0ea5e9') // Sky Blue when unmuted/activated
          .setTitle(newState.selfMute ? t(lang, 'voice_mic_mute_title') : t(lang, 'voice_mic_unmute_title'))
          .setDescription(newState.selfMute 
            ? t(lang, 'voice_mic_mute_desc', `${member}`, `${newState.channel}`) 
            : t(lang, 'voice_mic_unmute_desc', `${member}`, `${newState.channel}`)
          );
        logged = true;
      }
      
      // Self Deaf
      if (oldState.selfDeaf !== newState.selfDeaf) {
        embed.setColor(newState.selfDeaf ? '#f59e0b' : '#0ea5e9') // Sky Blue when undeafened/activated
          .setTitle(newState.selfDeaf ? t(lang, 'voice_deaf_mute_title') : t(lang, 'voice_deaf_unmute_title'))
          .setDescription(newState.selfDeaf 
            ? t(lang, 'voice_deaf_mute_desc', `${member}`, `${newState.channel}`) 
            : t(lang, 'voice_deaf_unmute_desc', `${member}`, `${newState.channel}`)
          );
        logged = true;
      }

      // Camera status (Video)
      if (oldState.selfVideo !== newState.selfVideo) {
        embed.setColor(newState.selfVideo ? '#0ea5e9' : '#f59e0b')
          .setTitle(newState.selfVideo ? t(lang, 'voice_cam_on_title') : t(lang, 'voice_cam_off_title'))
          .setDescription(newState.selfVideo 
            ? t(lang, 'voice_cam_on_desc', `${member}`, `${newState.channel}`) 
            : t(lang, 'voice_cam_off_desc', `${member}`, `${newState.channel}`)
          );
        logged = true;
      }

      // Screen Share (Go Live)
      if (oldState.streaming !== newState.streaming) {
        embed.setColor(newState.streaming ? '#0ea5e9' : '#f59e0b')
          .setTitle(newState.streaming ? t(lang, 'voice_stream_on_title') : t(lang, 'voice_stream_off_title'))
          .setDescription(newState.streaming 
            ? t(lang, 'voice_stream_on_desc', `${member}`, `${newState.channel}`) 
            : t(lang, 'voice_stream_off_desc', `${member}`, `${newState.channel}`)
          );
        logged = true;
      }

      // Voice Status Text
      if (oldState.status !== newState.status) {
        const noneVal = lang === 'id' ? '_Tidak ada (Kosong)_' : '_None (Empty)_';
        embed.setColor('#0ea5e9')
          .setTitle(t(lang, 'voice_status_update_title'))
          .setDescription(t(lang, 'voice_status_update_desc', `${member}`, `${newState.channel || 'saluran voice'}`))
          .addFields(
            { name: t(lang, 'voice_before'), value: oldState.status ? `\`${oldState.status}\`` : noneVal, inline: true },
            { name: t(lang, 'voice_after'), value: newState.status ? `\`${newState.status}\`` : noneVal, inline: true }
          );
        logged = true;
      }

      if (logged) {
        sendLog(guildId, 'voice_mute_deafen', embed);
      }
    }
  }
};
