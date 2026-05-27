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

    // Find the option matching the emoji
    const emojiName = reaction.emoji.name;
    const emojiId = reaction.emoji.id;

    const option = config.options.find(opt => {
      if (!opt.emoji) return false;
      return opt.emoji === emojiName || opt.emoji === emojiId || opt.emoji.includes(emojiName);
    });

    if (!option || !option.role_id) return;

    // Fetch member
    const member = await guild.members.fetch(user.id).catch(() => null);
    if (!member) return;

    try {
      if (member.roles.cache.has(option.role_id)) {
        await member.roles.remove(option.role_id);
        
        // Send DM to user notifying them
        await user.send(`✓ Peran **${guild.roles.cache.get(option.role_id)?.name || 'Role'}** telah dihapus dari profil Anda di server **${guild.name}** karena Anda menghapus reaksi.`).catch(() => {});
      }
    } catch (err) {
      console.error('Gagal menghapus role dari reaction role:', err);
    }
  }
};
