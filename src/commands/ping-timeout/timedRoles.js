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
    //testCommand: Boolean,

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
        var lastMentionAndRestTime = "";
        var timeout = "";

        for (const timedRole of timedRoles) {
            const mentionDateMs = Date.parse((timedRole.lastMention)?.toUTCString());
            const mentionDateSec = mentionDateMs/1000
            const timeNow = Date.parse(new Date().toUTCString());
            const timePassedMs = timeNow-mentionDateMs;
            const timePassedSec = timePassedMs/1000;
            const timePassedMin = timePassedSec/60;

            const timeoutMin = timedRole.timeoutTime;
            const timeoutSec = timeoutMin*60;
            
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
            if (timedRole.lastMention) {
                lastMentionAndRestTime = lastMentionAndRestTime + `<t:${mentionDateSec}:f> | ${restTime}\n`
            } else {
                lastMentionAndRestTime = lastMentionAndRestTime + `${inlineCode('No Mention')} | ${restTime}\n`
            }
            timeout = timeout + `${secondsToDhms(timeoutSec)}\n`
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
                name: "Timeout",
                value: timeout,
                inline: true,
            },
            {
                name: "Last Mention | Rest Time",
                value: lastMentionAndRestTime,
                inline: true,
            },
        )

        interaction.reply({embeds: [embed], ephemeral: true})
    },
};

function secondsToDhms(seconds) {
    seconds = Number(seconds);
    var d = Math.floor(seconds / (3600*24));
    var h = Math.floor(seconds % (3600*24) / 3600);
    var m = Math.floor(seconds % 3600 / 60);
    var s = Math.floor(seconds % 60);
    
    var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
    var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    return dDisplay + hDisplay + mDisplay + sDisplay;
    }