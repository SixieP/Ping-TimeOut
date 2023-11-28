const { logging } = require("../baseUtils/logging");

module.exports = (client, guildId, roleId) => {
    const role = client.guilds.cache.get(guildId).roles.cache.get(roleId);

    const botId = client.user.id;
    const botUsername = client.user.username;

    if (!botId) return;
    const botUser = client.guilds.cache.get(guildId).members.cache.get(botId);

    const botRole = botUser.roles.cache.find(r => r.tags.botId === botId);

    if (!botRole) {
    logging("error", `Could't not find managed role. GuildID: ${guildId}`, "check.js/botrole");
    return 99;
    }

    const comparedPos = role.comparePositionTo(botRole);

    return comparedPos;
}