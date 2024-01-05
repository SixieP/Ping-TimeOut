const { EmbedBuilder, inlineCode } = require("@discordjs/builders");

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

        timedRoles = await rolesByGuild(interaction, guildId);
        

        if (timedRoles === "noDataError") {
            interaction.reply({embeds: [deniedMessage("There are no timed roles")], ephemeral: true});
            return;
        }
        if (timedRoles === "error") {
            interaction.reply({embeds: [deniedMessage("Database error. Please try again later and/or contact the bots owner")], ephemeral: true});
            return;
        }

        var role = "";
        var time = "";
        var lastMentionAndRestTime = "";
        var timeout = "";
        var oldTimeOut = false;

        for (const timedRole of timedRoles) {
            const dateNowMs = Date.now().toString();
            const dateNowSec = dateNowMs/1000;

            const mentionDateMs = Date.parse((timedRole.lastMention)?.toUTCString());
            const mentionDateSec = mentionDateMs/1000
            const mentionable = timedRole.mentionable;

            const timeoutMin = timedRole.timeoutTime;
            const timeoutSec = timeoutMin*60;
            
            const timeOutTime = timedRole.timeoutTime;
            const roleId = timedRole.roleId

            var restTime;
            if (mentionable === 1) {
                restTime = "--:--";
            } else {
                if (!timedRole.lastMention) {
                    restTime = inlineCode("--:--");
                } else {
                    restTime = `<t:${mentionDateSec+timeOutTime*60}:R>`;

                    if (dateNowSec > mentionDateSec+timeoutSec) {
                        oldTimeOut = true;
                    }
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
                value: inlineCode(timeout),
                inline: true,
            },
            {
                name: "Last Mention | Rest Time",
                value: lastMentionAndRestTime,
                inline: true,
            },
        )

        const user = client.guilds.cache.get(guildId).members.cache.get(interaction.user.id);
        const userPresence = user.presence?.clientStatus;
        if (userPresence?.mobile) {
            embed.data.footer = {text: "It has been detected that you are using a mobile device. This embed may not show up correctly on mobile devices. Consider using discord on a computer"};  
        };
        if (oldTimeOut) {
            embed.data.footer = {text: "One of your roles is showing a rest time that is in the past. If this is less than a minute please try again in a bit. If not it means that the bot doesn't have the perms to make that role mentionable again. Use /check to see if that is the case."};  
        }

        interaction.reply({embeds: [embed], ephemeral: true})
    },
};

function secondsToDhms(seconds) {
    seconds = Number(seconds);
    var d = Math.floor(seconds / (3600*24));
    var h = Math.floor(seconds % (3600*24) / 3600);
    var m = Math.floor(seconds % 3600 / 60);
    var s = Math.floor(seconds % 60);
    
    var dDisplay = d > 0 ? d + (d == 1 ? " day" : " days") : "";
    var hDisplay = h > 0 ? h + (h == 1 ? " hour" : " hours") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " minute" : " minutes") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    return dDisplay + hDisplay + mDisplay + sDisplay;
    }