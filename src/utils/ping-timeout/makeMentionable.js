const { getNotMentionableRoles } = require("../database/ping-timeout/makeMentionable")

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

        if(timePassedMin > timeOutTime) {
            try {
                const roleData = client.guilds.cache.get(guildId).roles.cache.get(roleId)
                await roleData.setMentionable(true, 'Timeout done');
            } catch (error) {
                console.log("ERROR - makeMentionable.js | ", error)
                return;
            }
            
        };
    }
}