const { getAllRoles } = require("../database/botStatus.js/setStatus");

module.exports = async (client) => {
    var roleAmounth = 0;
    console.log(new Date().getMinutes());

    roles = await getAllRoles();
    if (roles[0]) {
        roleAmounth = roles[0].roles
    }

    client.user.setPresence({ activities: [ {name: `Monitoring ${roleAmounth} role(s)`, type: 4}] })
}