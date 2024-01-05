const { roleInDatabase } = require("../../utils/database/ping-timeout/general");
const { removeTimeoutRole } = require("../../utils/database/ping-timeout/roleCommand");

const logging = require('../../utils/baseUtils/logging');

module.exports = async (client, role) => {
    const roleId = role.id;

    timedRole = await roleInDatabase("", roleId);

    if (!timedRole) return;

    logging.globalInfo(__filename, `Ping TimeOut role got deleted from guild. Going to try to remove it from the database. roleId: ${roleId}`);

    const databaseResponse = removeTimeoutRole(roleId);
    if (databaseResponse === "success") {
        logging.globalInfo(__filename, `Role removed from database. roleId: ${roleId}`);
    } else {
        logging.error(__filename, `Couldn't remove role from database. roleId: ${roleId}, error: ${databaseResponse}`);
    };
}