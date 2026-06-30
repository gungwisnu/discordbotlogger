const { EmbedBuilder, AuditLogEvent } = require('discord.js');
const { sendLog } = require('../bot');
const db = require('../database');
const { t } = require('../utils/lang');

module.exports = {
  async execute(auditLogEntry, guild) {
    const { action, executorId, targetId, reason, id, changes } = auditLogEntry;
    
    // Prevent duplicate logging using audit log entry ID cache
    if (db.isAuditEventCached(id)) return;
    db.cacheAuditEvent(id);

    const settings = db.getGuildSettings(guild.id);
    const lang = settings.language || 'id';

    const executor = await guild.client.users.fetch(executorId).catch(() => null);
    const executorText = executor ? `${executor}` : `Admin ID: \`${executorId}\``;
    const reasonText = reason || (lang === 'id' ? 'Tidak ada alasan yang diberikan.' : 'No reason provided.');

    const embed = new EmbedBuilder()
      .setTimestamp();

    let isLogged = false;
    let logCategory = 'server';

    // 1. BAN ACTION
    if (action === AuditLogEvent.MemberBanAdd) {
      const target = await guild.client.users.fetch(targetId).catch(() => null);
      const targetName = target ? target.username : 'Unknown';
      const name = target ? `${target}` : `User ID: \`${targetId}\``;
      
      embed.setColor('#ef4444') // Solid Red
        .setTitle(t(lang, 'audit_ban_title'))
        .setDescription(t(lang, 'audit_ban_desc', targetName))
        .addFields(
          { name: t(lang, 'audit_field_target'), value: name, inline: true },
          { name: t(lang, 'audit_field_mod'), value: executorText, inline: true },
          { name: t(lang, 'audit_field_reason'), value: reasonText }
        );
      
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
        .setTitle(t(lang, 'audit_unban_title'))
        .setDescription(t(lang, 'audit_unban_desc', targetName))
        .addFields(
          { name: t(lang, 'audit_field_target'), value: name, inline: true },
          { name: t(lang, 'audit_field_mod'), value: executorText, inline: true },
          { name: t(lang, 'audit_field_reason'), value: reasonText }
        );
      
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
        .setTitle(t(lang, 'audit_kick_title'))
        .setDescription(t(lang, 'audit_kick_desc', targetName))
        .addFields(
          { name: t(lang, 'audit_field_target'), value: name, inline: true },
          { name: t(lang, 'audit_field_mod'), value: executorText, inline: true },
          { name: t(lang, 'audit_field_reason'), value: reasonText }
        );
      
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
            .setTitle(t(lang, 'audit_timeout_title'))
            .setDescription(t(lang, 'audit_timeout_desc', targetName))
            .addFields(
              { name: t(lang, 'audit_field_target'), value: name, inline: true },
              { name: t(lang, 'audit_field_mod'), value: executorText, inline: true },
              { name: t(lang, 'audit_field_duration'), value: `\`${t(lang, 'audit_field_duration_val', durationMin)}\` (<t:${Math.floor(timeoutTime.getTime() / 1000)}:f>)` },
              { name: t(lang, 'audit_field_reason'), value: reasonText }
            );
          
          db.logModeration(guild.id, targetId, executorId, 'TIMEOUT', `Durasi: ${durationMin} menit. Alasan: ${reasonText}`);
          logCategory = 'moderation';
          isLogged = true;
        } else if (oldVal && !newVal) {
          const untimeoutReason = lang === 'id' ? 'Timeout dibatalkan sebelum waktunya.' : 'Timeout cancelled early.';
          embed.setColor('#3b82f6') // Blue
            .setTitle(t(lang, 'audit_untimeout_title'))
            .setDescription(t(lang, 'audit_untimeout_desc', targetName))
            .addFields(
              { name: t(lang, 'audit_field_target'), value: name, inline: true },
              { name: t(lang, 'audit_field_mod'), value: executorText, inline: true },
              { name: t(lang, 'audit_field_reason'), value: untimeoutReason }
            );
          
          db.logModeration(guild.id, targetId, executorId, 'UNTIMEOUT', 'Timeout dibatalkan.');
          logCategory = 'moderation';
          isLogged = true;
        }
      }
    } 
    
    // 5. CHANNEL CREATE / DELETE
    else if (action === AuditLogEvent.ChannelCreate) {
      embed.setColor('#10b981')
        .setTitle(t(lang, 'audit_chan_create_title'))
        .setDescription(t(lang, 'audit_chan_create_desc'))
        .addFields(
          { name: t(lang, 'audit_field_chan'), value: `<#${targetId}>`, inline: true },
          { name: t(lang, 'audit_field_by'), value: executorText, inline: true }
        );
      
      isLogged = true;
      logCategory = 'server';
    } else if (action === AuditLogEvent.ChannelDelete) {
      const channelNameChange = changes.find(c => c.key === 'name');
      const chanName = channelNameChange ? channelNameChange.old : `Channel ID: ${targetId}`;
      
      embed.setColor('#ef4444')
        .setTitle(t(lang, 'audit_chan_delete_title'))
        .setDescription(t(lang, 'audit_chan_delete_desc', chanName))
        .addFields(
          { name: t(lang, 'audit_field_chan'), value: `**#${chanName}**`, inline: true },
          { name: t(lang, 'audit_field_by'), value: executorText, inline: true }
        );
      
      isLogged = true;
      logCategory = 'server';
    } 
    
    // 6. CHANNEL UPDATE
    else if (action === AuditLogEvent.ChannelUpdate) {
      const targetChannel = await guild.channels.fetch(targetId).catch(() => null);
      const chanMention = targetChannel ? `<#${targetId}>` : `Channel ID: \`${targetId}\``;
      
      embed.setColor('#3b82f6')
        .setTitle(t(lang, 'audit_chan_update_title'))
        .setDescription(t(lang, 'audit_chan_update_desc', chanMention))
        .addFields(
          { name: t(lang, 'audit_field_by'), value: executorText }
        );

      let updated = false;
      const oldName = changes.find(c => c.key === 'name')?.old;
      const newName = changes.find(c => c.key === 'name')?.new;
      const oldTopic = changes.find(c => c.key === 'topic')?.old;
      const newTopic = changes.find(c => c.key === 'topic')?.new;

      if (oldName !== undefined && newName !== undefined && oldName !== newName) {
        embed.addFields(
          { name: t(lang, 'voice_before'), value: `\`${oldName}\``, inline: true },
          { name: t(lang, 'voice_after'), value: `\`${newName}\``, inline: true }
        );
        updated = true;
      }
      if (oldTopic !== undefined && newTopic !== undefined && oldTopic !== newTopic) {
        const noneTopicVal = lang === 'id' ? '(Kosong)' : '(Empty)';
        embed.addFields(
          { name: t(lang, 'voice_before'), value: `\`${oldTopic || noneTopicVal}\``, inline: true },
          { name: t(lang, 'voice_after'), value: `\`${newTopic || noneTopicVal}\``, inline: true }
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
        .setTitle(t(lang, 'audit_role_create_title'))
        .setDescription(t(lang, 'audit_role_create_desc'))
        .addFields(
          { name: t(lang, 'audit_field_role'), value: `<@&${targetId}>`, inline: true },
          { name: t(lang, 'audit_field_by'), value: executorText, inline: true }
        );
      
      isLogged = true;
      logCategory = 'server';
    } else if (action === AuditLogEvent.RoleDelete) {
      const nameChange = changes.find(c => c.key === 'name');
      const roleName = nameChange ? nameChange.old : `ID: ${targetId}`;
      
      embed.setColor('#ef4444')
        .setTitle(t(lang, 'audit_role_delete_title'))
        .setDescription(t(lang, 'audit_role_delete_desc', roleName))
        .addFields(
          { name: t(lang, 'audit_field_role'), value: `**${roleName}**`, inline: true },
          { name: t(lang, 'audit_field_by'), value: executorText, inline: true }
        );
      
      isLogged = true;
      logCategory = 'server';
    }

    // 8. ROLE UPDATE
    else if (action === AuditLogEvent.RoleUpdate) {
      embed.setColor('#3b82f6')
        .setTitle(t(lang, 'audit_role_update_title'))
        .setDescription(t(lang, 'audit_role_update_desc', `<@&${targetId}>`))
        .addFields(
          { name: t(lang, 'audit_field_by'), value: executorText }
        );

      let updated = false;
      const oldName = changes.find(c => c.key === 'name')?.old;
      const newName = changes.find(c => c.key === 'name')?.new;
      const oldColor = changes.find(c => c.key === 'color')?.old;
      const newColor = changes.find(c => c.key === 'color')?.new;

      if (oldName !== undefined && newName !== undefined && oldName !== newName) {
        embed.addFields(
          { name: t(lang, 'voice_before'), value: `\`${oldName}\``, inline: true },
          { name: t(lang, 'voice_after'), value: `\`${newName}\``, inline: true }
        );
        updated = true;
      }
      if (oldColor !== undefined && newColor !== undefined && oldColor !== newColor) {
        const oldHex = '#' + oldColor.toString(16).padStart(6, '0');
        const newHex = '#' + newColor.toString(16).padStart(6, '0');
        embed.addFields(
          { name: t(lang, 'voice_before'), value: `\`${oldHex}\``, inline: true },
          { name: t(lang, 'voice_after'), value: `\`${newHex}\``, inline: true }
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
        .setTitle(t(lang, 'audit_emoji_create_title'))
        .setDescription(t(lang, 'audit_emoji_create_desc', emojiName))
        .addFields(
          { name: t(lang, 'audit_field_emoji'), value: `\`:${emojiName}:\``, inline: true },
          { name: t(lang, 'audit_field_by'), value: executorText, inline: true }
        );
      isLogged = true;
      logCategory = 'server';
    } else if (action === AuditLogEvent.EmojiDelete) {
      const emojiName = changes.find(c => c.key === 'name')?.old;
      embed.setColor('#ef4444')
        .setTitle(t(lang, 'audit_emoji_delete_title'))
        .setDescription(t(lang, 'audit_emoji_delete_desc', emojiName))
        .addFields(
          { name: t(lang, 'audit_field_emoji'), value: `\`:${emojiName}:\``, inline: true },
          { name: t(lang, 'audit_field_by'), value: executorText, inline: true }
        );
      isLogged = true;
      logCategory = 'server';
    } else if (action === 192) {
      const targetChannel = await guild.channels.fetch(targetId).catch(() => null);
      const chanMention = targetChannel ? `<#${targetId}>` : `Channel ID: \`${targetId}\``;

      embed.setColor('#3b82f6')
        .setTitle(t(lang, 'audit_vc_status_update_title'))
        .setDescription(t(lang, 'audit_vc_status_update_desc', chanMention))
        .addFields(
          { name: t(lang, 'audit_field_by'), value: executorText }
        );

      isLogged = true;
      logCategory = 'moderation';
    } else if (action === 193) {
      const targetChannel = await guild.channels.fetch(targetId).catch(() => null);
      const chanMention = targetChannel ? `<#${targetId}>` : `Channel ID: \`${targetId}\``;

      embed.setColor('#ef4444')
        .setTitle(t(lang, 'audit_vc_status_delete_title'))
        .setDescription(t(lang, 'audit_vc_status_delete_desc', chanMention))
        .addFields(
          { name: t(lang, 'audit_field_by'), value: executorText }
        );

      isLogged = true;
      logCategory = 'moderation';
    }

    if (isLogged) {
      sendLog(guild.id, logCategory, embed);
    }
  }
};
