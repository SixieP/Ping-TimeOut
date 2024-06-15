/*
What does this command do?

This command is used to get stats from the bot that the dev can use. Besides that it is also used to check info about guilds and roles incase a bug has been reported.

*/


const { PermissionFlagsBits, ApplicationCommandOptionType, EmbedBuilder, inlineCode, Embed } = require("discord.js");
const registerPublicCommands = require('../../events/ready/02registerPublicCommands');
const registerTestCommands = require('../../events/ready/03registerTestCommands');
const { deniedMessage } = require(`../../utils/baseUtils/defaultEmbeds`);
const { statGetRole, statGetRolesByGuild, statGetAllRolesCounted, statGetAllRoles } = require("../../utils/database/DEV/stats");
const { getAllRoles } = require("../../utils/database/botStatus.js/setStatus");

const logging = require("../../utils/baseUtils/logging");
const logTemplates = require("../../utils/baseUtils/logTemplates");
const defaultMessage = require("../../utils/defaults/messages/defaultMessages");

module.exports = {
    name: "dev-stats",
    description: "Reload all commands while you don't have to restart the bot",
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
    contexts: [0],
    intergration_types: [0],
    options: [
        {
            name: "guild",
            description: "Get all guilds that the bot is part of",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "guildid",
                    description: "Info about a specific guild",
                    type: ApplicationCommandOptionType.String,
                },
                {
                    name: "page",
                    description: "The page you want to see (default is 1)",
                    type: ApplicationCommandOptionType.Integer,
                },
            ],
        },
        {
            name: "role",
            description: "Get all guilds that the bot is part of",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "guild-id",
                    description: "All roles in a specific guild",
                    type: ApplicationCommandOptionType.String,
                },
                {
                    name: "role-id",
                    description: "Info about a specific role",
                    type: ApplicationCommandOptionType.String,
                },
                {
                    name: "page",
                    description: "The page you want to see (default is 1)",
                    type: ApplicationCommandOptionType.Integer,
                },
            ],
        },
        {
            name: "global",
            description: "Get a message with global bot stats",
            type: ApplicationCommandOptionType.Subcommand,
        },
    ],

    //deleted: Boolean,
    devOnly: Boolean,
    testCommand: Boolean,

    callback: async (client, interaction) => {
        // Set globally used vars

        const interactionGuildObject = interaction.guild;

        // Check if the guild this interaction originates from isn't offline
        if (!interactionGuildObject.available) {
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

        const subCommandName = interaction.options.getSubcommand();

        if (subCommandName === "guild") {
            guildStatsSubcommand();
        } else if (subCommandName === "role") {
            roleStatsSubcommand();
        } else if (subCommandName === "global") {
            globalStatsSubcommand();
        } else {
            interaction.reply({embeds: [deniedMessage("Unknown Subcommand!")]})
            .catch((error) => logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while sending interaction reply", `code: "err_int_reply", error: "${error}"`)));
        };


        // ==== Functions for the different subCommands --->

        
        // ==== guild Stats --> 
        function guildStatsSubcommand() {

            const guildId = interaction.options.getString("guildid");

            if (guildId) {
                guildStatsById();
            } else {
                guildList();
            };

            function guildStatsById() {
                client.guilds.fetch(guildId, true)
                .then((guildObject) => createGuildInfoEmbed(guildObject))
                .catch((error) => {
                    if (error.code === 10004) {
                        interaction.reply({embeds: [deniedMessage("Bot isn't in the given guild")]})
                        .catch((error) => logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while sending interaction reply", `code: "err_int_reply", error: "${error}"`)));
                    } else {
                        logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error fetching a guild", `guildId: ${guildId}, error: "${error}"`));
                    };
                });
                

                async function createGuildInfoEmbed(guildObject) {
                    
                    // Check if the guild this interaction is trying to read is online
                    if (!guildObject.available) {
                        logging.verboseWarn(__filename, `Guild currently not available. guildId: ${guildId}`);

                        //Try sending error reply (could fail cause the guild is not availabe)
                        interaction.reply({embeds: [defaultMessages.generalCommandError("The guild you are tring to fetch info from is not availabe. Possible discord server outage", "err_Unavail_Guild")], ephemeral: true})
                        .catch(error => logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while sending interaction reply", `code: "err_int_reply", error: "${error}"`)));
                        
                        return;
                    };


                    //Info from the guild
                    const guildName = guildObject.name;
                    const guildId = guildObject.id;
                    const guildOwnerObject = await guildObject.fetchOwner()
                    .catch((error) => logging.error(__filename, `Error fetching guild owner. code: "err_sta_ownFetch", guildId: ${guildId}, error: "${error}"`));
                    const guildOwnerId = guildOwnerObject.id;
                    const guildOwnerName = guildOwnerObject.displayName;

                    //Get the total guild members
                    const guildMemberCount = guildObject.memberCount;

                    //Get the total of timed roles in the guild
                    const guildTimeoutRoles = await statGetRolesByGuild(guildId)
                    .catch((error) => logging.error(__filename, `Error getting this guilds timed role(s) from database. guildId: ${guildId}, error: "${error}"`));
                    const guildTimeoutRolesCount = guildTimeoutRoles.length;

                    const guildIconUrl = guildObject.iconURL();


                    const embed = new EmbedBuilder()
                    .setTitle('GuildInfo')
                    .setColor(0x327fa8)
                    .addFields(
                        {
                            name: "Server Name",
                            value: inlineCode(guildName),
                            inline: true,
                        },
                        {
                            name: "Server ID",
                            value: inlineCode(guildId),
                            inline: true,
                        },
                        {
                            name: "Owner",
                            value: inlineCode(`${guildOwnerName} (${guildOwnerId})`),
                            inline: true,
                        },
                        {
                            name: "Timed Roles",
                            value: inlineCode(guildTimeoutRolesCount),
                            inline: true,
                        },
                        {
                            name: "Membercount",
                            value: inlineCode(guildMemberCount),
                            inline: true,
                        },
                    )
                    .setThumbnail(guildIconUrl)
                    .setTimestamp();

                    interaction.reply({embeds: [embed]})
                    .catch(error => logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while sending interaction reply", `code: "err_int_reply", error: "${error}"`)));

                }
            };

            function guildList() {

                //Basic settings
                const defaultPage = 1;
                const maxGuildsPerPage = 25;
                const minPage = 1; //Also set in command min_value;
                const maxPage = 99; //Also set in command max_value;

                // Vars that should be available in the whole function
                var totalPages;
                var requestedPage;


                client.guilds.fetch()
                .then((guildObjects) => getGuildsForPage(guildObjects))
                .catch((error) => {
                    logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error fetching a guild", `guildId: ${guildId}, error: "${error}"`));

                    interaction.reply({embeds: [deniedMessage("Error catching guilds")]})
                    .catch((error) => logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while sending interaction reply", `code: "err_int_reply", error: "${error}"`)));
                });

                function getGuildsForPage(guildsCollection) {
                    const guildObjects = Array.from(guildsCollection.values());

                    const totalGuilds = guildObjects.length;
                    totalPages = Math.ceil(totalGuilds/maxGuildsPerPage);

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

                    const startValue = -maxGuildsPerPage+maxGuildsPerPage*requestedPage;
                    const endValue = startValue+maxGuildsPerPage;

                    const guildsForPageArray = Object.values(guildObjects).slice(startValue, endValue); //The guilds to use for the requested page

                    createGuildsEmbed(guildsForPageArray);
                };

                async function createGuildsEmbed(guildsArray) {

                    var guildNameArray = [];
                    var guildIdArray = [];
                    var guildMemberCountAndTimeoutRoleCountArray = [];

                    for (const guild of guildsArray) {
                        const guildName = guild.name;
                        const guildId = guild.id;

                        const cachedGuild = client.guilds.cache.get(guildId);

                        const guildMemberCount = cachedGuild?.memberCount;

                        const guildTimeoutRoles = await statGetRolesByGuild(guildId)
                        .catch((error) => logging.error(__filename, `Error getting this guilds timed role(s) from database. guildId: ${guildId}, error: "${error}"`));
                        const guildTimeoutRolesCount = guildTimeoutRoles.length;

                        if (guildName.length > 25) {
                            guildNameArray.push(`${guildName.slice(0, 26)}...`);
                        } else {
                            guildNameArray.push(guildName);
                        };
                        
                        guildIdArray.push(guildId);

                        const guildMemberAndTimeoutRoleCount = `${guildMemberCount} | ${guildTimeoutRolesCount}`;

                        guildMemberCountAndTimeoutRoleCountArray.push(guildMemberAndTimeoutRoleCount);
                    };

                    // Create the embed

                    //Transform the array you get with data to a string with every array value being a new line
                    function arrayToNewlineString (array) {
                        const string = array.toString();
                        const newLineString = string.replace(/,/g, "\n");

                        if (!newLineString) {
                            return "ERR - No Data";
                        }

                        return newLineString.slice(0, 1024);
                    }

                    const guildsEmbed = new EmbedBuilder()
                    .setTitle("Guilds")
                    .addFields(
                        {name: "Guild Name", value: arrayToNewlineString(guildNameArray), inline: true},
                        {name: "Guild Id", value:arrayToNewlineString(guildIdArray), inline: true},
                        {name: "Mem | TimeRo", value: arrayToNewlineString(guildMemberCountAndTimeoutRoleCountArray), inline: true},
                    )
                    .setFooter({text: `Page ${requestedPage}/${totalPages}`})
                    .setTimestamp();

                    //Send the embed
                    interaction.reply({embeds: [guildsEmbed]})
                    .catch((error) => logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while sending interaction reply", `Error: "${error}"`)));
                };
            };

        };
        
        // <--  guild Stats ====


        // ==== role Stats -->
        function roleStatsSubcommand() {

            const roleId = interaction.options.getString("role-id");
            const guildId = interaction.options.getString("guild-id");

            if (roleId) {
                roleStatsById();
            } else {
                roleList(guildId);
            };

            function roleStatsById() {

                // Get information about this role from the database
                statGetRole(roleId)
                .then((result) => createRoleStatEmbed(result))
                .catch((error) => {
                    logging.error(__filename, `Database error while getting timeout role. code: "err_datab_getRole", error: "${error}"`)

                    interaction.reply({embeds: [defaultMessage.generalCommandError("Database error", "err_datab_getRole")]})
                    .catch((error) => logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while sending interaction reply", `code: "err_int_reply", error: "${error}"`)));
                });

                async function createRoleStatEmbed(roleDatabaseInfo) {
                    const roleDatabaseInfoArray = roleDatabaseInfo[0];

                    if (!roleDatabaseInfoArray) {
                        interaction.reply({embeds: [deniedMessage("This isn't a ping timeout role")]})
                        .catch((error) => logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while sending interaction reply", `code: "err_int_reply", error: "${error}"`)));

                        return;
                    };

                    // Data from database
                    const guildId = roleDatabaseInfoArray.guildId;
                    const lastMention = roleDatabaseInfoArray.lastMention;
                    const timeoutDuration = roleDatabaseInfoArray.timeoutTime;
                    const mentionable = roleDatabaseInfoArray.mentionable;
                    const inError = roleDatabaseInfoArray.inError;


                    // General required data
                    const guildObject = await client.guilds.fetch(guildId)
                    .catch((error) => logging.error(__filename, `Error while fetching guild. error: "${error}"`));

                    const roleObject = await guildObject.roles.fetch(roleId)
                    .catch((error) => logging.error(__filename, `Error while fetching role. error: "${error}"`));

                    // Process data into usefull vars
                    const roleMembersObject = roleObject?.members;
                    var roleMemberCount = roleMembersObject?.size;
                    const roleName = roleObject?.name;
                    var roleColor = roleObject?.color;

                    const guildName = guildObject.name;
                    const guildMemberCount = guildObject.memberCount;

                    const timeoutDurationSec = timeoutDuration*60;

                    const lastMentionDate = new Date(lastMention);
                    const lastMentionDateMs = lastMentionDate.valueOf();
                    const lastMentionDateSec = lastMentionDateMs/1000;

                    const lastMentionFormat = `<t:${lastMentionDateSec}:F>`;

                    const timeoutEndTimeSec = lastMentionDateSec + timeoutDurationSec;
                    const roundToNearestMinSecs = 60-timeoutEndTimeSec%60;
                    const restTimeRounded = `<t:${timeoutEndTimeSec+roundToNearestMinSecs}:R>`;

                    function intToBool(int) {
                        if (int) {
                            return true;
                        } else {
                            return false;
                        };
                    };

                    if (roleMemberCount === null || roleMemberCount == "unknown") {
                        roleMemberCount = "Err | Can't fetch role";
                    };

                    if (roleColor === null || roleColor == "unknown") {
                        roleColor = 0;
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

                    const requiredPerms = [
                        PermissionFlagsBits.ManageRoles,
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.SendMessagesInThreads,
                        PermissionFlagsBits.EmbedLinks,
                        PermissionFlagsBits.UseExternalEmojis,
                        PermissionFlagsBits.UseApplicationCommands
                    ];

                    const clientUser = guildObject.members.me;
                    const clientRoles = await clientUser.roles;
                    const clientHighestRole = clientRoles.highest;

                    const roleInfoEmbed = new EmbedBuilder()
                    .setColor(roleColor)
                    .setTitle(`${roleName} (${roleId})`)
                    .addFields(
                        {name: "Guild", value: `${inlineCode(guildName)} \n (${inlineCode(guildId)})`, inline: true},
                        {name: "Guild Members", value: inlineCode(guildMemberCount), inline: true},
                        {name: "Role members", value: inlineCode(roleMemberCount), inline: true}
                    )
                    .addFields(
                        {name: "Mentionable", value: inlineCode(intToBool(mentionable)), inline: true},
                        {name: "In Error", value: inlineCode(intToBool(inError)), inline: true},
                        {name: "\n", value: "\n", inline: true},
                    )
                    .addFields(
                        {name: "Timeout", value: inlineCode(secondsToDhms(timeoutDurationSec)), inline: true},
                        {name: "Last Mention", value: lastMentionFormat, inline: true},
                        {name: "Rest Time", value: restTimeRounded, inline: true}
                    )
                    .addFields(
                        {name: "Bot has req perms", value: inlineCode(botHasRequiredPerms(requiredPerms, clientUser)), inline: true}, //Has the bot the required perms? true/false
                        {name: "Is bot highest role", value: inlineCode(isBotHighestRole(clientHighestRole, roleObject)), inline: true}, //Is the role the bots highest role? true/false
                        {name: "Bot high role is higher", value: inlineCode(rolePosHiger(clientHighestRole, roleObject)), inline: true} //Is the bots highest role higher? true/false
                    )
                    .setTimestamp();

                    interaction.reply({embeds: [roleInfoEmbed]})
                    .catch(error => logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while sending interaction reply", `code: "err_int_reply", error: "${error}"`)));
                };
            };

            function roleList(guildId) {
                const defaultPage = 1;
                const maxRolesPerPage = 25;
                const minPage = 1; //Also set in command min_value;
                const maxPage = 99; //Also set in command max_value;

                //Set globally required vars;
                var totalPages;
                var requestedPage;

                var guilds;
                if (guildId) {
                    statGetRolesByGuild(guildId)
                    .then((roles) => getRolesPerPage(roles))
                    .catch((error) => {
                        logging.error(__filename, `Error getting timeout roles filtered by guild from the database. code: "err_datab_getRoles_byGui", errorCode: "${error.code}", error: "${error}"`)
                    
                        interaction.reply({embeds: [defaultMessage.generalCommandError("Database error", "err_datab_getRoles_byGui")]})
                        .catch((error) => logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while sending interaction reply", `code: "err_int_reply", error: "${error}"`)));
                    });
                } else {
                    statGetAllRoles()
                    .then((roles) => getRolesPerPage(roles))
                    .catch((error) => {
                        logging.error(__filename, `Error getting timeout roles from the database. code: "err_datab_getRoles", errorCode: "${error.code}", error: "${error}"`)
                    
                        interaction.reply({embeds: [defaultMessage.generalCommandError("Database error", "err_datab_getRoles")]})
                        .catch((error) => logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while sending interaction reply", `code: "err_int_reply", error: "${error}"`)));
                    });
                };

                return; //End of normal code. Rest will be handled in functions

                function getRolesPerPage(roles) {
                    // Check if the database actually gave roles
                    if (!roles[0]) {
                        if (guildId) {
                            interaction.reply({embeds: [deniedMessage("This guild has no Timeout roles")]})
                            .catch((error) => logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while sending interaction reply", `code: "err_int_reply", error: "${error}"`)));
                        } else {
                            interaction.reply({embeds: [deniedMessage("No Timeout roles found")]})
                            .catch((error) => logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while sending interaction reply", `code: "err_int_reply", error: "${error}"`)));
                        };
                        return;
                    };

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

                    processRoles(rolesForPage);
                };

                async function processRoles(roles) {

                    //Set the vars that data will be pushed to
                    var roleInfoArray = [];
                    var guildInfoArray = [];

                    //Process all the roles
                    for (const role of roles) {
                        //Get required data from the database query

                        const timeoutRoleId = role.roleId;
                        const timeoutGuildId = role.guildId;

                        //Get role/guild info from discord

                        const timeoutGuildObject = await client.guilds.fetch(timeoutGuildId)
                        .catch((error) => logging.error(__filename, logTemplates.commandInteractionException(interaction, `Error while fetching guild from discord. error: ${error}`)));

                        const timeoutRoleObject = await timeoutGuildObject?.roles.fetch(timeoutRoleId)
                        .catch((error) => logging.error(__filename, logTemplates.commandInteractionException(interaction, `Error while fetching role from discord. error: ${error}`)));

                        const timeoutGuildName = timeoutGuildObject?.name;
                        const timeoutRoleName = timeoutRoleObject?.name;

                        var formattedRoleName;
                        if (timeoutRoleName?.length > 35) {
                            formattedRoleName = `${timeoutRoleName.slice(0,33)}...`;
                        } else {
                            formattedRoleName = timeoutRoleName;
                        };

                        var formattedGuildName;
                        if (timeoutGuildName?.length > 35) {
                            formattedGuildName = `${timeoutGuildName.slice(0,33)}...`;
                        } else {
                            formattedGuildName = timeoutGuildName;
                        };

                        const formattedRoleInfo = inlineCode(`${formattedRoleName}\n(${timeoutRoleId})`);
                        const formattedGuildInfo = inlineCode(`${formattedGuildName}\n(${timeoutGuildId})`);

                        roleInfoArray.push(formattedRoleInfo);
                        guildInfoArray.push(formattedGuildInfo);
                    };

                    //Transform the array you get with data to a string with every array value being a new line
                    function objectToNewlineString (array) {
                        const string = array.toString();
                        const newLineString = string.replace(/,/g, "\n");

                        return newLineString.slice(0, 1024);
                    };

                    var embedTitle;
                    if (guildId) {
                        embedTitle = `Guild Timeout Roles: ${guildId}`;
                    } else {
                        embedTitle = "All Timeout Roles";
                    };

                    const embed = new EmbedBuilder()
                    .setTitle(embedTitle)
                    .addFields(
                        {name: 'ROLE', value: objectToNewlineString(roleInfoArray), inline: true},
                        {name: 'GUILD', value: objectToNewlineString(guildInfoArray), inline: true}
                    )
                    .setFooter({text: `Page ${requestedPage}/${totalPages}`})
                    .setTimestamp();

                    interaction.reply({embeds: [embed]})
                    .catch((error) => logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while sending interaction reply", `code: "err_int_reply", error: "${error}"`)));
            
                    return; //End of this command;
                };
            };
        };
        // <-- role Stats ====

        // ==== Global Stats -->

        async function globalStatsSubcommand() {

            //Set required vars
            const clientUser = client.user;

            const clientUsername = clientUser.username;
            const clientUserTag = clientUser.tag;
            
            var clientUserNameFormat;
            if (clientUserTag) {
                clientUserNameFormat = clientUserTag;
            } else {
                clientUserNameFormat = clientUsername;
            };

            const clientUserId = clientUser.id;
            const allGuilds = await client.guilds.fetch()
            .catch((error) => logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while fetching all guilds")));
            const totalGuildsCount = allGuilds.size;

            // Get the total timeout roles from the database
            const totalTimeoutRolesRaw = await statGetAllRolesCounted()
            .catch((error) => logging.error(__filename, `Error getting the total role count from the database. error: "${error}"`));
            const totalTimeoutRoles = totalTimeoutRolesRaw[0].totalTimeoutRoles;

            const globalStatEmbed = new EmbedBuilder()
            .setTitle("Ping Timeout Global Stats")
            .setThumbnail(client.user.avatarURL())
            .addFields(
                {
                    name: "Bot Name",
                    value: inlineCode(clientUserNameFormat),
                    inline: true,
                },
                {
                    name: "BotId",
                    value: inlineCode(clientUserId),
                    inline: true,
                },
                {
                    name: "Guilds",
                    value: inlineCode(totalGuildsCount),
                    inline: true,
                },
                {
                    name: "Timed Roles",
                    value: inlineCode(totalTimeoutRoles),
                },
            )
            .setTimestamp();
            
            interaction.reply({embeds: [globalStatEmbed]})
            .catch((error) => logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while sending interaction reply", `code: "err_int_reply", error: "${error}"`)));
        }

        // <-- Global Stats ====


        // <--- Functions for the different subCommands ====

    },
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
};