const { EmbedBuilder } = require('discord.js');
const { sendLog } = require('../bot');
const db = require('../database');

module.exports = {
  execute(oldState, newState) {
    const guildId = newState.guild.id;
    const userId = newState.id;
    const member = newState.member;

    if (!member || member.user.bot) return;

    const chan = newState.channel || oldState.channel;
    const chanName = chan ? `#${chan.name}` : '#Unknown';
    const chanId = newState.channelId || oldState.channelId;

    const embed = new EmbedBuilder()
      .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
      .setTimestamp()
      .setFooter({ text: `${member.user.username}: ${userId}${chanId ? ` | ${chanName}: ${chanId}` : ''}` });

    let logged = false;

    // 1. JOIN Voice
    if (!oldState.channelId && newState.channelId) {
      db.startVoiceSession(guildId, userId, newState.channelId);

      embed.setColor('#10b981') // Green
        .setDescription(`### **🔊 Bergabung ke Saluran Voice**\n${member} telah bergabung ke saluran Voice ${newState.channel}.`);
      sendLog(guildId, 'voice_join_leave', embed);
    }

    // 2. LEAVE Voice
    else if (oldState.channelId && !newState.channelId) {
      const durationSecs = db.endVoiceSession(guildId, userId);
      let durationStr = 'Tidak diketahui';

      if (durationSecs !== null) {
        const hrs = Math.floor(durationSecs / 3600);
        const mins = Math.floor((durationSecs % 3600) / 60);
        const secs = durationSecs % 60;
        durationStr = `${hrs} jam ${mins} menit ${secs} detik`;
      }

      embed.setColor('#ef4444') // Red
        .setDescription(`### **🔇 Meninggalkan Saluran Voice**\n${member} telah meninggalkan saluran Voice ${oldState.channel}.`)
        .addFields({ name: 'Durasi Sesi', value: `\`${durationStr}\`` });
      sendLog(guildId, 'voice_join_leave', embed);
    }

    // 3. MOVE Voice
    else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
      // Re-trigger session tracking
      db.endVoiceSession(guildId, userId);
      db.startVoiceSession(guildId, userId, newState.channelId);

      embed.setColor('#3b82f6') // Blue
        .setDescription(`### **🔄 Berpindah Saluran Voice**\n${member} telah berpindah saluran Voice.`)
        .addFields(
          { name: 'Sebelum', value: `${oldState.channel}`, inline: true },
          { name: 'Sesudah', value: `${newState.channel}`, inline: true }
        );
      sendLog(guildId, 'voice_join_leave', embed);
    }

    // 4. MUTE / DEAF / CAMERA / GO LIVE (Within same channel)
    else if (oldState.channelId === newState.channelId) {
      let logged = false;

      // Self Mute
      if (oldState.selfMute !== newState.selfMute) {
        embed.setColor(newState.selfMute ? '#f59e0b' : '#10b981')
          .setDescription(`### **🎙️ ${newState.selfMute ? 'Mikrofon Dinonaktifkan' : 'Mikrofon Diaktifkan'}**\n${member} ${newState.selfMute ? 'menonaktifkan mikrofon mereka' : 'mengaktifkan mikrofon mereka'} di ${newState.channel}.`);
        logged = true;
      }
      
      // Self Deaf
      if (oldState.selfDeaf !== newState.selfDeaf) {
        embed.setColor(newState.selfDeaf ? '#f59e0b' : '#10b981')
          .setDescription(`### **🎧 ${newState.selfDeaf ? 'Pendengaran Dinonaktifkan' : 'Pendengaran Diaktifkan'}**\n${member} ${newState.selfDeaf ? 'menonaktifkan pendengaran mereka' : 'mengaktifkan pendengaran mereka'} di ${newState.channel}.`);
        logged = true;
      }

      // Camera status (Video)
      if (oldState.selfVideo !== newState.selfVideo) {
        embed.setColor(newState.selfVideo ? '#8b5cf6' : '#6b7280')
          .setDescription(`### **📷 ${newState.selfVideo ? 'Kamera Voice Diaktifkan' : 'Kamera Voice Dinonaktifkan'}**\n${member} ${newState.selfVideo ? 'mengaktifkan kamera video mereka' : 'menonaktifkan kamera video mereka'} di ${newState.channel}.`);
        logged = true;
      }

      // Screen Share (Go Live)
      if (oldState.streaming !== newState.streaming) {
        embed.setColor(newState.streaming ? '#8b5cf6' : '#6b7280')
          .setDescription(`### **🖥️ Berbagi Layar (Screen Share) ${newState.streaming ? 'Dimulai' : 'Dihentikan'}**\n${member} ${newState.streaming ? 'memulai aktivitas berbagi layar' : 'menghentikan aktivitas berbagi layar'} di ${newState.channel}.`);
        logged = true;
      }

      if (logged) {
        sendLog(guildId, 'voice_mute_deafen', embed);
      }
    }
  }
};
