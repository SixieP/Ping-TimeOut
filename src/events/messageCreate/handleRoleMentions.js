const { roleInDatabase } = require('../../utils/database/ping-timeout/general');
const { updateLastMention } = require('../../utils/database/ping-timeout/newMention');



const logging = require('../../utils/baseUtils/logging');
const logTemplate = require('../../utils/baseUtils/logTemplates');

const { PermissionFlagsBits, PermissionsBitField } = require('discord.js');
const noPermsMessage = require('../../utils/ping-timeout/noPermsMessage');

module.exports = async (client, message) => {
    if(message.author.bot) return;

    //check if the message contains a mention
    if(!message.mentions.roles.first()) return;

    logging.globalInfo(__filename, logTemplate.messageInteractionCreate(message));
    const guildId = message.guildId;

    // Check if the user has the mention everyone permission
    const member = message.member;

    if (member.permissions.has(PermissionsBitField.Flags.MentionEveryone)) {
        logging.globalInfo(__filename, logTemplate.messageInteractionCustomInfo(message, "User with mention everyone perms mentioned a role"));

        return;
    }


    logging.globalInfo(__filename, logTemplate.messageInteractionCustomInfo(message, "User without mention everyone perms mentioned a role"));


    const mentionedRoles = message.mentions.roles.catch(error => {
        logging.error(__filename, logTemplate.messageInteractionCustomInfo(message, "Error catching mentioned roles in message"));
        return;
    });
    
    for(mentionedRole of mentionedRoles) {
       const roleId = (mentionedRole[1].id);

        const inDatabase = await roleInDatabase(roleId);
        if (inDatabase === true) {

            logging.globalInfo(__filename, logTemplate.messageInteractionCustomInfo(message, "A timed role got mentioned", `RoleId: ${roleId}`));

            //Catch the mentioned role.
            message.guild.roles.fetch(roleId)
            .then(() => role.setMentionable(false, "Ping TimeOut role got mentioned. Made unmentionable"))
            .then(() => logging.globalInfo(__filename, logTemplate.messageInteractionCustomInfo(message, "Made role unmentionable", `roleId: ${roleId}`)))
            .then(() => {
                updateLastMention(role.id, new Date(), "false"); //Set the mentionable state in the database to false
                logging.globalInfo(__filename, logTemplate.messageInteractionCustomInfo(message, "Set the mentionable state in the database to 'False'", `roleId: ${role.id}`));
            })
            .catch(error => {
                if (error.code === 10011) { //Unknown role
                    logging.globalWarn(__filename, logTemplate.messageInteractionCustomInfo(message, 'Known error "Unkown role" while: catching a role by id/making unmentionable;', `guildId: ${guildId}, roleId: ${roleId}, error: ${error}`));
                    return;
                } else if (error.code === 50013) { //You lack permissions to perform that action
                    logging.globalWarn(__filename, logTemplate.messageInteractionCustomInfo(message, 'Known error "You lack permissions to perform that action" while making a role unmentionable;', `guildId: ${guildId}, roleId: ${roleId}, error: ${error}`));
                    noPermsMessage(client, role.id, guildId, message);
                    return;
                } else { //When a not expected error happens
                    logging.warn(__filename, logTemplate.messageInteractionCustomInfo(message, "Unexpected error while making role unmentionable", `guildId: ${guildId}, roleId: ${roleId}, error: ${error}`))
                    return;
                }
            });
        }
    }


}