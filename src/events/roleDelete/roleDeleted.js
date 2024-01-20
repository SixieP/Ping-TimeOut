const { roleInDatabase } = require("../../utils/database/ping-timeout/general");
const { removeTimedRoleQuery } = require("../../utils/database/ping-timeout/roleCommand");

const logging = require('../../utils/baseUtils/logging');

module.exports = (client, role) => {
    const roleId = role.id;

    roleInDatabase(roleId)
    .then((result) => {
        if (result) {
            removeRole()
        };
    })
    .catch((error) => logging.error(__filename, `Error getting role from database. code: "err_datab_getRole", error: "${error}"`));

    return; //End of normal code. Rest will be below in functions

    function removeRole() {
        removeTimedRoleQuery(roleId)
        .then(() => logging.globalInfo(__filename, `Successfully removed a role that got remove from discord. roleId: ${roleId}`))
        .catch((error) => logging.error(__filename, `Error removing role that got removed from discord. error: ${error}`));
    };
};