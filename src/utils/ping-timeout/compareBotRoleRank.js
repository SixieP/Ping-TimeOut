module.exports = (client, guildId, roleId) => {
    const role = client.guilds.cache.get(guildId).roles.cache.get(roleId);

    const botId = client.user.id;
    const botUsername = client.user.username;

    const botUser = client.guilds.cache.get(guildId).members.cache.get(botId);
    const botRole = botUser.roles.cache.find(r => r.name === botUsername)

    const comparedPos = role.comparePositionTo(botRole);

    return comparedPos;
}