const logging = require("../baseUtils/logging");
const { getNotMentionableRoles, databaseRoleErrorState, updateSetMentionable } = require("../database/ping-timeout/makeMentionable");
const noPermsMessage = require("./noPermsMessage");

module.exports = async (client) => {
    const roles = await getNotMentionableRoles("", "");

    if (roles === "err_ECONNREFUSED" || roles === "err_error") {
        logging.error(__filename, "Database error while getting not mentionabel roles.");
        return;
    };

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
            logging.globalInfo(__filename, `Role timeout expired. roleId: ${roleId}`)
                client.guilds.cache.get(guildId).roles.cache.get(roleId)
                .then(role => role.setMentionable(true, "Timeout expired, role can be mentioned by everyone again."))
                .then(() => {
                    logging.globalInfo(__filename, `Made role mentionable again after timeout expired. roleId: ${role.id}`);
                })
                .then(roleId => {
                    logging.globalInfo(__filename, `Set role to mentionable in database. roleId: ${roleId}`);
                    updateSetMentionable(roleId);
                })
                .catch(error => {
                    if (error.code === 10011) { //Unknown role
                        logging.globalWarn(__filename, logTemplate.messageInteractionCustomInfo(message, 'Known error "Unkown role" while: catching a role by id/making it mentionable;', `guildId: ${guildId}, roleId: ${roleId}, error: ${error}`));
                        return;
                    } else if (error.code === 50013) { //You lack permissions to perform that action
                        logging.globalWarn(__filename, logTemplate.messageInteractionCustomInfo(message, 'Known error "You lack permissions to perform that action" while making a role mentionable;', `guildId: ${guildId}, roleId: ${roleId}, error: ${error}`));

                        //Set the role in error state if it wasn't already
                        if (errorState === 0) {
                            databaseRoleErrorState(roleId, true);
                            noPermsMessage(client, roleId, guildId);
                        };

                        return;
                    } else { //When a not expected error happens
                        logging.warn(__filename, logTemplate.messageInteractionCustomInfo(message, "Unexpected error while making role mentionable", `guildId: ${guildId}, roleId: ${roleId}, error: ${error}`))
                        return;
                    }
                });;      
        };
    }
}