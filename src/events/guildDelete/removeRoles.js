const { removeAllGuildRoles } = require("../../utils/database/guildDelete/removeRoles");
const logging = require('../../utils/baseUtils/logging');

module.exports = (client, guild) => {
    const guildId = guild.id;

    logging.verboseInfo(`The guild ${guild.name} (${guild.id}) has been deleted.`, "guild-deleted")
    removeAllGuildRoles(guildId);
}