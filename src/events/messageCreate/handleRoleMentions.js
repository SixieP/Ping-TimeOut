const { roleInDatabase } = require('../../utils/database/ping-timeout/general');
const { updateLastMention } = require('../../utils/database/ping-timeout/newMention');

module.exports = async (client, message) => {
    if(message.author.bot) return;
    const guildId = message.guildId;

    const mentionedRoles = message.mentions.roles;
    for(mentionedRole of mentionedRoles) {
       const roleId = (mentionedRole[1].id);

        const inDatabase = await roleInDatabase(roleId);
        if (inDatabase !== true) return;

        const nowUTC = new Date();

        updateLastMention(roleId, nowUTC, "false");

        //make the role not mentionable
        role = await client.guilds.cache.get("827809152742719489").roles.fetch(roleId).catch(error => {
            console.log("handleRoleMentions.js", error);
        });
        if (role) {
            role.setMentionable(false, "Role got mentioned").catch(error => {
                console.log("handleRoleMentions.js", error)
            });
        }
    }


}