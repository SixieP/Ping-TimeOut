const { roleInDatabase } = require('../../utils/database/ping-timeout/general');
const { updateLastMention } = require('../../utils/database/ping-timeout/newMention');

const {logging} = require('../../utils/baseUtils/logging');
const { PermissionFlagsBits } = require('discord.js');
const noPermsMessage = require('../../utils/ping-timeout/noPermsMessage');

module.exports = async (client, message) => {
    if(message.author.bot) return;

    //check if the message contains a mention
    if(!message.mentions.roles.first()) return;

    const guildId = message.guildId;

    const roles = message.member.roles.cache;

    var mentionEveryonePerms = false;
    for (role of roles) {
        if (role[1].permissions.has(PermissionFlagsBits.MentionEveryone)) {

            logging("handleRoleMentions.js", `${guildId} | a role has been mentioned by a user that does have the mention everyone perms`, "mentionEveryone-perms", true)
            mentionEveryonePerms = true;
        }
    }

    //DISABLED - thinking about it
    //if (mentionEveryonePerms) return;
    logging("handleRoleMentions.js", `${guildId} | a role has been mentioned by a user that doesnt have the mention everyone perms`, "mentionEveryone-perms", true)


    const mentionedRoles = message.mentions.roles;
    for(mentionedRole of mentionedRoles) {
       const roleId = (mentionedRole[1].id);

        const inDatabase = await roleInDatabase(roleId);
        if (inDatabase === true) {
            const nowUTC = new Date();

            //make the role not mentionable
            role = await client.guilds.cache.get(guildId).roles.fetch(roleId).catch(error => {
                logging("handleRoleMentions.js", error, "error", true)
                return;
            });

            if (role) {
                const setMentionRes = await role.setMentionable(false, "Role got mentioned").catch(error => {
                    if (error.code === 50013) {
                        logging("INFO", error, "handleRoleMentions.js/setMentionable", true);
                        noPermsMessage(client, roleId, guildId, message);
                        return;
                    } else {
                        logging("ERROR", error, "handleRoleMentions.js/setMentionable");
                        return;
                    }
                });
                if (!setMentionRes) return;

                //update database query
                updateLastMention(roleId, nowUTC, "false");

                logging("handleRoleMentions.js", `${guildId} | role got mentioned and has been made publicly unmentionable`, "unmentionable", true)
            } else {
                logging("handleRoleMentions.js", `${guildId} | role got mentioned and should have made not mentionable but that didnt happen`, "unmentionable", true)
            }


        }
    }


}