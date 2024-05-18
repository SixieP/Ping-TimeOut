const { EmbedBuilder } = require("@discordjs/builders");
const { PermissionFlagsBits, PermissionsBitField, ApplicationCommandOptionType } = require("discord.js");

const { rolesByGuild } = require("../../utils/database/ping-timeout/timedRoles");

const { deniedMessage, warnMessage } = require("../../utils/baseUtils/defaultEmbeds");
const defaultMessage = require("../../utils/defaults/messages/defaultMessages");

const logging = require("../../utils/baseUtils/logging");
const logTemplates = require("../../utils/baseUtils/logTemplates");

module.exports = {
    name: "roles",
    description: "All roles that have a timer added to them and the remaining time on them",
    defaultMemberPermissions: PermissionFlagsBits.ManageMessages,
    context: [0],
    options: [
        {
            name: "page",
            description: "The page you want to look at if there are more than 1",
            type: ApplicationCommandOptionType.Integer,
            min_value: 1,
            max_value: 99,
        },
    ],

    //delete: Boolean,
    //devOnly: Boolean,
    //testCommand: Boolean,

    callback: (client, interaction) => {

        // Set some basis variables
        const guildId = interaction.guildId;

        // Setting for the pages
        const defaultPage = 1;
        const maxRolesPerPage = 25;
        const minPage = 1; //Also set in command min_value;
        const maxPage = 99; //Also set in command max_value;

        //Define global vars;
        var requestedPage;
        var totalPages;

        // Get this guilds timed roles from the database
        getGuildsTimedRoles(guildId);

        function getGuildsTimedRoles(guildId) {
            rolesByGuild(guildId)
            .then((roles) => getRolesForPage(roles))
            .catch((response) => {
                logging.verboseWarn(__filename, `Error getting guilds timed roles from database. Error: ${response}`);

                if (response.code === "ECONNREFUSED") {
                    interaction.reply({embeds: [defaultMessage.generalCommandError("Database connection error", "err_3")]})
                    .catch((error) => logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while sending interaction reply", `code: "err_int_reply/err_datab_nocon-rolesByGuild", error: "${error}"`)));
                } else {
                    interaction.reply({embeds: [defaultMessage.generalCommandError("Error getting this servers roles from database", "err_datab_getRoles_byGui")]})
                    .catch((error) => logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while sending interaction reply", `code: "err_int_reply/err_datab_getRoles_byGui", error: "${error}"`)));
                };
            });
        };

        return; //Rest of code will be handled inside functions below.

        //Get the roles that will be shown on the given page
        function getRolesForPage(roles) {

            if (!roles[0]) {
                interaction.reply({embeds: [warnMessage("This server has no timed roles.")]})
                .catch((error) => logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while sending interaction reply", `code: "err_int_reply/inf_roles_noroles", error: "${error}"`)));

                return;
            }


            const totalRolesCount = roles.length;
            totalPages = Math.ceil(totalRolesCount/maxRolesPerPage);

            const requestedPageOption = interaction.options.getInteger("page");
            if (requestedPageOption) {
                requestedPage = requestedPageOption;
            } else {
                requestedPage = defaultPage;
            };

            // Check if the page nr is above the min page limit.
            if (requestedPage < minPage) {
                interaction.reply({embeds: [deniedMessage(`Invalid page! The minimum page value is ${minPage}`)]})
                .catch((error) => logging.warn(__filename, logTemplates.commandInteractionException(interaction, "Error while sending invalid page (min page) reply", `code: "err_int_reply", error: "${error}"`)))

                return;
            };


            //Check if the page value is below the max page limit.
            if (requestedPage > maxPage) {
                interaction.reply({embeds: [deniedMessage(`Invalid page! The maximum page value is ${maxPage}`)]})
                .catch((error) => logging.warn(__filename, logTemplates.commandInteractionException(interaction, "Error while sending invalid page (max page) reply", `code: "err_int_reply", error: "${error}"`)))

                return;
            };

            //Check if the page value exists within the total pages
            if (requestedPage > totalPages) {
                interaction.reply({embeds: [deniedMessage(`This page doesn't exist!`)]})
                .catch((error) => logging.warn(__filename, logTemplates.commandInteractionException(interaction, "Error while sending invalid page (totalPages <) reply", `code: "err_int_reply", error: "${error}"`)))

                return;
            };

            const startValue = -maxRolesPerPage+maxRolesPerPage*requestedPage;
            const endValue = startValue+maxRolesPerPage;

            const rolesForPage = Object.values(roles).slice(startValue, endValue); //The roles to use for a set page

            createData(rolesForPage);
        }

        function createData(rolesForPage) {
            // Some general vars
            const dateNowMs = Date.now().valueOf();
            const dateNowSec = dateNowMs/1000;
            const dateNowSecRounded = Math.ceil(dateNowSec);


            // Arrays that will contain the data
            var roleNameOutput = [];
            var timeoutTimeOutput = [];
            var lastMentionAndRestTimeOutput = [];

            for (const role of rolesForPage) {

                //Create the role data
                const timeoutRoleId = role.roleId;

                const formattedRole = `<@&${timeoutRoleId}>`;
                roleNameOutput.push(formattedRole);

                //Create the timeout duration data
                const timeoutTimeMin = role.timeoutTime;
                const timeoutTimeSec = timeoutTimeMin*60;

                timeoutTimeOutput.push(secondsToDhms(timeoutTimeSec));

                //Create the last mention/rest time output
                const roleMentionable = role.mentionable;

                const lastMentionRaw = role.lastMention; //The raw output from the database

                const lastMentionDate = new Date(role.lastMention);
                const lastMentionDateMs = lastMentionDate.valueOf();
                const lastMentionDateSec = lastMentionDateMs/1000;

                var lastMention = "";
                var restTime = "";

                if (lastMentionRaw) {
                    lastMention = `<t:${lastMentionDateSec}:f>`;
                } else {
                    lastMention = "--:--";
                };

                if (roleMentionable === 0) { //If not mentionable = rest time active
                    const timeoutEndTimeSec = lastMentionDateSec + timeoutTimeSec;

                    if (timeoutEndTimeSec > dateNowSecRounded) { //If the rest time if higher than the current time. Otherwise it points to an error with the bot perms.
                        const roundToNearestMinSecs = 60-timeoutEndTimeSec%60;

                        restTime = `<t:${timeoutEndTimeSec+roundToNearestMinSecs}:R>`;
                    } else {
                        restTime = "Bot perms err";
                    };

                    
    
                } else {
                    restTime = "--:--";
                };

                lastMentionAndRestTimeOutput.push(`${lastMention} | ${restTime}`);
            };

            const createdData = [
                {name: "roleNameOutput", value: roleNameOutput},
                {name: "timeoutTimeOutput", value: timeoutTimeOutput},
                {name: "lastMentionAndRestTimeOutput", value: lastMentionAndRestTimeOutput}
            ];

            createEmbedAndSend(createdData);
        };

        function createEmbedAndSend(createdData) {
            const roleNameOutput = createdData[0];
            const timeoutTimeOutput = createdData[1];
            const lastMentionAndRestTimeOutput = createdData[2];

            const roleNamesString = objectToNewlineString(roleNameOutput);
            const timeoutTimeString = objectToNewlineString(timeoutTimeOutput);
            const lastMentionAndRestTimeString = objectToNewlineString(lastMentionAndRestTimeOutput);

            const embed = new EmbedBuilder()
            .setTitle("Timed Roles")
            .addFields(
                {name: "Role", value: roleNamesString, inline: true},
                {name: "Duration", value: timeoutTimeString, inline: true},
                {name: "Last Mention | Rest Time", value: lastMentionAndRestTimeString, inline: true}
            )
            .setFooter({text: `Page ${requestedPage}/${totalPages}`})
            .setTimestamp();

            interaction.reply({embeds: [embed]})
            .catch((error) => logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while sending interaction reply", `Error: "${error}"`)));
        };


    },
};

//Transform the array you get with data to a string with every array value being a new line
function objectToNewlineString (array) {
    const string = array.value.toString();
    const newLineString = string.replace(/,/g, "\n");

    return newLineString.slice(0, 1024);
}

function secondsToDhms(seconds) {
    seconds = Number(seconds);
    var d = Math.floor(seconds / (3600*24));
    var h = Math.floor(seconds % (3600*24) / 3600);
    var m = Math.floor(seconds % 3600 / 60);
    var s = Math.floor(seconds % 60);
    
    var dDisplay = d > 0 ? d + (d == 1 ? " day " : " days ") : "";
    var hDisplay = h > 0 ? h + (h == 1 ? " hour " : " hours ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " minute " : " minutes ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " second " : " seconds ") : "";

    const output = dDisplay + hDisplay + mDisplay + sDisplay;;
    return output.trim();
}