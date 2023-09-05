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

        const everyoneRole = client.guilds.cache.get(guildId).roles.everyone
        const everyoneId = everyoneRole.id

        var roleOutput = "";
        var trackingOutput = ""
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
        }

        const embed = new EmbedBuilder()
        .setTitle("Available roles")
        .setFields(
            {name: 'Role(s)', value: roleOutput, inline: true},
            {name: 'Timed', value: trackingOutput, inline: true}
        )
        .setTimestamp();

        interaction.reply({embeds: [embed], ephemeral: true});
    },
};