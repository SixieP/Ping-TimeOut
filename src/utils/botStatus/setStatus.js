const { getAllRoles } = require("../database/botStatus.js/setStatus");
const logging = require("../baseUtils/logging");

module.exports = async (client) => {
    getAllRoles()
    .then((queryOutput) => setTotalRoleStatus(queryOutput))
    .catch((error) => {
        logging.error(__filename, `Error getting total roles. code: "err_datab_roles_get_nr", errCode: "${error.code}"`);
    });
    return;


    //Set the status of the bot
    function setTotalRoleStatus(roles) {
        if (roles[0]) {
            var roleAmounth = roles[0].roles;
        } else {
            var roleAmounth = 0;
        };

        // If more than 1 role you do roles. Otherwise use role.
        if (roleAmounth === 1) {
            client.user.setPresence({ activities: [ {name: `Monitoring ${roleAmounth} role`, type: 4}] });
        } else {
            client.user.setPresence({ activities: [ {name: `Monitoring ${roleAmounth} roles`, type: 4}] });
        };    
    };
};