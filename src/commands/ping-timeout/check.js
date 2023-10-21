const { EmbedBuilder, inlineCode } = require("@discordjs/builders");

const { roleInDatabase } = require('../../utils/database/ping-timeout/general');
const { PermissionFlagsBits, PermissionsBitField } = require("discord.js");
const { permsCheck } = require("../../utils/ping-timeout/permsCheck");
const { deniedMessage } = require('../../utils/baseUtils/defaultEmbeds');
const { logging } = require('../../utils/baseUtils/logging')

module.exports = {
    name: "check",
    description: "Check what roles are available for a timeout",
    defaultMemberPermissions: PermissionFlagsBits.Administrator,

    //delete: Boolean,
    //devOnly: Boolean,
    //testCommand: Boolean,

    callback: async (client, interaction) => {
        const guildId = interaction.guildId;

        await client.guilds.fetch();
        await client.guilds.cache.get(guildId).roles.fetch()
        const roles = await client.guilds.cache.get(guildId).roles.cache;

        const botId = client.user.id;
        const botUsername = client.user.username

        const everyoneRole = await client.guilds.cache.get(guildId).roles.everyone
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

            var botPermStatus = "";
            //check if the bot has a higher role

            if (!botId) return;

            const botUser = await client.guilds.cache.get(guildId).members.cache.get(botId);

            const botRole = await botUser.roles.cache.find(r => r.tags.botId === botId);

            if (!botRole) {
            interaction.reply({embeds: [deniedMessage("Error! Please report this as a bug")]});

            logging("error", `Could't find managed role. GuildID: ${guildId}`, "check.js/botrole");
            return;
            }
            
            const comparedPos = role[1].comparePositionTo(botRole);

            if (comparedPos < 0) {
                botPermStatus = inlineCode('true') + `\n`;
            } else {
                botPermStatus = inlineCode('false - bot rank too low') + `\n`;
            }

            //check if the bot has required perms
            if (permsCheck(client, guildId).data.color === 13120512) {
                botPermStatus = inlineCode('false - not enough perms') + `\n`;
            }

            canChangeOutput = canChangeOutput + botPermStatus;
        }

        if (!roleOutput) {
            interaction.reply({embeds: [deniedMessage("There are no roles in this server that can be managed by this bot")], ephemeral: true});
            return;
        }

        const embed = new EmbedBuilder()
        .setTitle("Available roles")
        .setFields(
            {name: 'Role(s)', value: roleOutput, inline: true},
            {name: 'Timed Role', value: trackingOutput, inline: true},
            {name: 'Bot Can Manage', value: canChangeOutput, inline: true},
        )
        .setTimestamp();

        await client.guilds.fetch();
        const guild = await client.guilds.cache.get(guildId);
        await guild.members.fetch();
        const user = await guild.members.cache.get(interaction.user.id)
        const userPresence = user.presence?.clientStatus;
        if (userPresence?.mobile) {
            embed.data.footer = {text: "It has been detected that you are using a mobile device. This embed may not show up correctly on your device. Consider using discord on a computer"};  
        };

        interaction.reply({embeds: [embed], ephemeral: true});
    },
};