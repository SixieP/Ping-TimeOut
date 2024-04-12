const { removeAllGuildRoles } = require("../../utils/database/guildDelete/removeRoles");
const logging = require('../../utils/baseUtils/logging');

module.exports = (client, guild) => {
    const guildId = guild.id;

    if (guild.available) {
        removeAllTimeoutGuildRoles(); //This event can also be fired when a guild goes unavailable. In that case it shouldn't be available and you also don't want to delete the role then.
    }

    function removeAllTimeoutGuildRoles() {
        removeAllGuildRoles(guildId)
        .then(() => logging.globalInfo(__filename, `Successfully remove a role from the database that belonged to a deleted guild. guildId: ${guildId}`))
        .catch((error) => logging.error((error) => `Error deleting all timeout roles from a deleted guild. guildId: "${guildId}", code: "err_datab_dellAllRoles, error: "${error}"'`));
    };
};