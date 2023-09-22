const { logging } = require("../baseUtils/logging");
const { getNotMentionableRoles, databaseRoleErrorState } = require("../database/ping-timeout/makeMentionable");
const noPermsMessage = require("./noPermsMessage");

module.exports = async (client) => {
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
            } catch (error) {
                if (error.code === 50013) {
                    databaseRoleErrorState(roleId, true);
                    
                    if (errorState === 0) {
                        noPermsMessage(client, roleId, guildId);
                    };

                    logging("INFO", error, "makeMentionable.js/setMentionable", true);
                    return;
                } else {
                    logging("ERROR", error, "makeMentionable.js/setMentionable");
                    return;
                }
            }
            
        };
    }
}