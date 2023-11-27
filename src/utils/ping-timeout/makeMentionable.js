const logging = require("../baseUtils/logging");
const { getNotMentionableRoles, databaseRoleErrorState, updateSetMentionable } = require("../database/ping-timeout/makeMentionable");
const noPermsMessage = require("./noPermsMessage");

module.exports = async (client) => {
    logging.background("Start makeMentonable.js script", __filename);
    const roles = await getNotMentionableRoles();

    for (const role of roles) {
        const mentionDate = Date.parse((role.lastMention).toUTCString());
        const timeNow = Date.parse(new Date().toUTCString());
        const timePassedMs = timeNow-mentionDate;
        const timePassedSec = timePassedMs/1000;
        const timePassedMin = timePassedSec/60;
        
        const timeOutTime = role.timeoutTime;
        const guildId = role.guildId;
        const roleId = role.roleId
        const errorState = role.inError;

        if(timePassedMin > timeOutTime) {
            try {
                const roleData = client.guilds.cache.get(guildId).roles.cache.get(roleId)
                await roleData.setMentionable(true, 'Timeout done');

                await updateSetMentionable(roleId);

                logging.background(`Made role ${roleId} mentionable`, __filename);
            } catch (error) {
                if (error.code === 50013) {
                    databaseRoleErrorState(roleId, true);
                    
                    if (errorState === 0) {
                        noPermsMessage(client, roleId, guildId);
                    };

                    logging.verboseWarn(JSON.stringify({"GuildId": guildId, "roleId": roleId, "ErrorState": errorState}), `${__filename} - Trying to make a role mentionable while the bot doesn't have the required permissions.`);
                    return;
                } else {
                    logging.error(`${JSON.stringify({"GuildId": guildId, "roleId": roleId, "ErrorState": errorState, "ErrorCode": error.code})} | ${error}`, `${__filename} - Trying to make a role mentionable`)
                    return;
                }
            }
            
        };
    }
    logging.background("End makeMentonable script", __filename);
}