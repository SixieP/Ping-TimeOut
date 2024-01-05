const { ApplicationCommandOptionType, PermissionFlagsBits, inlineCode, bold } = require("discord.js");
const { newTimeOutRole, updateTimeoutTime, removeTimeoutRole, makeMentionable } = require("../../utils/database/ping-timeout/roleCommand");
const { roleInDatabase } = require("../../utils/database/ping-timeout/general");
const { aprovedMessage, deniedMessage } = require("../../utils/baseUtils/defaultEmbeds");
const { permsCheck } = require("../../utils/ping-timeout/permsCheck");
const compareBotRoleRank = require("../../utils/ping-timeout/compareBotRoleRank");

const logging = require("../../utils/baseUtils/logging");
const logTemplates = require("../../utils/baseUtils/logTemplates");

module.exports = {
    name: "timed-role",
    description: "Command to add/edit/remove a timeout role",
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
    options: [
        {
            name: "add",
            description: "Add a role that should have a timeout",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "role",
                    description: "The role you want to add a timeout to",
                    required: true,
                    type: ApplicationCommandOptionType.Role,
                },
                {
                    name: "timeout-duration",
                    description: "How long a role should timeout for when pinged",
                    required: true,
                    type: ApplicationCommandOptionType.Integer,
                },
                {
                    name: "timeout-magnitude",
                    description: "If you want to time a role out for X min/hour/day",
                    type: ApplicationCommandOptionType.Integer,
                    required: true,
                    choices: [
                        {
                            name: "min",
                            value: 0
                        },
                        {
                            name: "hour",
                            value: 1
                        },
                        {
                            name: "day",
                            value: 2,
                        },
                    ],
                },
            ],
        },
        {
            name: "edit",
            description: "Add a role that should have a timeout",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "role",
                    description: "The role where want to edit the timeout",
                    required: true,
                    type: ApplicationCommandOptionType.Role,
                },
                {
                    name: "timeout-duration",
                    description: "How long a role should timeout for when pinged",
                    required: true,
                    type: ApplicationCommandOptionType.Integer,
                },
                {
                    name: "timeout-magnitude",
                    description: "If you want to time a role out for X min/hour/day",
                    type: ApplicationCommandOptionType.Integer,
                    required: true,
                    choices: [
                        {
                            name: "min",
                            value: 0
                        },
                        {
                            name: "hour",
                            value: 1
                        },
                        {
                            name: "day",
                            value: 2,
                        },
                    ],
                },
            ]
        },
        {
            name: "remove",
            description: "Remove a role that should have a timeout",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "role",
                    description: "The role you want to add a timeout to",
                    required: true,
                    type: ApplicationCommandOptionType.Role,
                },
                {
                    name: "mentionable",
                    description: "Do you want the role to be mentionable after you delete the timeout",
                    required: true,
                    type: ApplicationCommandOptionType.Boolean,
                },
            ]
        },
        {
            name: "reset-timer",
            description: "Reset the timeout of a role",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "role",
                    description: "The role you want the timeout to reset of",
                    required: true,
                    type: ApplicationCommandOptionType.Role,
                }
            ],
        }
    ],

    //delete: Boolean,
    //devOnly: Boolean,
    //testCommand: Boolean,

    callback: async (client, interaction) => {
        commandName = interaction.options._subcommand;
        guildId = interaction.guildId;

        //make it so that @everyone can't ping all the roles if that already isn't the case
        const everyoneRole = client.guilds.cache.get(guildId).roles.everyone

        if (everyoneRole.permissions.has(PermissionFlagsBits.MentionEveryone)) {
            const newRolePerms = everyoneRole.permissions.remove([PermissionFlagsBits.MentionEveryone]);
            everyoneRole.setPermissions(newRolePerms, "Bot doesn't function corretly when @everyone can mention all roles");
        };

        //logic for the "add" command
        if (commandName === "add") {
            const roleId = interaction.options.get('role').value;

            if (await roleInDatabase(interaction, roleId) === true) {
                interaction.reply({embeds: [deniedMessage(`This role already is a timeout role`)], ephemeral: true})
                logging.globalInfo(__filename, logTemplates.commandInteractionInfo(interaction, `Cannot make a role a timeout role. Already a timeout role. roleId: ${roleId}`));
                return;
            }

            if (roleId === interaction.guild.roles.everyone.id) {
                interaction.reply({embeds: [deniedMessage(`Can't add a timeout to @everyone`)], ephemeral: true})
                logging.globalInfo(__filename, logTemplates.commandInteractionInfo(interaction, `Trying to make @everyone a timeout role. roleId: ${roleId}, @everyoneId: ${interaction.guild.roles.everyone.id}`));
                return;
            }

            const role = client.guilds.cache.get(guildId).roles.cache.get(roleId);
            if (role.managed) {
                logging.globalInfo(__filename, logTemplates.commandInteractionInfo(interaction, `Role is managed by a bot. Can't be made a timeout role. roleId: ${roleId}`));
                interaction.reply({embeds: [deniedMessage(`Can't add a timeout to the role cause the role is managed by a bot <@&${roleId}>`)], ephemeral: true})
                return;
            }

            const timeoutDur = interaction.options.get('timeout-duration').value;
            const timeoutMag = interaction.options.get('timeout-magnitude').value;
            var timeoutTime;
            if (timeoutMag === 0) {
                timeoutTime = timeoutDur;
            }
            if(timeoutMag === 1) {
                timeoutTime = timeoutDur*60;
            }
            if (timeoutMag === 2) {
                timeoutTime = timeoutDur*60*24;
            };

            var mentionableError;
            await role.setMentionable(true).catch(error => {
                if (error.code === 50013) {
                    mentionableError = "noPerms";
                } else {
                    mentionableError = error;
                    logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while trying to make a role mentionable", `error: ${error}`));
                }
                
            });

            if (mentionableError === "noPerms") {
                const rolePos = compareBotRoleRank(client, guildId, roleId);

                var rolePosEmbed;
                if (rolePos > 0) {
                    rolePosEmbed = deniedMessage(`The bots role has a ${bold('lower')} position that the role you are trying to add a timeout to!`, "Role Position Check")
                } else {
                    rolePosEmbed = aprovedMessage(`The bots role has a ${bold('higher')} position that the role you are trying to add a timeout to!`, "Role Position Check")
                }


                interaction.reply({embeds: [deniedMessage(`Could not execute this command. Check below whats wrong`), permsCheck(client, guildId), rolePosEmbed], ephemeral: true})
                return;
            }
            if (mentionableError) {
                interaction.reply({embeds: [deniedMessage(`There was an error executing this command ${inlineCode(error)}. Please try again later`)], ephemeral: true})
                return;
            }

            const newTimeOutRespone = await newTimeOutRole(roleId, guildId, timeoutTime, true);
            if (newTimeOutRespone === "error") {
                logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while creating a new timeout role", `roleId: ${roleId}, timeoutTime: ${timeoutTime}`));
                interaction.reply({embeds: [deniedMessage(`There was an error executing this command. Please try again later`)], ephemeral: true})
                return;
            } else {
                logging.globalInfo(__filename, logTemplates.commandInteractionInfo(interaction, `Successfully added a new timeout role to the database. roleId: ${roleId}, timeoutTime: ${timeoutTime}`));
                interaction.reply({embeds: [aprovedMessage(`Successfully added this role as a timeout role`)], ephemeral: true})
                return;
            }
        };
        if (commandName === "edit") {
            const guildId = interaction.guildId;
            const roleId = interaction.options.get('role').value;

            if (await roleInDatabase(interaction, roleId) === false) {
                interaction.reply({embeds: [deniedMessage(`This role isn't a role monitored by this bot`)], ephemeral: true})
                logging.globalInfo(__filename, `Trying to edit role that isn't a timed role. roleId: ${roleId}`);
                return;
            }

            const role = client.guilds.cache.get(guildId).roles.cache.get(roleId);
            //make the role mentionable
            var mentionableError;
            await role.setMentionable(true).catch(error => {
                if (error.code === 50013) {
                    mentionableError = "noPerms";
                } else {
                    mentionableError = error;
                    logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while trying to make a role mentionable", `error: ${error}, role: ${role}`));
                }
                
            });
            if (mentionableError === "noPerms") {
                const rolePos = compareBotRoleRank(client, guildId, roleId);

                var rolePosEmbed;
                if (rolePos > 0) {
                    rolePosEmbed = deniedMessage(`The bots role has a ${bold('lower')} position that the role you are trying to add a timeout to!`, "Role Position Check")
                } else {
                    rolePosEmbed = aprovedMessage(`The bots role has a ${bold('higher')} position that the role you are trying to add a timeout to!`, "Role Position Check")
                }


                interaction.reply({embeds: [deniedMessage(`Could not execute this command. Check below whats wrong`), permsCheck(client, guildId), rolePosEmbed], ephemeral: true})
                return;
            }
            if (mentionableError) {
                interaction.reply({embeds: [deniedMessage(`There was an error executing this command ${inlineCode(mentionableError)}. Please try again later`)], ephemeral: true})
                return;
            }

            const timeoutDur = interaction.options.get('timeout-duration').value;
            const timeoutMag = interaction.options.get('timeout-magnitude').value;
            var timeoutTime;
            if (timeoutMag === 0) {
                timeoutTime = timeoutDur;
            }
            if(timeoutMag === 1) {
                timeoutTime = timeoutDur*60;
            }
            if (timeoutMag === 2) {
                timeoutTime = timeoutDur*60*24;
            };

            const updateTimeoutRespone = await updateTimeoutTime(roleId, timeoutTime, true)
            if (updateTimeoutRespone === "error") {
                await role.setMentionable(false).catch(error => {
                    logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while trying to make a role unmentionable"));
                });

                interaction.reply({embeds: [deniedMessage(`There was an error executing this command. Please try again later`)], ephemeral: true})
                return;
            } else {
                interaction.reply({embeds: [aprovedMessage(`Successfully edited this timeout role`)], ephemeral: true})
                logging.globalInfo(__filename, logTemplates.commandInteractionInfo(interaction, `Successfully edited timeout role. roleId: ${roleId}`));
                return;
            }
        };

        if (commandName === "remove") {
            const guildId = interaction.guildId;
            const roleId = interaction.options.get('role').value;

            if (await roleInDatabase(interaction, roleId) === false) {
                interaction.reply({embeds: [deniedMessage(`This role isn't a role monitored by this bot`)], ephemeral: true})
                return;
            }

            const mentionable = interaction.options.get('mentionable').value;

            const roleData = client.guilds.cache.get(guildId).roles.cache.get(roleId);

            var error;
            if (mentionable === true) {
                await roleData.setMentionable(true, "Made role mentionable when removing it from the bot").catch(error => {

                    if (error.code === 50013) {
                        error = "noPerms";
                    } else {
                        error = "ERROR";
                        logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while trying to make a role mentionable", `error: ${error}, role: ${role}`));

                    }
                });
            } else {
                await roleData.setMentionable(false, "Made role not mentionable when removing it from the bot").catch(error => {
                    if (error.code === 50013) {
                        error = "noPerms";
                    } else {;
                        logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while trying to make a role un-mentionable", `error: ${error}, role: ${role}`));

                    }
                });;
            };
            if (error === "noPerms") {
                const rolePos = compareBotRoleRank(client, guildId, roleId);

                var rolePosEmbed;
                if (rolePos > 0) {
                    rolePosEmbed = deniedMessage(`The bots role has a ${bold('lower')} position that the role you are trying to add a timeout to!`, "Role Position Check")
                } else {
                    rolePosEmbed = aprovedMessage(`The bots role has a ${bold('higher')} position that the role you are trying to add a timeout to!`, "Role Position Check")
                }


                interaction.reply({embeds: [deniedMessage(`Could not execute this command. Check below whats wrong`), permsCheck(client, guildId), rolePosEmbed], ephemeral: true})
                return;
            }
            if (error) {
                interaction.reply({embeds: [deniedMessage(`There was an error executing this command ${inlineCode(error)}. Please try again later`)], ephemeral: true})
                return;
            }

            const removeResponse = await removeTimeoutRole(roleId);
            if (removeResponse === "error") {
                logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while trying to remove a timeout role from database", `roleId: ${roleId}`));
                interaction.reply({embeds: [deniedMessage(`There was an error executing this command. Please try again later`)], ephemeral: true})
                return;
            } else {
                logging.globalInfo(__filename, logTemplates.commandInteractionInfo(interaction, `Successfully removed a timeout role from the database. roleId: ${roleId}`));
                interaction.reply({embeds: [aprovedMessage(`Succesfully removed this role from the bot. Mentionable ${inlineCode(mentionable)}`)], ephemeral: true})
                return;
            }
        };

        //reset the timeout timer
        if (commandName === "reset-timer") {
            const guildId = interaction.guildId;
            const roleId = interaction.options.get('role').value;

            if (await roleInDatabase(interaction, roleId) === false) {
                interaction.reply({embeds: [deniedMessage(`This role isn't a role monitored by this bot`)], ephemeral: true})
                logging.globalInfo(__filename, logTemplates.commandInteractionInfo(interaction, `Trying to reset timer from none timeout role. roleId: ${roleId}`));
                return;
            }

            const role = client.guilds.cache.get(guildId).roles.cache.get(roleId);
            //make the role mentionable
            var mentionableError;
            await role.setMentionable(true).catch(error => {
                if (error.code === 50013) {
                    mentionableError = "noPerms";
                } else {
                    mentionableError = error;
                    logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while trying to make a role mentionable", `error: ${error}`));
                }
                
            });
            
            if (mentionableError === "noPerms") {
                const rolePos = compareBotRoleRank(client, guildId, roleId);

                var rolePosEmbed;
                if (rolePos > 0) {
                    rolePosEmbed = deniedMessage(`The bots role has a ${bold('lower')} position that the role you are trying to add a timeout to!`, "Role Position Check")
                } else {
                    rolePosEmbed = aprovedMessage(`The bots role has a ${bold('higher')} position that the role you are trying to add a timeout to!`, "Role Position Check")
                }


                interaction.reply({embeds: [deniedMessage(`Could not execute this command. Check below whats wrong`), permsCheck(client, guildId), rolePosEmbed], ephemeral: true})
                return;
            }
            if (mentionableError) {
                interaction.reply({embeds: [deniedMessage(`There was an error executing this command ${inlineCode(mentionableError)}. Please try again later`)], ephemeral: true})
                return;
            }

            const editRespone = await makeMentionable(roleId, true);

            if (editRespone === "error") {
                logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while setting role to mentionable in database", `roleId: ${roleId}`));
                interaction.reply({embeds: [deniedMessage(`There was an error executing this command. Please try again later`)], ephemeral: true})
                return;
            } else {
                logging.globalInfo(__filename, logTemplates.commandInteractionInfo(interaction, `Made role mentionable again in database. roleId: ${roleId}`));
                interaction.reply({embeds: [aprovedMessage(`Succesfully made this role Mentionable`)], ephemeral: true})
                return;
            }
        }

    }
}