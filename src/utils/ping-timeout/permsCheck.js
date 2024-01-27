const { EmbedBuilder, inlineCode, bold, italic, PermissionFlagsBits } = require("discord.js");
const logging = require('../baseUtils/logging');

async function permsCheck(guildObject) {
    logging.globalInfo(__filename, `Executing permsCheck code. guildId: "${guildObject?.id}"`);

    //Get information about the bot user
    const guildMembersObject = guildObject.members;
    const clientUserObject = guildMembersObject.me;

    const requiredPerms = [
        PermissionFlagsBits.ManageRoles,
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.SendMessagesInThreads,
        PermissionFlagsBits.EmbedLinks,
        PermissionFlagsBits.UseExternalEmojis,
        PermissionFlagsBits.UseApplicationCommands
    ];

    const hasRequiredPerms = clientUserObject.permissions.has(requiredPerms);

    //embed

    if (hasRequiredPerms) {
        const diagnosticsEmbed = new EmbedBuilder()
        .setColor(0X5bf531)
        .setTitle('Permission Check - Success')
        .setDescription(":white_check_mark: The bot has all required permissions")
        .setTimestamp();

        return diagnosticsEmbed;
    } else {
        //setup vars for later
        var permissionName= "";
        var hasPermission = "";

        //all required perms
        const permissions = [
            {permName: "Manage Roles" ,permValue: PermissionFlagsBits.ManageRoles},
            {permName: "Read Messages/View Channels" ,permValue: PermissionFlagsBits.ViewChannel},
            {permName: "Send Messages" ,permValue: PermissionFlagsBits.SendMessages},
            {permName: "Send Messages in Threads" ,permValue: PermissionFlagsBits.SendMessagesInThreads},
            {permName: "Embed Links" ,permValue: PermissionFlagsBits.EmbedLinks},
            {permName: "Use External Emojis" ,permValue: PermissionFlagsBits.UseExternalEmojis},
            {permName: "Use Slash Commands" ,permValue: PermissionFlagsBits.UseApplicationCommands},
        ];

        //check every perm
        for (const permission of permissions) {
            const hasRequiredPerm = clientUserObject.permissions.has(permission.permValue);

            hasPermission = hasPermission + inlineCode(hasRequiredPerm) + `\n`;

            if (!hasRequiredPerm) {
                permissionName = permissionName + bold(italic(permission.permName)) + `\n`;
            } else {
                permissionName = permissionName + permission.permName + `\n`;
            }
        }



        const diagnosticsEmbed = new EmbedBuilder()
        .setColor(0Xeb4c34)
        .setTitle('Permission Check - FAILED')
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