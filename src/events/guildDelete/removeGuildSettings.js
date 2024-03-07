const logging = require('../../utils/baseUtils/logging');
const { createGuildSettings, removeGuildSettings } = require("../../utils/database/guildSettings/guildSettings");

module.exports = (client, guild) => {
    const guildId = guild.id;

    removeGuildSettings(guildId)
    .then(() => logging.verboseInfo(__filename, `A guild got removed and the settings row was removed in the DB. guildId: ${guildId}`))
    .catch((error) => logging.error(__filename, `A guild got removed but there was an error while removing the settings row in the DB. code": "err_datab_remSets", errCode: "${error.code}", error: "${error}"`));
};