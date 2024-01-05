const { removeAllGuildRoles } = require("../../utils/database/guildDelete/removeRoles");
const logging = require('../../utils/baseUtils/logging');

module.exports = (guild) => {
    const guildId = guild.id;

    logging.verboseInfo(__filename, `The guild: "${guild.name}" (${guild.id}) has been deleted (Bot got removed/guild got deleted). Removing all timed roles from database.`)
    removeAllGuildRoles(guildId);
}