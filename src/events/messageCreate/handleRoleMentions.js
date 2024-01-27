const { roleInDatabase } = require('../../utils/database/ping-timeout/general');
const { updateLastMentionQuery } = require('../../utils/database/ping-timeout/newMention');

const { databaseRoleErrorState, } = require("../../utils/database/ping-timeout/makeMentionable");


const logging = require('../../utils/baseUtils/logging');
const logTemplate = require('../../utils/baseUtils/logTemplates');

const { PermissionsBitField } = require('discord.js');
const noPermsMessage = require('../../utils/ping-timeout/noPermsMessage');

module.exports = async (client, message) => {
    if(message.author.bot) return; //Check if the author is a bot
    if(!message.mentions.roles.first()) return; //check if the message contains a mention

    //Set some global vars
    const guildId = message.guildId;

    //LATER: Settings option if this process should ignore members with the mention everyone permission

    const mentionedRoles = message.mentions.roles;



    for (const [key, value] of mentionedRoles) {
        const roleId = value.id;

        roleInDatabase(roleId)
        .then((inDatabase) => {
            if (inDatabase) {
                processRole(roleId)
            }
        })
        .catch((error) => logging.error(__filename, `Error while checking if role is in database. roleId: "${roleId}", error: "${error}"`));
    };

    return; //End of normal code 

    function processRole(roleId) {
        logging.globalInfo(__filename, `A Timeout role got mentioned. roleId: ${roleId}`);

        

        client.guilds.fetch(guildId)
        .then((guildObject) => guildObject.roles.fetch(roleId))
        .then((roleObject) => makeRoleUnMentionable(roleObject))
        .catch((error) => logging.error(__filename, `Error fetching guild/role. error: "${error}"`));

        function makeRoleUnMentionable(roleObject) {
            roleObject.setMentionable(false, "Timeout role got mentioned")
            .then(() => {
                logging.globalInfo(__filename, `Timeout role got mentioned and made unmentionable. roleId: "${roleId}", guildId: "${guildId}"`);

                updateLastMentionQuery(roleId)
                .then(() => logging.globalInfo(__filename, `Timeout role got mentioned, made unmentionable and database got updated. roleId: "${roleId}", guildId: "${guildId}"`))
                .catch((error) => {
                    logging.error(__filename, `Error while updating role in database, trying to make role mentionable again. roleId: "${roleId}", guildId: "${guildId}", error: "${error}"`);

                    makeRoleMentionable(roleObject, false);
                })
            })
            .catch((error) => {
                if (error.code === 10011) {
                    logging.globalWarn(__filename, `Tried making a unknown role unmentionable. error: ${error}`);
                } else if (error.code === 50013) {
                    logging.globalInfo(__filename, `Tried making a role unmentionable but the bot doesn't have the perms to do that. roleId: "${roleId}", guildId: "${guildId}"`)
                    	noPermsMessage(client, roleId, guildId, message);
                } else {
                    logging.error(__filename, `Error while making role unmentionable. roleId: "${roleId}", guildId: "${guildId}", error: "${error}"`);
                };

                databaseRoleErrorState(roleId)
                .catch((error) => logging.error(__filename, `Error while updating a role's error state in the database. roleId: "${roleId}", error: "${error}"`));
            });
        };

        function makeRoleMentionable(roleObject) { //To make the role mentionable again in case that the database query fails.
            roleObject.setMentionable(true, "Remade role mentionable due to a database error preveting the bot to work")
            .catch((error) => logging.error(__filename, `Error while remaking a role mentionable due to a database error. roleId: "${roleId}", guildId: "${guildId}", error: "${error}"`));
        };
    };
};