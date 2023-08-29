const { EmbedBuilder, inlineCode } = require("@discordjs/builders");

const { roleInDatabase } = require('../../utils/database/ping-timeout/general');
const { PermissionFlagsBits, PermissionsBitField } = require("discord.js");
const { rolesByGuild } = require("../../utils/database/ping-timeout/timeRoles");
const { deniedMessage } = require("../../utils/baseUtils/defaultEmbeds");

module.exports = {
    name: "roles",
    description: "All roles that have a timer added to them and the remaining time on them",
    defaultMemberPermissions: PermissionFlagsBits.ManageMessages,

    //delete: Boolean,
    //devOnly: Boolean,
    testCommand: Boolean,

    callback: async (client, interaction) => {
        const guildId = interaction.guildId;

        timedRoles = await rolesByGuild(guildId);
        

        if (timedRoles === "noDataError") {
            interaction.reply({embeds: [deniedMessage("There are no roles with a timer")], ephemeral: true});
            return;
        }
        if (timedRoles === "error") {
            interaction.reply({embeds: [deniedMessage("Database error. Please try again later and/or contact the bot owner")], ephemeral: true});
            return;
        }

        var role = "";
        var time = "";
        var mention = "";

        for (const timedRole of timedRoles) {
            const mentionDateMs = Date.parse((timedRole.lastMention)?.toUTCString());
            const mentionDateSec = mentionDateMs/1000
            const timeNow = Date.parse(new Date().toUTCString());
            const timePassedMs = timeNow-mentionDateMs;
            const timePassedSec = timePassedMs/1000;
            const timePassedMin = timePassedSec/60;
            
            const timeOutTime = timedRole.timeoutTime;
            const roleId = timedRole.roleId

            var restTime;
            if (timePassedMin > timeOutTime) {
                restTime = "--:--";
            } else {
                if (!timedRole.lastMention) {
                    restTime = "--:--";
                } else {
                    restTime = `<t:${mentionDateSec+timedRole.timeoutTime*60}:R>`;
                }
            }

            role = role + `<@&${roleId}>\n`;
            time = time + `${restTime}\n`
            mention = mention + `<t:${mentionDateSec}:f>\n`
        }

        const embed = new EmbedBuilder()
        .setTitle("Timed Roles")
        .addFields(
            {
                name: "Role",
                value: role,
                inline: true,
            },
            {
                name: "Last Mention",
                value: mention,
                inline: true,
            },
            {
                name: "Timer",
                value: time,
                inline: true
            },
        )

        interaction.reply({embeds: [embed], ephemeral: true})
    },
};