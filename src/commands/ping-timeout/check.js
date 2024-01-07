const { EmbedBuilder, inlineCode } = require("@discordjs/builders");

const { roleInDatabase } = require('../../utils/database/ping-timeout/general');
const { PermissionFlagsBits, PermissionsBitField } = require("discord.js");
const { permsCheck } = require("../../utils/ping-timeout/permsCheck");

const logging = require('../../utils/baseUtils/logging');
const logTemplates = require('../../utils/baseUtils/logTemplates');

const { deniedMessage } = require("../../utils/baseUtils/defaultEmbeds");
const defaultMessage = require('../../utils/defaults/messages/defaultMessages');

module.exports = {
    name: "check",
    description: "Check what roles are available for a timeout",
    defaultMemberPermissions: PermissionFlagsBits.Administrator,

    //delete: Boolean,
    //devOnly: Boolean,
    //testCommand: Boolean,

    callback: async (client, interaction) => {
        //Get the first basic vars
        const guildId = interaction.guildId;
        const guildObject = interaction.guild;

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
        }


        //Get the rest of all required vars
        const clientUser = guildObject.members.me;
        const clientId = clientUser.id;

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

        const clientRole = guildRoles.find((role) => role.tags?.botId === clientId);

        const botHasRequiredPerms = clientUser.permissions.has(PermissionFlagsBits.ManageRoles, PermissionFlagsBits.SendMessages); //TODO: Setup correct perms (maybe use config file for it?)

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
        
            interaction.reply({emebds: deniedMessage("No eligible role(s) found")})
            .catch((error) => logging.warn(__filename, logTemplates.commandInteractionException(interaction, "Error while sending no eligible role(s) found message.", `code: "err_check_noEligibleRoles"`)))
        }


        //Check if all required perms are set for a role
        function roleCompatibilityCheck (botHasRequiredPerms, clientRole, compareRole) {
            //Check if the bot has all the required perms to do it's functions.
            if (!botHasRequiredPerms) {
                return "False - Not enough perms";
            }

            //Compare the bot's role with another role. Pos = botRole higher, min = botRole lower, equal = same role.
            const comparedRolePos = clientRole.comparePositionTo(compareRole)

            if (comparedRolePos < 0) {
                return "False - Bot has role lower"
            }

            //If nothing else returned ealier it ok to manage
            return "True";
        }


        // Data to use in the embed fields
        var formattedRolesArray = [];
        var roleInDatabaseArray = [];
        var canManageRoleArray = [];

        for (const role of eligibleRoles) {
            const roleId = role.id;

            // Format to a correct role tag and add to it the array
            const formattedRole = `<@&${roleId}>`;
            formattedRolesArray.push(formattedRole);


            // Check if role is in the database
            await roleInDatabase(roleId)
            .then((result) => {
                roleInDatabaseArray.push(result);
            })
            .catch((error) => {
                roleInDatabaseArray.push(error);
            });


            //Check if role can be edited
            canManageRoleArray.push(roleCompatibilityCheck(botHasRequiredPerms, clientRole, role));


        }
        

        //Embed Code

        //Transform the array you get with data to a string with every array value being a new line
        function arrayToNewlineString (array) {
            const string = array.toString();
            const newLineString = string.replace(/,/g, "\n");

            return newLineString;
        }


        // Build the emed using the buildIn discordjs embed builder.
        const embed = new EmbedBuilder()
        .setTitle("Available roles")
        .addFields(
        {name: "Role", value: arrayToNewlineString(formattedRolesArray), inline: true},
        {name: "Timed Role", value: arrayToNewlineString(roleInDatabaseArray), inline: true},
        {name: "Bot Can Manage", value: arrayToNewlineString(canManageRoleArray), inline: true}
        )
        .setTimestamp();

        interaction.reply({embeds: [embed]})
        .catch((error) => logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while sending interaction reply", `Error: "${error}"`)));





    }
};