const db = require('../database');

function checkRolePermissions(member, config) {
  const allowed = config.allowed_roles || [];
  const ignored = config.ignored_roles || [];

  if (ignored.length > 0) {
    const hasIgnored = ignored.some(id => member.roles.cache.has(id));
    if (hasIgnored) return false;
  }

  if (allowed.length > 0) {
    const hasAllowed = allowed.some(id => member.roles.cache.has(id));
    if (!hasAllowed) return false;
  }

  return true;
}

module.exports = {
  name: 'messageReactionAdd',
  async execute(reaction, user, client) {
    // Ignore bots
    if (user.bot) return;

    // Fetch partials if needed
    if (reaction.partial) {
      try {
        await reaction.fetch();
      } catch (error) {
        console.error('Gagal mengambil partial reaction:', error);
        return;
      }
    }

    const message = reaction.message;
    const guild = message.guild;
    if (!guild) return;

    // Fetch the reaction role configurations for this guild
    const configs = db.getReactionRoles(guild.id);
    // Find if the message is a reaction role message
    const config = configs.find(c => c.message_id === message.id);
    if (!config || config.selection_type !== 'reactions') return;

    // Fetch member
    const member = await guild.members.fetch(user.id).catch(() => null);
    if (!member) return;

    // Check Allowed & Ignored roles
    if (!checkRolePermissions(member, config)) {
      // Try to remove reaction since they are not allowed
      try {
        await reaction.users.remove(user.id);
      } catch (e) {}
      return;
    }

    // Find the option matching the emoji
    const emojiName = reaction.emoji.name;
    const emojiId = reaction.emoji.id;

    const option = config.options.find(opt => {
      if (!opt.emoji) return false;
      return opt.emoji === emojiName || opt.emoji === emojiId || opt.emoji.includes(emojiName);
    });

    const roleIds = option?.role_ids || (option?.role_id ? [option.role_id] : []);
    if (roleIds.length === 0) return;

    try {
      const type = config.type || 'Normal';

      if (type === 'Take') {
        // TAKE: ADDING REACTION REMOVES ROLES!
        let removedNames = [];
        for (const id of roleIds) {
          if (member.roles.cache.has(id)) {
            await member.roles.remove(id);
            removedNames.push(guild.roles.cache.get(id)?.name || 'Role');
          }
        }
        if (removedNames.length > 0) {
          await user.send(`✓ Peran **${removedNames.join(', ')}** telah dihapus dari profil Anda di server **${guild.name}**.`).catch(() => {});
        }
      } else {
        // NORMAL, TOGGLE, GIVE: ADDING REACTION ADDS ROLES!
        // If allow_multiple_roles is false, we should strip other roles from this menu first!
        if (config.allow_multiple_roles === false) {
          const allOtherOptionRoleIds = [];
          config.options.forEach((opt) => {
            if (opt !== option) {
              const ids = opt.role_ids || (opt.role_id ? [opt.role_id] : []);
              allOtherOptionRoleIds.push(...ids);
            }
          });
          for (const id of allOtherOptionRoleIds) {
            if (member.roles.cache.has(id)) await member.roles.remove(id);
          }
        }

        let addedNames = [];
        for (const id of roleIds) {
          if (!member.roles.cache.has(id)) {
            await member.roles.add(id);
            addedNames.push(guild.roles.cache.get(id)?.name || 'Role');
          }
        }
        if (addedNames.length > 0) {
          await user.send(`✓ Peran **${addedNames.join(', ')}** telah ditambahkan kepada Anda di server **${guild.name}**.`).catch(() => {});
        }
      }
    } catch (err) {
      console.error('Gagal menambahkan role dari reaction role:', err);
    }
  }
};
