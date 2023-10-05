const { EmbedBuilder, inlineCode, bold, InviteTargetType, italic } = require("discord.js");

function permsCheck(client, guildId) {
    //permscheck - fullPerms: 277294107648
    const botId = client.user.id;

    if (!botId) return;
    const botUser = client.guilds.cache.get(guildId).members.cache.get(botId);

    const hasRequiredPerms = botUser.permissions.has(277294107648n);

    //embed

    if (hasRequiredPerms) {
        const diagnosticsEmbed = new EmbedBuilder()
        .setColor(0xB000)
        .setTitle('Permission Check')
        .setDescription(':white_check_mark: The bot has all required permissions')
        .setTimestamp();

        return diagnosticsEmbed;
    } else {
        //setup vars for later
        var permissionName= "";
        var hasPermission = "";

        //all required perms
        const permissions = [
            {permName: "Manage Roles" ,permValue: "268435456"},
            {permName: "Read Messages/View Channels" ,permValue: "1024"},
            {permName: "Send Messages" ,permValue: "2048"},
            {permName: "Send Messages in Threads" ,permValue: "274877906944"},
            {permName: "Embed Links" ,permValue: "16384"},
            {permName: "Use External Emojis" ,permValue: "262144"},
            {permName: "Use Slash Commands" ,permValue: "2147483648"},
        ];

        //check every perm
        for (permission of permissions) {
            const hasRequiredPerm = botUser.permissions.has(permission.permValue);

            hasPermission = hasPermission + inlineCode(hasRequiredPerm) + `\n`;

            if (!hasRequiredPerm) {
                permissionName = permissionName + bold(italic(permission.permName)) + `\n`;
            } else {
                permissionName = permissionName + permission.permName + `\n`;
            }
        }



        const diagnosticsEmbed = new EmbedBuilder()
        .setColor(0xC83400)
        .setTitle('Permission Check FAILED')
        .addFields(
            {
                name: 'Permission',
                value: permissionName,
                inline: true,
            },
            {
                name: 'Has Permission',
                value: hasPermission,
                inline: true,
            },
        )
        .setTimestamp();

        return diagnosticsEmbed;
    }
}

module.exports = { 
    permsCheck,
};