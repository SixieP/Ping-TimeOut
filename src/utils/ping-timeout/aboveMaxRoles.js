const { EmbedBuilder, inlineCode, bold, italic, PermissionFlagsBits } = require("discord.js");
const logging = require('../baseUtils/logging');
const { rolesByGuild } = require("../database/ping-timeout/timedRoles");
const { getGuildSettings } = require("../database/guildSettings/guildSettings");

module.exports = async (guildId) => {
    const guildRoles = await rolesByGuild(guildId)
    .catch((error) => logging.error(__filename, `Error getting all roles from a guild. code": "err_datab_remSets", errCode: "${error.code}", error: "${error}"`));

    if (guildRoles) {
        const guildSettings = await getGuildSettings(guildId)
        .catch((error) => logging.error(__filename, `Error getting settings from a guild. code": "err_datab_getSets", errCode: "${error.code}", error: "${error}"`));

        if (guildSettings) {
            //Check if the guild already has more roles than allowed;
            if (guildRoles.length >= guildSettings.maxRoles) {
                return true;
            } else {
                return false;
            };
        } else {
            return true;
        }
    } else {
        return true;
    };
};