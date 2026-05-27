const db = require('../database');

module.exports = {
  name: 'messageReactionRemove',
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

      if (type === 'Give') {
        // GIVE: REMOVING REACTION DOES NOTHING!
        return;
      } else if (type === 'Take') {
        // TAKE: REMOVING REACTION ADDS ROLES BACK!
        let addedNames = [];
        for (const id of roleIds) {
          if (!member.roles.cache.has(id)) {
            await member.roles.add(id);
            addedNames.push(guild.roles.cache.get(id)?.name || 'Role');
          }
        }
        if (addedNames.length > 0) {
          await user.send(`✓ Peran **${addedNames.join(', ')}** telah dikembalikan kepada Anda di server **${guild.name}**.`).catch(() => {});
        }
      } else {
        // NORMAL OR TOGGLE: REMOVING REACTION REMOVES ROLES!
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
      }
    } catch (err) {
      console.error('Gagal menghapus role dari reaction role:', err);
    }
  }
};
