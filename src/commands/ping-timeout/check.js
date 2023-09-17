const { EmbedBuilder, inlineCode } = require("@discordjs/builders");

const { roleInDatabase } = require('../../utils/database/ping-timeout/general');
const { PermissionFlagsBits, PermissionsBitField } = require("discord.js");

module.exports = {
    name: "check",
    description: "Check what roles are available for a timeout",
    defaultMemberPermissions: PermissionFlagsBits.Administrator,

    //delete: Boolean,
    //devOnly: Boolean,
    //testCommand: Boolean,

    callback: async (client, interaction) => {
        const guildId = interaction.guildId;
        const roles = client.guilds.cache.get(guildId).roles.cache;

        const botId = client.user.id;
        const botUsername = client.user.username

        const everyoneRole = client.guilds.cache.get(guildId).roles.everyone
        const everyoneId = everyoneRole.id

        var roleOutput = "";
        var trackingOutput = ""
        var canChangeOutput = "";
        for (const role of roles) {
            if(role[1].id === everyoneId) {
                if (role[1].permissions.has(PermissionFlagsBits.MentionEveryone)) {
                    const newRolePerms = role[1].permissions.remove([PermissionFlagsBits.MentionEveryone]);
                    role[1].setPermissions(newRolePerms, "Bot doesn't function corretly when @everyone can mention all roles");
                };
                continue;
            };
            if(role[1].managed) continue;
            const roleId = role[1].id;

            roleOutput = roleOutput + `<@&${roleId}>` + `\n`;

            //check if the role already is being timed
            const timed = await roleInDatabase(roleId);
            trackingOutput = trackingOutput + inlineCode(timed) + `\n`

            //check if the bot has higher perms
            const botUser = client.guilds.cache.get(guildId).members.cache.get(botId);

            const botRole = botUser.roles.cache.find(r => r.name === botUsername)

            const comparedPos = role[1].comparePositionTo(botRole);

            if (comparedPos < 0) {
                canChangeOutput = canChangeOutput + inlineCode('true') + `\n`;
            } else {
                canChangeOutput = canChangeOutput + inlineCode('false') + `\n`;
            }
        }
        

        const embed = new EmbedBuilder()
        .setTitle("Available roles")
        .setFields(
            {name: 'Role(s)', value: roleOutput, inline: true},
            {name: 'Timed Role', value: trackingOutput, inline: true},
            {name: 'Bot Can Change', value: canChangeOutput, inline: true},
        )
        .setTimestamp();

        interaction.reply({embeds: [embed], ephemeral: true});
    },
};