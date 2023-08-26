const { ApplicationCommandOptionType, PermissionFlagsBits, inlineCode } = require("discord.js");
const { newTimeOutRole, updateTimeoutTime, removeTimeoutRole } = require("../../utils/database/ping-timeout/roleCommand");
const { roleInDatabase } = require("../../utils/database/ping-timeout/general");

module.exports = {
    name: "timeout-role",
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

            if (await roleInDatabase(roleId) === true) {
                interaction.reply({content: `This role already is a timeout role`, ephemeral: true})
                return;
            }

            if (roleId === interaction.guild.roles.everyone.id) {
                interaction.reply({content: `Can't add a timeout to @everyone`, ephemeral: true})
                return;
            }

            const role = client.guilds.cache.get(guildId).roles.cache.get(roleId);
            if (role.managed) {
                interaction.reply({content: `Can't add a timeout to the role cause the role is managed by a bot <@&${roleId}>`, ephemeral: true})
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
                    mentionableError = "ERROR";
                    console.log("roleCommand.js", error);
                }
                
            });
            if (mentionableError === "noPerms") {
                interaction.reply({content: `There was an error executing this command. ${inlineCode('No perms')} make sure that the role of the bot has a higher rank than the timeout time`, ephemeral: true})
                return;
            }
            if (mentionableError === "ERROR") {
                interaction.reply({content: `There was an error executing this command. Please try again later`, ephemeral: true})
                return;
            }

            const newTimeOutRespone = await newTimeOutRole(roleId, guildId, timeoutTime, true);
            if (newTimeOutRespone === "error") {
                interaction.reply({content: `There was an error executing this command. Please try again later`, ephemeral: true})
                return;
            } else {
                interaction.reply({content: `Successfully added this role as a timeout role`, ephemeral: true})
                return;
            }
        };
        if (commandName === "edit") {
            const guildId = interaction.guildId;
            const roleId = interaction.options.get('role').value;

            if (await roleInDatabase(roleId) === false) {
                interaction.reply({content: `This role isn't a role monitored by this bot`, ephemeral: true})
                return;
            }

            const role = client.guilds.cache.get(guildId).roles.cache.get(roleId);
            //make the role mentionable
            var mentionableError;
            await role.setMentionable(true).catch(error => {
                if (error.code === 50013) {
                    mentionableError = "noPerms";
                } else {
                    mentionableError = "ERROR";
                    console.log("roleCommand.js", error);
                }
                
            });
            if (mentionableError === "noPerms") {
                interaction.reply({content: `There was an error executing this command. ${inlineCode('No perms')} make sure that the role of the bot has a higher rank than the timeout role (or is admin)`, ephemeral: true})
                return;
            }
            if (mentionableError === "ERROR") {
                interaction.reply({content: `There was an error executing this command. Please try again later`, ephemeral: true})
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
                await role.setMentionable(false).catch(error => {console.log(error)});
                interaction.reply({content: `There was an error executing this command. Please try again later`, ephemeral: true})
                return;
            } else {
                interaction.reply({content: `Successfully edited this timeout role`, ephemeral: true})
                return;
            }
        };
        if (commandName === "remove") {
            const guildId = interaction.guildId;
            const roleId = interaction.options.get('role').value;

            if (await roleInDatabase(roleId) === false) {
                interaction.reply({content: `This role isn't a role monitored by this bot`, ephemeral: true})
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
                        console.log("roleCommand.js", error);
                    }
                });
            } else {
                await roleData.setMentionable(false, "Made role not mentionable when removing it from the bot").catch(error => {
                    if (error.code === 50013) {
                        error = "noPerms";
                    } else {
                        error = "ERROR";
                        console.log("roleCommand.js", error);
                    }
                });;
            };
            if (error === "noPerms") {
                interaction.reply({content: `There was an error executing this command. ${inlineCode('No perms')} make sure that the role of the bot has a higher rank than the timeout role (or is admin)`, ephemeral: true})
                return;
            }
            if (error === "ERROR") {
                interaction.reply({content: `There was an error executing this command. Please try again later`, ephemeral: true})
                return;
            }

            const removeResponse = await removeTimeoutRole(roleId);
            if (removeResponse === "error") {
                interaction.reply({content: `There was an error executing this command. Please try again later`, ephemeral: true})
                return;
            } else {
                interaction.reply({content: `Succesfully removed this role from the bot. Mentionable ${inlineCode(mentionable)}`, ephemeral: true})
                return;
            }
        }

    }
}