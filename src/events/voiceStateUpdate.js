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

    // 1. JOIN VC
    if (!oldState.channelId && newState.channelId) {
      db.startVoiceSession(guildId, userId, newState.channelId);

      embed.setColor('#10b981') // Green
        .setDescription(`### **🔊 Join Channel Voice**\n${member} bergabung ke channel voice ${newState.channel}`);
      logged = true;
    }

    // 2. LEAVE VC
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
        .setDescription(`### **🔇 Keluar Channel Voice**\n${member} keluar dari channel voice ${oldState.channel}`)
        .addFields({ name: 'Durasi Nongkrong', value: `\`${durationStr}\`` });
      logged = true;
    }

    // 3. MOVE VC
    else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
      // Re-trigger session tracking
      db.endVoiceSession(guildId, userId);
      db.startVoiceSession(guildId, userId, newState.channelId);

      embed.setColor('#3b82f6') // Blue
        .setDescription(`### **🔄 Pindah Channel Voice**\n${member} pindah channel voice`)
        .addFields(
          { name: 'Sebelum', value: `${oldState.channel}`, inline: true },
          { name: 'Sesudah', value: `${newState.channel}`, inline: true }
        );
      logged = true;
    }

    // 4. MUTE / DEAF / CAMERA / GO LIVE (Within same channel)
    else if (oldState.channelId === newState.channelId) {
      // Self Mute
      if (oldState.selfMute !== newState.selfMute) {
        embed.setColor(newState.selfMute ? '#f59e0b' : '#10b981')
          .setDescription(`### **🎙️ ${newState.selfMute ? 'Voice Mic Dimatikan' : 'Voice Mic Diaktifkan'}**\n${member} ${newState.selfMute ? 'membungkam mic mereka' : 'mengaktifkan mic mereka'} di ${newState.channel}`);
        logged = true;
      }
      
      // Self Deaf
      if (oldState.selfDeaf !== newState.selfDeaf) {
        embed.setColor(newState.selfDeaf ? '#f59e0b' : '#10b981')
          .setDescription(`### **🎧 ${newState.selfDeaf ? 'Voice Pendengaran Dimatikan' : 'Voice Pendengaran Dinyalakan'}**\n${member} ${newState.selfDeaf ? 'mematikan pendengaran' : 'menyalakan pendengaran'} di ${newState.channel}`);
        logged = true;
      }

      // Camera status (Video)
      if (oldState.selfVideo !== newState.selfVideo) {
        embed.setColor(newState.selfVideo ? '#8b5cf6' : '#6b7280')
          .setDescription(`### **📷 ${newState.selfVideo ? 'Kamera Voice Diaktifkan' : 'Kamera Voice Dimatikan'}**\n${member} ${newState.selfVideo ? 'menyalakan kamera video' : 'mematikan kamera video'} di ${newState.channel}`);
        logged = true;
      }

      // Screen Share (Go Live)
      if (oldState.streaming !== newState.streaming) {
        embed.setColor(newState.streaming ? '#8b5cf6' : '#6b7280')
          .setDescription(`### **🖥️ Share Screen Mulai**\n${member} ${newState.streaming ? 'memulai screen share' : 'menghentikan screen share'} di ${newState.channel}`);
        logged = true;
      }
    }

    if (logged) {
      sendLog(guildId, 'voice', embed);
    }
  }
};
