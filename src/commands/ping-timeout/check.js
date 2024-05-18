const { EmbedBuilder } = require("@discordjs/builders");

const { roleInDatabase } = require('../../utils/database/ping-timeout/general');
const { PermissionFlagsBits, ApplicationCommandOptionType } = require("discord.js");

const logging = require('../../utils/baseUtils/logging');
const logTemplates = require('../../utils/baseUtils/logTemplates');

const { deniedMessage } = require("../../utils/baseUtils/defaultEmbeds");
const defaultMessage = require('../../utils/defaults/messages/defaultMessages');

module.exports = {
    name: "check",
    description: "Check what roles are available for a timeout",
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
    context: [0],
    options: [
        {
            name: "page",
            description: "The page you want to see if there are more than one",
            type: ApplicationCommandOptionType.Integer,
            min_value: 1,
            max_value: 99
        }
    ],

    //delete: Boolean,
    //devOnly: Boolean,
    //testCommand: Boolean,

    callback: async (client, interaction) => {
        //Get the first basic vars
        const guildId = interaction.guildId;
        const guildObject = interaction.guild;

        const defaultPage = 1;
        const maxRolesPerPage = 25;
        const minPage = 1; //Also set in command min_value;
        const maxPage = 99; //Also set in command max_value;

        // Check if the guild is availabe (if the guild server isn't offline)
        if (!guildObject.available) {
            logging.verboseWarn(__filename, logTemplates.commandInteractionException(interaction, "Guild not availabe", `guildId: ${guildId}, errId: "err_Check_Unavail_Guild"`));

            //Try sending error reply (could fail cause the guild is not availabe)
            interaction.reply({embeds: [defaultMessage.generalCommandError("Guild not availabe. Possible discord server outage", "err_Check_Unavail_Guild")], ephemeral: true})
            .catch(error => {
                logging.globalWarn(__filename, 
                    logTemplates.commandInteractionException(
                        interaction, 
                        "Tried to send guild unavailable interaction reply. Error could be expected.", 
                        `guildId: ${guildId}, errId: "err_Check_Unavail_Guild", error: ${error}`
                        )
                    );
            });
            
            return;
        };


        //Get the rest of all required vars
        const clientUser = guildObject.members.me;
        const clientId = clientUser.id;

        const clientRoles = clientUser.roles;
        const clientHighestRole = clientRoles.highest;

        const everyoneRole = guildObject.roles.everyone;
        const everyoneRoleId = everyoneRole.id;

        const guildRoles = await guildObject.roles.fetch()
        .catch((error) => {
            logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while fetching roles from guild", `code: "err_check_rolefetch", error: "${error}"`));

            interaction.reply({embeds: [defaultMessage.generalCommandError("Error fetching guild roles", "err_check_rolefetch")]})
            .catch((error) => {
                logging(__filename, logTemplates.commandInteractionException(interaction, "Error when replying to interaction", `code: "err_int_reply/err_check_rolefetch", error: "${error}"`));

                return;
            });

            return;
        })


        const requiredPerms = [
            PermissionFlagsBits.ManageRoles,
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.SendMessagesInThreads,
            PermissionFlagsBits.EmbedLinks,
            PermissionFlagsBits.UseExternalEmojis,
            PermissionFlagsBits.UseApplicationCommands
        ];

        const botHasRequiredPerms = clientUser.permissions.has(requiredPerms);

        //Return all roles that aren't managed
        function getUnmanagedRoles(guildRoles) {

            var unmanagedRolesArray = []

            guildRoles.forEach((value) => {

                if (value.managed) return;
                if (value.id === everyoneRoleId) return;

                unmanagedRolesArray.push(value);
            })

            return unmanagedRolesArray;
        }

        const eligibleRoles = getUnmanagedRoles(guildRoles);

        //Check if there are any roles left that could be eligible
        if (!eligibleRoles) {
            logging.globalInfo(__filename, logTemplates.commandInteractionInfo(interaction, `Stopping command, guild doesn't have any roles that could be eligible for a timeout role. code: "inf_check_noEligibleRoles";`));
        
            interaction.reply({embeds: [deniedMessage("No eligible role(s) found")]})
            .catch((error) => logging.warn(__filename, logTemplates.commandInteractionException(interaction, "Error while sending no eligible role(s) found message.", `code: "err_check_noEligibleRoles"`)))
        }


        // Get the roles that corespond to the given page. (Page logic)

        const totalEligibleRoles = eligibleRoles.length;
        const totalPages = Math.ceil(totalEligibleRoles/maxRolesPerPage);

        const requestedPageOption = interaction.options.getInteger("page");
        var requestedPage;
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

        const roleForPage = Object.values(eligibleRoles).slice(startValue, endValue); //The roles to use for a set page


        //Check if all required perms are set for a role
        function roleCompatibilityCheck (botHasRequiredPerms, clientHighestRole, compareRole) {

            //Check if the bot has all the required perms to do it's functions.
            if (!botHasRequiredPerms) {
                return "False - Bot missing perms";
            }

            //Compare the bot's role with another role. Pos = botRole higher, min = botRole lower, equal = same role.
            const comparedRolePos = clientHighestRole.comparePositionTo(compareRole)

            if (comparedRolePos === 0) {
                return "False - Is the bot's highest role"
            }


            //If role is lower
            if (comparedRolePos < 0) {
                return "False - Bot higest role too low"
            }

            //If nothing else returned ealier it ok to manage
            return "True";
        }


        // Data to use in the embed fields
        var formattedRolesArray = [];
        var roleInDatabaseArray = [];
        var canManageRoleArray = [];

        for (const role of roleForPage) {
            const roleId = role.id;

            // Format to a correct role tag and add to it the array
            const formattedRole = `<@&${roleId}>`;
            formattedRolesArray.push(formattedRole);


            // Check if role is in the database
            await roleInDatabase(roleId)
            .then((result) => {
                if (result == true) {
                    roleInDatabaseArray.push("True");
                } else {
                    roleInDatabaseArray.push("False");
                }
                
            })
            .catch((error) => {
                roleInDatabaseArray.push(error); //Error = specified text. Not the actuall full error
            });


            //Check if role can be edited
            canManageRoleArray.push(roleCompatibilityCheck(botHasRequiredPerms, clientHighestRole, role));


        }
        

        //Embed Code

        //Transform the array you get with data to a string with every array value being a new line
        function arrayToNewlineString (array) {
            const string = array.toString();
            const newLineString = string.replace(/,/g, "\n");

            if (!newLineString) {
                return "ERR - No Data";
            }

            return newLineString.slice(0, 1024);
        }


        // Build the emed using the buildIn discordjs embed builder.
        const embed = new EmbedBuilder()
        .setTitle("Available roles")
        .addFields(
        {name: "Role", value: arrayToNewlineString(formattedRolesArray), inline: true},
        {name: "Timed Role", value: arrayToNewlineString(roleInDatabaseArray), inline: true},
        {name: "Bot Can Manage", value: arrayToNewlineString(canManageRoleArray), inline: true}
        )
        .setFooter({text: `Page ${requestedPage}/${totalPages}`})
        .setTimestamp();

        interaction.reply({embeds: [embed]})
        .catch((error) => logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while sending interaction reply", `Error: "${error}"`)));
    }
};