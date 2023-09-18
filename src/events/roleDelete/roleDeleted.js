const { removeAllGuildRoles } = require("../../utils/database/guildDelete/removeRoles");
const { roleInDatabase } = require("../../utils/database/ping-timeout/general");
const { removeTimeoutRole } = require("../../utils/database/ping-timeout/roleCommand");

module.exports = async (client, role) => {
    const roleId = role.id;

    timedRole = await roleInDatabase(roleId);

    if (!timedRole) return;

    removeTimeoutRole(roleId);
}