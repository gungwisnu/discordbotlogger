const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const { sendLog } = require('../bot');
const db = require('../database');

module.exports = {
  async execute(auditLogEntry, guild) {
    const { action, executorId, targetId, reason, id, changes, extra } = auditLogEntry;
    
    // Prevent duplicate logging using audit log entry ID cache
    if (db.isAuditEventCached(id)) return;
    db.cacheAuditEvent(id);

    const executor = await guild.client.users.fetch(executorId).catch(() => null);
    const executorName = executor ? executor.username : 'Unknown';
    const executorText = executor ? `${executor}` : `Admin ID: \`${executorId}\``;
    const reasonText = reason || 'Tidak ada alasan yang diberikan.';

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
        .setTitle('🚫 Anggota Diblokir (Banned)')
        .setDescription(`Pengguna **${targetName}** telah diblokir dari server.`)
        .addFields(
          { name: 'Target Anggota', value: name, inline: true },
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
        .setTitle('🔓 Pemblokiran Anggota Dicabut')
        .setDescription(`Pemblokiran pengguna **${targetName}** telah dicabut.`)
        .addFields(
          { name: 'Target Anggota', value: name, inline: true },
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
        .setTitle('👢 Anggota Dikeluarkan (Kicked)')
        .setDescription(`Pengguna **${targetName}** telah dikeluarkan dari server.`)
        .addFields(
          { name: 'Target Anggota', value: name, inline: true },
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
            .setTitle('⏳ Anggota Diberikan Timeout')
            .setDescription(`Pengguna **${targetName}** telah ditempatkan dalam mode senyap (timeout).`)
            .addFields(
              { name: 'Target Anggota', value: name, inline: true },
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
            .setTitle('⏰ Timeout Dicabut')
            .setDescription(`Masa timeout untuk **${targetName}** telah dicabut.`)
            .addFields(
              { name: 'Target Anggota', value: name, inline: true },
              { name: 'Moderator', value: executorText, inline: true },
              { name: 'Alasan', value: 'Timeout dibatalkan sebelum waktunya.' }
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
        .setTitle('📁 Channel Dibuat')
        .setDescription(`Saluran teks baru telah berhasil dibuat di server.`)
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
        .setTitle('📂 Channel Dihapus')
        .setDescription(`Saluran **#${chanName}** telah dihapus dari server.`)
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
        .setTitle('📂 Channel Diperbarui')
        .setDescription(`Saluran ${chanMention} telah diperbarui.`)
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
        .setTitle('🛡️ Peran (Role) Dibuat')
        .setDescription('Peran (role) server baru telah dibuat.')
        .addFields(
          { name: 'Peran', value: `<@&${targetId}>`, inline: true },
          { name: 'Dibuat Oleh', value: executorText, inline: true }
        )
        .setFooter({ text: `${executorName}: ${executorId} | Role ID: ${targetId} | Audit Log: ${id}` });
      
      isLogged = true;
      logCategory = 'server';
    } else if (action === AuditLogEvent.RoleDelete) {
      const nameChange = changes.find(c => c.key === 'name');
      const roleName = nameChange ? nameChange.old : `ID: ${targetId}`;
      
      embed.setColor('#ef4444')
        .setTitle('🛡️ Peran (Role) Dihapus')
        .setDescription(`Peran **@${roleName}** telah dihapus dari server.`)
        .addFields(
          { name: 'Nama Peran', value: `**${roleName}**`, inline: true },
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
        .setTitle('🛡️ Peran (Role) Diperbarui')
        .setDescription(`Peran <@&${targetId}> telah diperbarui.`)
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
        .setTitle('😀 Emoji Dibuat')
        .setDescription(`Emoji baru dengan alias \`:${emojiName}:\` telah ditambahkan ke server.`)
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
        .setTitle('😢 Emoji Dihapus')
        .setDescription(`Emoji \`:${emojiName}:\` telah dihapus dari server.`)
        .addFields(
          { name: 'Nama Emoji', value: `\`:${emojiName}:\``, inline: true },
          { name: 'Dihapus Oleh', value: executorText, inline: true }
        )
        .setFooter({ text: `${executorName}: ${executorId} | Emoji: :${emojiName}: (${targetId}) | Audit Log: ${id}` });
      isLogged = true;
      logCategory = 'server';
    } else if (action === 192) {
      const targetChannel = await guild.channels.fetch(targetId).catch(() => null);
      const chanMention = targetChannel ? `<#${targetId}>` : `Channel ID: \`${targetId}\``;
      const chanNameActual = targetChannel ? targetChannel.name : 'Unknown';

      const statusChange = changes.find(c => c.key === 'status');
      const oldStatus = statusChange ? statusChange.old : null;
      const newStatus = extra?.status || (statusChange ? statusChange.new : (changes[0]?.new || null));

      embed.setColor('#3b82f6')
        .setTitle('🎙️ Status Voice Channel Diperbarui')
        .setDescription(`Status saluran voice ${chanMention} telah diubah.`)
        .setFooter({ text: `${executorName}: ${executorId} | #${chanNameActual}: ${targetId} | Audit Log: ${id}` });

      if (oldStatus) {
        embed.addFields(
          { name: 'Diubah Oleh', value: executorText },
          { name: 'Status Lama', value: `\`${oldStatus}\``, inline: true },
          { name: 'Status Baru', value: `\`${newStatus || '(Kosong)'}\``, inline: true }
        );
      } else {
        embed.addFields(
          { name: 'Diubah Oleh', value: executorText },
          { name: 'Diubah Menjadi', value: `\`${newStatus || '(Kosong)'}\`` }
        );
      }

      isLogged = true;
      logCategory = 'moderation';
    } else if (action === 193) {
      const targetChannel = await guild.channels.fetch(targetId).catch(() => null);
      const chanMention = targetChannel ? `<#${targetId}>` : `Channel ID: \`${targetId}\``;
      const chanNameActual = targetChannel ? targetChannel.name : 'Unknown';

      embed.setColor('#ef4444')
        .setTitle('🎙️ Status Voice Channel Dihapus')
        .setDescription(`Status saluran voice ${chanMention} telah dihapus.`)
        .addFields(
          { name: 'Dihapus Oleh', value: executorText }
        )
        .setFooter({ text: `${executorName}: ${executorId} | #${chanNameActual}: ${targetId} | Audit Log: ${id}` });

      isLogged = true;
      logCategory = 'moderation';
    }

    if (isLogged) {
      sendLog(guild.id, logCategory, embed);
    }
  }
};
