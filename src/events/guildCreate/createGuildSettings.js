const { removeAllGuildRoles } = require("../../utils/database/guildDelete/removeRoles");
const logging = require('../../utils/baseUtils/logging');
const { createGuildSettings } = require("../../utils/database/guildSettings/guildSettings");

module.exports = (client, guild) => {
    const guildId = guild.id;

    createGuildSettings(guildId)
    .then(() => logging.verboseInfo(__filename, `A guild got added and a settings row was created in the DB. guildId: ${guildId}`))
    .catch((error) => logging.error(__filename, `A guild got added but there was an error while create a settings row in the DB. code": "err_datab_createSets", errCode: "${error.code}", error: "${error}"`));
};