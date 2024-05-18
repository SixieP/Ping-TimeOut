const { ApplicationCommandOptionType, PermissionFlagsBits } = require("discord.js");
const { createNewTimedroleQuery, editTimedRoleQuery, removeTimedRoleQuery, resetTimerTimedRoleQuery} = require("../../utils/database/ping-timeout/roleCommand");
const { roleInDatabase } = require("../../utils/database/ping-timeout/general");

const logging = require("../../utils/baseUtils/logging");
const logTemplates = require("../../utils/baseUtils/logTemplates");

const { aprovedMessage, warnMessage, deniedMessage } = require("../../utils/baseUtils/defaultEmbeds");
const defaultMessages = require("../../utils/defaults/messages/defaultMessages");
const aboveMaxRoles = require("../../utils/ping-timeout/aboveMaxRoles");

module.exports = {
    name: "timed-role",
    description: "Command to add/edit/remove a timeout role",
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
    context: [0],
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
                    minValue: 1,
                    maxValue: 365,
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
                    minValue: 1,
                    maxValue: 365,
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

        // === Set global used vars ===

        const requiredPerms = [
            PermissionFlagsBits.ManageRoles,
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.SendMessagesInThreads,
            PermissionFlagsBits.EmbedLinks,
            PermissionFlagsBits.UseExternalEmojis,
            PermissionFlagsBits.UseApplicationCommands
        ];

        const guildId = interaction.guildId;
        const guildObject = interaction.guild;

        // Check if the guild is availabe (if the guild server isn't offline)
        if (!guildObject.available) {
            logging.verboseWarn(__filename, logTemplates.commandInteractionException(interaction, "Guild not availabe", `guildId: ${guildId}, errId: "err_Unavail_Guild"`));

            //Try sending error reply (could fail cause the guild is not availabe)
            interaction.reply({embeds: [defaultMessages.generalCommandError("Guild not availabe. Possible discord server outage", "err_Unavail_Guild")], ephemeral: true})
            .catch(error => {
                logging.globalWarn(__filename, 
                    logTemplates.commandInteractionException(
                        interaction, 
                        "Tried to send guild unavailable interaction reply. Error could be expected.", 
                        `guildId: ${guildId}, errId: "err_Unavail_Guild", error: ${error}`
                        )
                    );
            });
            
            return;
        };


        const subCommandName = interaction.options.getSubcommand() //Get the subcommand: add/edit/remove/reset-timer
        const commandOptionRoleId = interaction.options.get('role').value; //Get the id from the given role
        

        //Get the role object from the roleId given in the command
        const roleObject = await guildObject.roles.fetch(commandOptionRoleId) 
        .catch((error) => {
            logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error catching role", `code: "err_rolefetch", roleId: "${commandOptionRoleId}", error: "${error}"`));

            interaction.reply({embeds: [defaultMessages.generalCommandError("Error getting more information about role", "err_rolefetch")]}) //Send a reply that there was an issue fetching the role
            .catch((error) => logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while sending interaction reply", `code: "err_int_reply", error: "${error}"`)));

            return;
        });
        
        //Get some datafrom the everyone role
        const everyoneRole = guildObject.roles.everyone;
        const everyoneRoleId = everyoneRole.id;


        // Get some information about the bot and the bot's role.
        const clientUser = guildObject.members.me;

        const clientRoles = await clientUser.roles;

        const clientHighestRole = clientRoles.highest;

        //Check if the role is the everyone role and if so exit the code
        if (commandOptionRoleId === everyoneRoleId) {
            logging.globalInfo(__filename, logTemplates.commandInteractionInfo(interaction, `Tried using @everyone role in timed-role command`));

            interaction.reply({embeds: [deniedMessage("You can not use the everyone role in this command.")]})
            .catch((error) => logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while sending interaction reply", `code: "err_int_reply", error: "${error}"`)));

            return;
        };

        //Check if the role is managed
        if (roleObject.managed) {
            logging.globalInfo(__filename, logTemplates.commandInteractionInfo(interaction, `Tried using a managed role in timed-role command`));

            interaction.reply({embeds: [deniedMessage("You can not use a role managed by a bot/intergration in this command.")]})
            .catch((error) => logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while sending interaction reply", `code: "err_int_reply", error: "${error}"`)));

            return;
        };

        // Check if the bot has all required perms and if it can manage the given role
        if (!botHasRequiredPerms(requiredPerms, clientUser)) {
            logging.verboseInfo(__filename, logTemplates.commandInteractionInfo(interaction, "Bot does not have the required perms to manage any role"));

            interaction.reply({embeds: [warnMessage('The bot does not have all required permisions to function correctly. Please use "/help page:permscheck" to see all missing perms.')]})
            .catch((error) => logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while sending interaction reply", `code: "err_int_reply", error: "${error}"`)));
            
            return;
        };

        if (isBotHighestRole(clientHighestRole, roleObject)) {
            logging.verboseInfo(__filename, logTemplates.commandInteractionInfo(interaction, `Role is bot's higest role. roleId: "${roleObject.id}"`));

            interaction.reply({embeds: [warnMessage("This role is the bot's highest role. A bot can't manage it's highest role. If you want to manage this role please give it one above it.")]})
            .catch((error) => logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while sending interaction reply", `code: "err_int_reply", error: "${error}"`)));

            return;
        }

        if (!rolePosHiger(clientHighestRole, roleObject)) {
            logging.verboseInfo(__filename, logTemplates.commandInteractionInfo(interaction, `Role higher than the bots highest role. roleId: "${roleObject.id}"`));

            interaction.reply({embeds: [warnMessage("This role is above the bot's higest role. To manage this role you will have to lower the position of this role below the bot's highest role or add the bot to a role higher than thise one.")]})
            .catch((error) => logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while sending interaction reply", `code: "err_int_reply", error: "${error}"`)));

            return;
        };

        // <- Functions used by every subcommand ===

        //Calculate the duration of the timeout
        function calculateTimeoutDuration (interaction) {
            return new Promise(function (resolve, reject) {
                
                //Set the option vars
                var commandOptionTimeoutDuration;
                var commandOptionTimeoutMagnitude;

                //Try getting commandOptionTimeoutDuration. Catch if not found
                try {
                    commandOptionTimeoutDuration = interaction.options.getInteger("timeout-duration", true);

                } catch (error) {
                    logging.warn(__filename, logTemplates.commandInteractionException(interaction, "Couldn't get timeout duration option", `roleId: "${commandOptionRoleId}", error: "${error}"`));

                    // Sending reply that option is unavailable.
                    interaction.reply({embeds: [defaultMessages.generalCommandError("Error getting magnitude command option", "err_option_get")]})
                    .catch((error) => logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while sending interaction reply", `code: "err_int_reply/err_option_get", error: "${error}"`)));

                    reject("err_option_get");
                    return;
                }

                //Check if the timeoutDuraction is greater than the max. If so stop code.
                if (commandOptionTimeoutDuration > 365) return;
                
                //Try getting commandOptionTimeoutMagnitude. Catch if not found
                try {
                    commandOptionTimeoutMagnitude = interaction.options.getInteger("timeout-magnitude", true);
                } catch (error) {
                    logging.warn(__filename, logTemplates.commandInteractionException(interaction, "Couldn't get timeout magnitude option ", `roleId: "${commandOptionRoleId}", error: "${error}"`))

                    // Sending reply that option is unavailable.
                    interaction.reply({embeds: [defaultMessages.generalCommandError("Error getting magnitude command option", "err_option_get")]})
                    .catch((error) => logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while sending interaction reply", `code: "err_int_reply/err_option_get", error: "${error}"`)));

                    reject("err_option_get");
                    return;
                }

                // Calculate the timeout duration
                if (commandOptionTimeoutMagnitude === 0) { //Minute
                    resolve(commandOptionTimeoutDuration);
                } else if (commandOptionTimeoutMagnitude === 1) { //Hour
                    resolve(commandOptionTimeoutDuration*60);
                } else if (commandOptionTimeoutMagnitude === 2) { //Day
                    resolve(commandOptionTimeoutDuration*60*24);
                } else {
                    logging.error(__filename, logTemplates.commandInteractionException(interaction, "Timeout Magnitude is an unexpected value", `Timeout Magnitude: "${commandOptionTimeoutMagnitude}"`));

                    interaction.reply({embeds: [defaultMessages.generalCommandError("Unexpected magnitude value", "err_timed-role_unkn_mag")]})
                    .catch((error) => logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while sending interaction reply", `code: "err_int_reply/err_timed-role_unkn_mag", error: "${error}"`)));

                    reject("err_timed-role_unkn_mag");
                    return;
                };
            });
        };

        // Check if a roleId is in the roles database table
        function inDatabase(roleId) {
            return new Promise(function (resolve, reject) {
                roleInDatabase(roleId)
                .then((result) => {
                    if (result === true) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                })
                .catch((error) => {
                        logging.error(__filename, `Error checking if role is in database: database error. errCode: "${error.code}", err: "${error}"`);
                   
                        reject(error);
                    }
                );
            });
        };

        function updateMentionableState (roleObject, mentionable, reason) {
            return new Promise(function (resolve, reject) {
                roleObject.setMentionable(mentionable, reason)
                .then(() => resolve("ok"))
                .catch((error) => reject(error));
            });
        };


        //Check if role 1 is a higher pos than role 2
        function rolePosHiger(roleObjectOne, roleObjectTwo) {
            //Compare the bot's role with another role. Pos = botRole higher, min = botRole lower, equal = same role.
            const comparedPosition = roleObjectOne.comparePositionTo(roleObjectTwo);
            

            if (comparedPosition > 0) {
                return true;
            } else {
                return false;
            };
        };

        function isBotHighestRole(botHigestRole, commandRoleObject) {
            //Compare the bot's role with another role. Pos = botRole higher, min = botRole lower, equal = same role.
            const comparedPosition = botHigestRole.comparePositionTo(commandRoleObject);

            if (comparedPosition === 0) {
                return true;
            } else {
                return false;
            };
        }

        //Check if the bot has all required perms in an array
        function botHasRequiredPerms(requiredPerms, botMemberObject) {
            return botMemberObject.permissions.has([requiredPerms], true);
        }

        // === Functions used by every subcommand ->

        // === Start handling the subcommands ===


        if (subCommandName === "add") {
            subCommandAdd();
        } else if (subCommandName === "edit") {
            subCommandEdit();
        } else if (subCommandName === "remove") { // === REMOVE A TIMED ROLE LOGIC ===
            subcommandRemove();
        } else if (subCommandName === "reset-timer") {
            subCommandResetTimer();
        }

        return; //Return code. Below are only functions.

        // ==== Functions for the different subcommands -->

        // ==== ADD -->
        function subCommandAdd () {

            //Some default variables
            const mentionable = true;

            //Check if the guild has reached the max roles
            //TODO: Rework this code later
            aboveMaxRoles(guildId)
            .then((result) => {
                if (result == false) {
                    checkInDatabase();
                } else {
                    logging.globalInfo(__filename, logTemplates.commandInteractionInfo(interaction, `Guild has reached its max role(s). guildId: "${guildId}"`));
                
                    interaction.reply({embeds: [deniedMessage("You have reached the max allowed roles in this guild. Please visit the support discord if you would like to get this max increased. (sixie.xyz/sixie-discord)")]})
                    .catch((error) => logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while sending interaction reply", `code: "err_int_reply", error: "${error}"`)));
    
                    return;
                };
            });
            
            //TODO: Changed this in the max role quickfix. See if it should be different
            function checkInDatabase() {
                //Check if role is already in database. If so stop code
                inDatabase(commandOptionRoleId)
                .then((result) => {
                    if (result == false) {
                        updateRoleMentionable();
                    } else {
                        logging.globalInfo(__filename, logTemplates.commandInteractionInfo(interaction, `Role already in roles table. roleId: "${commandOptionRoleId}"`));
                    
                        interaction.reply({embeds: [deniedMessage("This role already is a timed role")]})
                        .catch((error) => logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while sending interaction reply", `code: "err_int_reply", error: "${error}"`)));
        
                        return;
                    }
                })
                .catch((error) => {
                    interaction.reply({embeds: [defaultMessages.generalCommandError("Database error", `err_datab/${error.code}`)]})
                    .catch((error) => logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while sending interaction reply", `code: "err_int_reply/err_datab", error: "${error}"`)));
                });
            }

            function updateRoleMentionable() {
                updateMentionableState(roleObject, mentionable, '"Timed-Role add" command got executed. Made role mentionable')
                .then(() => {
                    getTimeoutDur()
                })
                .catch((error) => {
                    logging.error(__filename, `Error while making role mentionable. code: "err_role_updaMentio", error: "${error}"`);

                    interaction.reply({embeds: [defaultMessages.generalCommandError("Error updating role mentionable state", "err_role_updaMentio")]})
                    .catch((error) => logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while sending interaction reply", `code: "err_int_reply/err_role_updaMentio", error: "${error}"`)));
    
                    return;
                });
            };

            //Get the duration of the timeout
            function getTimeoutDur() {


                calculateTimeoutDuration(interaction)
                .then((timeoutDuration) => createNewRole(timeoutDuration))
                .catch((error) => logging.warn(__filename, logTemplates.commandInteractionException(interaction, "Error getting timeout Duration", `error: "${error}"`)));
            };

            function createNewRole(timeoutDuration) {
                createNewTimedroleQuery(commandOptionRoleId, guildId, timeoutDuration, mentionable)
                .then(() => {
                    addSuccess();
                })
                .catch((error) => {
                    logging.error(__filename, `Error creating role. code: "err_datab_rolco_createRo", errCode: ${error.code}, roleId: "${commandOptionRoleId}", guildId: "${guildId}", timeoutDuration: ""${timeoutDuration}, mentionable: "${mentionable}"`);
    
                    interaction.reply({embeds: [defaultMessages.generalCommandError("Error creating new timed role", "err_datab_rolco_createRo")]})
                    .catch((error) => logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while sending interaction reply", `code: "err_int_reply/err_datab_rolco_createRo", error: "${error}"`)));
    
                    return;
                });
            };


            // Send a sucess message if everything went well
            function addSuccess() {
                logging.verboseInfo(__filename, `Successfully created a new timed role. roleId: "${commandOptionRoleId}", guildId: "${guildId}"`);

                interaction.reply({embeds: [aprovedMessage("Successfully made this role a timed role!")]})
                .catch((error) => logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while sending interaction reply", `code: "err_int_reply/inf_roleCo_createdRole", error: "${error}"`)));

                logging.globalInfo(__filename, logTemplates.commandInteractionEnd(interaction)); //Mark the end of the command interaction
                return;
            }


        };
        // <-- ADD ====

        // ==== EDIT -->
        function subCommandEdit() {

            //Some default variables
            const mentionable = true;

            //Check if role exist in database. If not so stop code
            inDatabase(commandOptionRoleId)
            .then((result) => {
                if (result == true) {
                    updateRoleMentionable();
                } else {
                    logging.globalInfo(__filename, logTemplates.commandInteractionInfo(interaction, `Role not in roles table. Stopping timed-role remove command. roleId: "${commandOptionRoleId}"`));
                
                    interaction.reply({embeds: [deniedMessage("This role is not a timed role")]})
                    .catch((error) => logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while sending interaction reply", `code: "err_int_reply", error: "${error}"`)));

                    return;
                }
            })
            .catch((error) => {
                console.log(error);

                interaction.reply({embeds: [defaultMessages.generalCommandError("Database error", `err_datab/${error.code}`)]})
                .catch((error) => logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while sending interaction reply", `code: "err_int_reply/err_datab", error: "${error}"`)));
            });

            function updateRoleMentionable() {
                updateMentionableState(roleObject, mentionable, '"Timed-Role edit" command got executed. Made role mentionable')
                .then(() => {
                    getTimeoutDur()
                })
                .catch((error) => {
                    logging.error(__filename, `Error while making role mentionable. code: "err_role_updaMentio", error: "${error}"`);

                    interaction.reply({embeds: [defaultMessages.generalCommandError("Error updating role mentionable state", "err_role_updaMentio")]})
                    .catch((error) => logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while sending interaction reply", `code: "err_int_reply/err_role_updaMentio", error: "${error}"`)));
    
                    return;
                });
            };

            //Get the (new) duration of the timeout
            function getTimeoutDur() {

                calculateTimeoutDuration(interaction)
                .then((timeoutDuration) => editTimedRole(timeoutDuration))
                .catch((error) => logging.warn(__filename, logTemplates.commandInteractionException(interaction, "Error getting timeout Duration", `error: "${error}"`)));
            };

            function editTimedRole(timeoutDuration) {
                editTimedRoleQuery(commandOptionRoleId, timeoutDuration, mentionable)
                .then(() => {
                    editSuccess();
                })
                .catch((error) => {
                    logging.error(__filename, `Error while editing existing timed role in database. code: "err_datab_roleco_ediRol", error: "${error}"`);

                    interaction.reply({embeds: [defaultMessages.generalCommandError("Database error", "err_datab_roleco_ediRol")]})
                    .catch((error) => logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while sending interaction reply", `code: "err_int_reply/err_datab_roleco_ediRol", error: "${error}"`)));
    
                    return;
                });
            };

            function editSuccess() {
                logging.verboseInfo(__filename, `Successfully edited a timed role. roleId: "${commandOptionRoleId}", guildId: "${guildId}"`);
    
                interaction.reply({embeds: [aprovedMessage("Successfully edited this role!")]})
                .catch((error) => logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while sending interaction reply", `code: "err_int_reply/inf_roleCo_editRole", error: "${error}"`)));

                logging.globalInfo(__filename, logTemplates.commandInteractionEnd(interaction)); //Mark the end of the command interaction
                return;
            }
        };
        // <-- EDIT ====


        // ==== REMOVE -->
        function subcommandRemove() {

            //Check if role is already in database. If not so stop code
            inDatabase(commandOptionRoleId)
            .then((result) => {
                if (result == true) {
                    shouldMakeMentionable();
                } else {
                    logging.globalInfo(__filename, logTemplates.commandInteractionInfo(interaction, `Role not in roles table. Stopping timed-role remove command. roleId: "${commandOptionRoleId}"`));
                
                    interaction.reply({embeds: [deniedMessage("This role is not a timed role")]})
                    .catch((error) => logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while sending interaction reply", `code: "err_int_reply", error: "${error}"`)));

                    return;
                }
            })
            .catch((error) => {
                console.log(error);

                interaction.reply({embeds: [defaultMessages.generalCommandError("Database error", `err_datab/${error.code}`)]})
                .catch((error) => logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while sending interaction reply", `code: "err_int_reply/err_datab", error: "${error}"`)));
            });
            

            //If the role should be made mentionable after deletion
            function shouldMakeMentionable () {
                let mentionable = interaction.options.getBoolean("mentionable");

                if (mentionable) {
                    updateRoleMentionable(true); //Role should be mentionable after deletion
                } else {
                    updateRoleMentionable(false);//Role shouldn't be mentionable after deletion
                };
            };

            function updateRoleMentionable(mentionable) {
                updateMentionableState(roleObject, mentionable, `"Timed-Role remove" command got executed. Set role mentionable status to requested state ${mentionable}`)
                .then(() => {
                    removeRole()
                })
                .catch((error) => {
                    logging.error(__filename, `Error while making role mentionable. code: "err_role_updaMentio", error: "${error}"`);

                    interaction.reply({embeds: [defaultMessages.generalCommandError("Error updating role mentionable state", "err_role_updaMentio")]})
                    .catch((error) => logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while sending interaction reply", `code: "err_int_reply/err_role_updaMentio", error: "${error}"`)));
    
                    return;
                });
            };

            function removeRole(mentionable) {
                removeTimedRoleQuery(commandOptionRoleId)
                .then(() => removeSuccess())
                .catch((error) => {
                    logging.error(__filename, `Error creating role. code: "err_datab_rolco_remRol", errCode: ${error.code}, roleId: "${commandOptionRoleId}", guildId: "${guildId}", timeoutDuration: ""${timeoutDuration}, mentionable: "${mentionable}"`);

                    interaction.reply({embeds: [defaultMessages.generalCommandError("Error creating new timed role", "err_datab_rolco_remRol")]})
                    .catch((error) => logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while sending interaction reply", `code: "err_int_reply/err_datab_rolco_remRol", error: "${error}"`)));

                    return;
                });
            };

            function removeSuccess() {
                logging.verboseInfo(__filename, `Successfully removed a timed role. roleId: "${commandOptionRoleId}", guildId: "${guildId}"`);

                interaction.reply({embeds: [aprovedMessage("Successfully made this role a non-timed role!")]})
                .catch((error) => logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while sending interaction reply", `code: "err_int_reply/inf_roleCo_removedRole", error: "${error}"`)));

                logging.globalInfo(__filename, logTemplates.commandInteractionEnd(interaction)); //Mark the end of the command interaction
                return;
            }
        };
        // <-- REMOVE ====


        // ==== RESET-TIMER -->
        function subCommandResetTimer() {

            //Some default variables
            const mentionable = true;

            //Check if role exist in database. If not so stop code
            inDatabase(commandOptionRoleId)
            .then((result) => {
                if (result == true) {
                    updateRoleMentionable();
                } else {
                    logging.globalInfo(__filename, logTemplates.commandInteractionInfo(interaction, `Role not in roles table. Stopping timed-role remove command. roleId: "${commandOptionRoleId}"`));
                
                    interaction.reply({embeds: [deniedMessage("This role is not a timed role")]})
                    .catch((error) => logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while sending interaction reply", `code: "err_int_reply", error: "${error}"`)));

                    return;
                }
            })
            .catch((error) => {
                console.log(error);

                interaction.reply({embeds: [defaultMessages.generalCommandError("Database error", `err_datab/${error.code}`)]})
                .catch((error) => logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while sending interaction reply", `code: "err_int_reply/err_datab", error: "${error}"`)));
            });

            function updateRoleMentionable() {
                updateMentionableState(roleObject, mentionable, '"Timed-Role reset-timer" command got executed. Set mentionable state to true')
                .then(() => {
                    resetTimer();
                })
                .catch((error) => {
                    logging.error(__filename, `Error while making role mentionable. code: "err_role_updaMentio", error: "${error}"`);

                    interaction.reply({embeds: [defaultMessages.generalCommandError("Error updating role mentionable state", "err_role_updaMentio")]})
                    .catch((error) => logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while sending interaction reply", `code: "err_int_reply/err_role_updaMentio", error: "${error}"`)));
    
                    return;
                });
            };

            function resetTimer() {
                resetTimerTimedRoleQuery(commandOptionRoleId, mentionable)
                .then(() => {
                    logging.verboseInfo(__filename, `Successfully reset the timer of a timed role. roleId: "${commandOptionRoleId}", guildId: "${guildId}"`);
    
                    interaction.reply({embeds: [aprovedMessage("Successfully reset the timer!")]})
                    .catch((error) => logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while sending interaction reply", `code: "err_int_reply/inf_roleCo_timerReset", error: "${error}"`)));

                    logging.globalInfo(__filename, logTemplates.commandInteractionEnd(interaction)); //Mark the end of the command interaction
                    return;
                })
                .catch((error) => {
                    logging.error(__filename, `Error while making role mentionable. code: "err_role_updaMentio", error: "${error}"`);

                    interaction.reply({embeds: [defaultMessages.generalCommandError("Error updating role mentionable state", "err_role_updaMentio")]})
                    .catch((error) => logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while sending interaction reply", `code: "err_int_reply/err_role_updaMentio", error: "${error}"`)));
    
                    return;
                });
            };
        };
        // <-- RESET_TIMER ====

        // <-- Functions for the different subcommands ====
    }
}

