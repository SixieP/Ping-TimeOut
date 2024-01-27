const logging = require("../baseUtils/logging");
const { getNotMentionableRoles, databaseRoleErrorState, updateSetMentionable } = require("../database/ping-timeout/makeMentionable");
const noPermsMessage = require("./noPermsMessage");

const { removeAllGuildRoles } = require("../database/guildDelete/removeRoles");

const groupBy = require('lodash/groupBy');

module.exports = async (client) => {

    const curDate = new Date();
    const curDateMs = Date.parse((curDate)?.toUTCString());
    const curDateSec = curDateMs/1000;
    
    getNotMentionableRoles()
    .then((notMentionableRoles) => sortRolesByGuild(notMentionableRoles))
    .catch((error) => logging.error(__filename, `Error while getting not mentionable roles. error: "${error}"`));

    function sortRolesByGuild(notMentionableRoles) {
        const groupedRoles = groupBy(notMentionableRoles, 'guildId');

        const groupedRolesValue = Object.values(groupedRoles);

        for (const roles of groupedRolesValue) {
            const guildId = roles[0].guildId;
            client.guilds.fetch(guildId)
            .then((guildObject) => {
                for (const role of roles) {
                    const roleId = role.roleId;
                    const timeoutTime = role.timeoutTime;
                    const timeoutTimeSec = timeoutTime*60;
                    const lastMentioneDate = role.lastMention;

                    const mentioneDateMs = Date.parse((lastMentioneDate)?.toUTCString());
                    const mentioneDateSec = mentioneDateMs/1000;

                    const timeoutExpireTime = mentioneDateSec+timeoutTimeSec;
                    const timeoutRestSec = 60 - timeoutExpireTime % 60;
                    const roundedExpireTime = timeoutRestSec + timeoutExpireTime;
                
                    if (curDateSec > (roundedExpireTime - 1)) {
                        guildObject.roles.fetch(roleId)
                        .then((roleObject) => {
                            makeRoleMentionable(roleObject)
                        })
                        .catch((error) => logging.error(__filename, `Error while fetching role. code: "err_rolefetch", guildId: "${guildId}", roleId: "${roleId}", error: "${error}"`));
                    }; 
                };
            })
            .catch((error) => {
                if (error.code === 10004) {
                    logging.globalWarn(__filename, `guild not found during fetching. Meaning it doesn't exist anymore, deleting all roles from this guild. guildId: "${guildId}", error: "${error}"`)

                    removeAllGuildRoles(guildId)
                    .catch((error) => logging.error(__filename, `Error while deleting all roles from a guild that is gone. code: "err_datab_dellAllRoles", guildId: "${guildId}", error: "${error}"`));
                } else {
                    logging.error(__filename, `Error while fetching guild. code: "err_guildfetch", guildId: "${guildId}", error: "${error}"`);
                };
            });
        };
    };

    function makeRoleMentionable(roleObject) {
        const roleId = roleObject.id;
        const guildId = roleObject.guild.id;

        roleObject.setMentionable(true, "Timeout expired. Can be mentioned by everyone again.")
        .then(() => {
            logging.globalInfo(__filename, `Made a role mentionable gain. roleId: ${roleId}`);

            databaseRoleErrorState(roleId, false)
            .catch((error) => logging.error(__filename, `Error while updating a role's error state in the database. roleId: "${roleId}", error: "${error}"`));

            updateRoleInDatabase(roleId, roleObject)
        })
        .catch((error => {
            if (error.code === 50013) {
                noPermsMessage(client, roleId, guildId);
            } else {
                logging.error(__filename, `Error while making a role mentionable. code: "err_role_updaMentio", guildId: "${guildId}", roleId: "${roleId}", error: "${error}"`);
            };

            databaseRoleErrorState(roleId)
            .catch((error) => logging.error(__filename, `Error while updating a role's error state in the database. roleId: "${roleId}", error: "${error}"`));
        }))
    };

    function updateRoleInDatabase(roleId, roleObject) {
        updateSetMentionable(roleId)
        .then(() => logging.verboseInfo(__filename, `Successfully made this role mentionable and edited the database. roleId: "${roleId}"`))
        .catch((error) => {
            logging.error(__filename, `Error while updating role in database to mentionable. code: "err_datab_updRol", roleId: "${roleId}"`);

            //LATER: Give error to server that this role won't function until this is resolved.

            databaseRoleErrorState(roleId)
            .catch((error) => logging.error(__filename, `Error while updating a role's error state in the database. roleId: "${roleId}", error: "${error}"`));
        });
    };
};