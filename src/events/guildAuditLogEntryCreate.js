const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const { sendLog } = require('../bot');
const db = require('../database');

module.exports = {
  async execute(auditLogEntry, guild) {
    const { action, executorId, targetId, reason, id, changes } = auditLogEntry;
    
    // Prevent duplicate logging using audit log entry ID cache
    if (db.isAuditEventCached(id)) return;
    db.cacheAuditEvent(id);

    const executor = await guild.client.users.fetch(executorId).catch(() => null);
    const executorName = executor ? executor.username : 'Unknown';
    const executorText = executor ? `${executor}` : `Admin ID: \`${executorId}\``;
    const reasonText = reason || 'Tidak ada alasan diberikan.';

    const embed = new EmbedBuilder()
      .setTimestamp()
      .setFooter({ text: `${executorName}: ${executorId} | Audit Log: ${id}` });

    let isLogged = false;
    let logCategory = 'server';

    // 1. BAN ACTION
    if (action === AuditLogEvent.MemberBanAdd) {
      const target = await guild.client.users.fetch(targetId).catch(() => null);
      const targetName = target ? target.username : 'Unknown';
      const name = target ? `${target}` : `User ID: \`${targetId}\``;
      
      embed.setColor('#ef4444') // Solid Red
        .setDescription(`### **🚫 Member Dibanned**`)
        .addFields(
          { name: 'Target Member', value: name, inline: true },
          { name: 'Moderator', value: executorText, inline: true },
          { name: 'Alasan', value: reasonText }
        )
        .setFooter({ text: `${executorName}: ${executorId} | ${targetName}: ${targetId} | Audit Log: ${id}` });
      
      db.logModeration(guild.id, targetId, executorId, 'BAN', reasonText);
      isLogged = true;
      logCategory = 'moderation';
    } 
    
    // 2. UNBAN ACTION
    else if (action === AuditLogEvent.MemberBanRemove) {
      const target = await guild.client.users.fetch(targetId).catch(() => null);
      const targetName = target ? target.username : 'Unknown';
      const name = target ? `${target}` : `User ID: \`${targetId}\``;
      
      embed.setColor('#10b981') // Emerald Green
        .setDescription(`### **🔓 Member Di-unban**`)
        .addFields(
          { name: 'Target Member', value: name, inline: true },
          { name: 'Moderator', value: executorText, inline: true },
          { name: 'Alasan', value: reasonText }
        )
        .setFooter({ text: `${executorName}: ${executorId} | ${targetName}: ${targetId} | Audit Log: ${id}` });
      
      db.logModeration(guild.id, targetId, executorId, 'UNBAN', reasonText);
      isLogged = true;
      logCategory = 'moderation';
    } 
    
    // 3. KICK ACTION
    else if (action === AuditLogEvent.MemberKick) {
      const target = await guild.client.users.fetch(targetId).catch(() => null);
      const targetName = target ? target.username : 'Unknown';
      const name = target ? `${target}` : `User ID: \`${targetId}\``;
      
      embed.setColor('#f97316') // Orange
        .setDescription(`### **👢 Member Dikick**`)
        .addFields(
          { name: 'Target Member', value: name, inline: true },
          { name: 'Moderator', value: executorText, inline: true },
          { name: 'Alasan', value: reasonText }
        )
        .setFooter({ text: `${executorName}: ${executorId} | ${targetName}: ${targetId} | Audit Log: ${id}` });
      
      db.logModeration(guild.id, targetId, executorId, 'KICK', reasonText);
      isLogged = true;
      logCategory = 'moderation';
    } 
    
    // 4. TIMEOUT ACTION
    else if (action === AuditLogEvent.MemberUpdate) {
      const timeoutChange = changes.find(c => c.key === 'communication_disabled_until');
      if (timeoutChange) {
        const target = await guild.client.users.fetch(targetId).catch(() => null);
        const targetName = target ? target.username : 'Unknown';
        const name = target ? `${target}` : `User ID: \`${targetId}\``;
        
        const oldVal = timeoutChange.old;
        const newVal = timeoutChange.new;

        if (newVal) {
          const timeoutTime = new Date(newVal);
          const durationMin = Math.round((timeoutTime.getTime() - Date.now()) / 60000);
          
          embed.setColor('#d97706') // Dark Amber
            .setDescription(`### **⏳ Member Di-timeout**`)
            .addFields(
              { name: 'Target Member', value: name, inline: true },
              { name: 'Moderator', value: executorText, inline: true },
              { name: 'Durasi', value: `\`${durationMin} menit\` (Sampai: <t:${Math.floor(timeoutTime.getTime() / 1000)}:f>)` },
              { name: 'Alasan', value: reasonText }
            )
            .setFooter({ text: `${executorName}: ${executorId} | ${targetName}: ${targetId} | Audit Log: ${id}` });
          
          db.logModeration(guild.id, targetId, executorId, 'TIMEOUT', `Durasi: ${durationMin} menit. Alasan: ${reasonText}`);
          logCategory = 'moderation';
          isLogged = true;
        } else if (oldVal && !newVal) {
          embed.setColor('#3b82f6') // Blue
            .setDescription(`### **⏰ Timeout Dihapus**`)
            .addFields(
              { name: 'Target Member', value: name, inline: true },
              { name: 'Moderator', value: executorText, inline: true },
              { name: 'Alasan', value: 'Timeout dibatalkan lebih awal.' }
            )
            .setFooter({ text: `${executorName}: ${executorId} | ${targetName}: ${targetId} | Audit Log: ${id}` });
          
          db.logModeration(guild.id, targetId, executorId, 'UNTIMEOUT', 'Timeout dibatalkan.');
          logCategory = 'moderation';
          isLogged = true;
        }
      }
    } 
    
    // 5. CHANNEL CREATE / DELETE
    else if (action === AuditLogEvent.ChannelCreate) {
      const channelNameChange = changes.find(c => c.key === 'name');
      const chanName = channelNameChange ? channelNameChange.new : `Channel ID: ${targetId}`;
      
      embed.setColor('#10b981')
        .setDescription(`### **📁 Channel Dibuat**`)
        .addFields(
          { name: 'Nama Channel', value: `<#${targetId}>`, inline: true },
          { name: 'Dibuat Oleh', value: executorText, inline: true }
        )
        .setFooter({ text: `${executorName}: ${executorId} | #${chanName}: ${targetId} | Audit Log: ${id}` });
      
      isLogged = true;
      logCategory = 'server';
    } else if (action === AuditLogEvent.ChannelDelete) {
      const channelNameChange = changes.find(c => c.key === 'name');
      const chanName = channelNameChange ? channelNameChange.old : `Channel ID: ${targetId}`;
      
      embed.setColor('#ef4444')
        .setDescription(`### **📂 Channel Dihapus**`)
        .addFields(
          { name: 'Nama Channel', value: `**#${chanName}**`, inline: true },
          { name: 'Dihapus Oleh', value: executorText, inline: true }
        )
        .setFooter({ text: `${executorName}: ${executorId} | #${chanName}: ${targetId} | Audit Log: ${id}` });
      
      isLogged = true;
      logCategory = 'server';
    } 
    
    // 6. CHANNEL UPDATE
    else if (action === AuditLogEvent.ChannelUpdate) {
      const targetChannel = await guild.channels.fetch(targetId).catch(() => null);
      const chanMention = targetChannel ? `<#${targetId}>` : `Channel ID: \`${targetId}\``;
      const chanNameActual = targetChannel ? targetChannel.name : 'Unknown';
      
      embed.setColor('#3b82f6')
        .setDescription(`### **📂 Channel Diperbarui**\n${chanMention}`)
        .addFields(
          { name: 'Diperbarui Oleh', value: executorText }
        )
        .setFooter({ text: `${executorName}: ${executorId} | #${chanNameActual}: ${targetId} | Audit Log: ${id}` });

      let updated = false;
      const oldName = changes.find(c => c.key === 'name')?.old;
      const newName = changes.find(c => c.key === 'name')?.new;
      const oldTopic = changes.find(c => c.key === 'topic')?.old;
      const newTopic = changes.find(c => c.key === 'topic')?.new;

      if (oldName !== undefined && newName !== undefined && oldName !== newName) {
        embed.addFields(
          { name: 'Nama Sebelum', value: `\`${oldName}\``, inline: true },
          { name: 'Nama Sesudah', value: `\`${newName}\``, inline: true }
        );
        updated = true;
      }
      if (oldTopic !== undefined && newTopic !== undefined && oldTopic !== newTopic) {
        embed.addFields(
          { name: 'Topik Sebelum', value: `\`${oldTopic || '(Kosong)'}\``, inline: true },
          { name: 'Topik Sesudah', value: `\`${newTopic || '(Kosong)'}\``, inline: true }
        );
        updated = true;
      }

      if (updated) {
        isLogged = true;
        logCategory = 'server';
      }
    }

    // 7. ROLE CREATE / DELETE
    else if (action === AuditLogEvent.RoleCreate) {
      embed.setColor('#8b5cf6') // Purple
        .setDescription(`### **🛡️ Role Dibuat**`)
        .addFields(
          { name: 'Role', value: `<@&${targetId}>`, inline: true },
          { name: 'Dibuat Oleh', value: executorText, inline: true }
        )
        .setFooter({ text: `${executorName}: ${executorId} | Role ID: ${targetId} | Audit Log: ${id}` });
      
      isLogged = true;
      logCategory = 'server';
    } else if (action === AuditLogEvent.RoleDelete) {
      const nameChange = changes.find(c => c.key === 'name');
      const roleName = nameChange ? nameChange.old : `ID: ${targetId}`;
      
      embed.setColor('#ef4444')
        .setDescription(`### **🛡️ Role Dihapus**`)
        .addFields(
          { name: 'Nama Role', value: `**${roleName}**`, inline: true },
          { name: 'Dihapus Oleh', value: executorText, inline: true }
        )
        .setFooter({ text: `${executorName}: ${executorId} | @${roleName}: ${targetId} | Audit Log: ${id}` });
      
      isLogged = true;
      logCategory = 'server';
    }

    // 8. ROLE UPDATE
    else if (action === AuditLogEvent.RoleUpdate) {
      const roleActual = await guild.roles.fetch(targetId).catch(() => null);
      const roleNameActual = roleActual ? roleActual.name : 'Unknown';

      embed.setColor('#3b82f6')
        .setDescription(`### **🛡️ Role Diperbarui**\n<@&${targetId}>`)
        .addFields(
          { name: 'Diperbarui Oleh', value: executorText }
        )
        .setFooter({ text: `${executorName}: ${executorId} | @${roleNameActual}: ${targetId} | Audit Log: ${id}` });

      let updated = false;
      const oldName = changes.find(c => c.key === 'name')?.old;
      const newName = changes.find(c => c.key === 'name')?.new;
      const oldColor = changes.find(c => c.key === 'color')?.old;
      const newColor = changes.find(c => c.key === 'color')?.new;

      if (oldName !== undefined && newName !== undefined && oldName !== newName) {
        embed.addFields(
          { name: 'Nama Sebelum', value: `\`${oldName}\``, inline: true },
          { name: 'Nama Sesudah', value: `\`${newName}\``, inline: true }
        );
        updated = true;
      }
      if (oldColor !== undefined && newColor !== undefined && oldColor !== newColor) {
        const oldHex = '#' + oldColor.toString(16).padStart(6, '0');
        const newHex = '#' + newColor.toString(16).padStart(6, '0');
        embed.addFields(
          { name: 'Warna Sebelum', value: `\`${oldHex}\``, inline: true },
          { name: 'Warna Sesudah', value: `\`${newHex}\``, inline: true }
        );
        updated = true;
      }

      if (updated) {
        isLogged = true;
        logCategory = 'server';
      }
    }

    // 9. EMOJI CREATE / DELETE
    else if (action === AuditLogEvent.EmojiCreate) {
      const emojiName = changes.find(c => c.key === 'name')?.new;
      embed.setColor('#10b981')
        .setDescription(`### **😀 Emoji Dibuat**`)
        .addFields(
          { name: 'Nama Emoji', value: `\`:${emojiName}:\``, inline: true },
          { name: 'Dibuat Oleh', value: executorText, inline: true }
        )
        .setFooter({ text: `${executorName}: ${executorId} | Emoji: :${emojiName}: (${targetId}) | Audit Log: ${id}` });
      isLogged = true;
      logCategory = 'server';
    } else if (action === AuditLogEvent.EmojiDelete) {
      const emojiName = changes.find(c => c.key === 'name')?.old;
      embed.setColor('#ef4444')
        .setDescription(`### **😢 Emoji Dihapus**`)
        .addFields(
          { name: 'Nama Emoji', value: `\`:${emojiName}:\``, inline: true },
          { name: 'Dihapus Oleh', value: executorText, inline: true }
        )
        .setFooter({ text: `${executorName}: ${executorId} | Emoji: :${emojiName}: (${targetId}) | Audit Log: ${id}` });
      isLogged = true;
      logCategory = 'server';
    }

    if (isLogged) {
      sendLog(guild.id, logCategory, embed);
    }
  }
};
