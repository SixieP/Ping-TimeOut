const { removeAllGuildRoles } = require("../../utils/database/guildDelete/removeRoles");

module.exports = (client, guild) => {
    const guildId = guild.id;

    removeAllGuildRoles(guildId);
}