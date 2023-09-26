/*
What does this command do?

This command is used to get stats from the bot that the dev can use. Besides that it is also used to check info about guilds and roles incase a bug has been reported.

*/


const { PermissionFlagsBits, ApplicationCommandOptionType, EmbedBuilder, inlineCode, Embed } = require("discord.js");
const registerPublicCommands = require('../../events/ready/02registerPublicCommands');
const registerTestCommands = require('../../events/ready/03registerTestCommands');
const { deniedMessage } = require(`../../utils/baseUtils/defaultEmbeds`);
const { statGetRole, statGetRolesByGuild, statGetAllRoles } = require("../../utils/database/DEV/stats");
const { timeout } = require("nodemon/lib/config");
const { getAllRoles } = require("../../utils/database/botStatus.js/setStatus");

module.exports = {
    name: "dev-stats",
    description: "Reload all commands while you don't have to restart the bot",
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
    options: [
        {
            name: "guilds",
            description: "Get all guilds that the bot is part of",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "page",
                    description: "The page you want to see (default is 1)",
                    type: ApplicationCommandOptionType.Integer,
                },
                {
                    name: "guildid",
                    description: "Info about a specific guild",
                    type: ApplicationCommandOptionType.String,
                }
            ],
        },
        {
            name: "roles",
            description: "Get all guilds that the bot is part of",
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: "page",
                    description: "The page you want to see (default is 1)",
                    type: ApplicationCommandOptionType.Integer,
                },
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
        const subCom = interaction.options._subcommand;

        if (subCom === "guilds") {
            
            client.guilds.fetch();
            const guilds = client.guilds.cache;
            const guildIdIn = interaction.options.get('guildid')?.value;
            var page = interaction.options.get('page')?.value;

            if (guildIdIn) {

                const guild = guilds?.find(
                    (guildFind) => guildFind.id === guildIdIn
                );

                if (!guild) {
                    interaction.reply({embeds: [deniedMessage("Couldn't find that guild")]});
                    return;
                }

                const guildId = guild.id;
                const guildName = guild.name;
                const guildMemberCount = guild.memberCount;
                const timedRoles = await statGetRolesByGuild(guild.id);

                const guildOwnerId = guild.ownerId;

                await client.users.fetch(guildOwnerId);
                const guildOwnerInfo = client.users.cache.get(guildOwnerId);

                var guildOwnerName
                if (!guildOwnerInfo) {
                    guildOwnerEmbedInfo = `(${guildOwnerId})`;
                } else {
                    guildOwnerEmbedInfo = `${guildOwnerInfo.globalName} (${guildOwnerId})`;
                }

                
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
                        value: inlineCode(guildOwnerEmbedInfo),
                        inline: true,
                    },
                    {
                        name: "Timed Roles",
                        value: inlineCode(Object.keys(timedRoles).length),
                        inline: true,
                    },
                    {
                        name: "Membercount",
                        value: inlineCode(guildMemberCount),
                        inline: false,
                    },
                )
                .setThumbnail(guild.iconURL())
                .setTimestamp();

                interaction.reply({embeds: [embed]});
            } else {
                var page;
                if (interaction.options.get('page') !== null) {
                    page = interaction.options.get('page')?.value;
                } else {
                    page = 1
                }
                
                client.guilds.fetch();
                const totalGuilds = client.guilds.cache.size;
                const totalPages = Math.ceil(totalGuilds/20)

                const allGuildsInfo = client.guilds.cache;
                const allGuildIds =  allGuildsInfo.map(guild => guild.id);
                
                var guildIds = "";
                var guildMembers = "";
                var guildTimedRoles = "";


                const startGuildNr = totalPages*20-20;
                const endGuildNr = startGuildNr+19
                for (guildObjectNr = startGuildNr; guildObjectNr < endGuildNr; guildObjectNr++) {
                    if (guildObjectNr < totalGuilds) {
                        const guild = client.guilds.cache.get(allGuildIds[guildObjectNr]);
                        const timedRoles = await statGetRolesByGuild(guild.id);

                        guildIds = guildIds + `${inlineCode(guild.name)} (${(inlineCode(guild.id))}) \n`;
                        guildMembers = guildMembers + `${inlineCode(guild.memberCount)} \n`;
                        guildTimedRoles = guildTimedRoles + `${inlineCode(Object.keys(timedRoles).length)} \n`;
                    }
                }

                const embed = new EmbedBuilder()
                .setTitle("Ping TimeOut Guilds")
                .addFields(
                    {name: "Guild (ID)", value: guildIds.substring(0, 1024), inline: true},
                    {name: "Total Members", value: guildMembers.substring(0, 1024), inline: true},
                    {name: "Timed Roles", value: guildTimedRoles.substring(0, 1024), inline: true},
                )
                .setFooter({text: `page ${page}/${totalPages}`})
                .setTimestamp();

                interaction.reply({embeds: [embed]});

            }
        };

        if (subCom === "roles") {
            var page;
            if (interaction.options.get('page') !== null) {
                page = interaction.options.get('page')?.value;
            } else {
                page = 1
            }

            const guildId = interaction.options.get('guild-id')?.value;
            const roleId = interaction.options.get('role-id')?.value

            if (guildId && roleId) {
                interaction.reply({embeds: [deniedMessage("You cant use both the guild-id and role-id argument at the same time")]});
                return;
            }

            if (roleId) {
    
                if (roleId) {
                    const databaseRoleInfo = await statGetRole(roleId);
    
                    if (!databaseRoleInfo) {
                        interaction.reply({embeds: [deniedMessage("This role doesnt have a entry into the database")], ephemeral: true});
                        return;
                    }
    
                    const guildId = databaseRoleInfo[0].guildId;
                    const lastmention = databaseRoleInfo[0].lastMention;
                    const timeoutTime = databaseRoleInfo[0].timeoutTime;
                    var mentionable = databaseRoleInfo[0].mentionable;
    
                    if (mentionable = 1) {
                        mentionable = "true"
                    } else {
                        mentionable = "false"
                    }

                    const inError = databaseRoleInfo[0].inError;
                    var errorStatus;
                    if (inError === 1 | inError === "true") {
                        errorStatus = "True";
                    } else {
                        errorStatus = "False";
                    };

    
                    client.guilds.fetch();
                    const guildInfo = client.guilds.cache.get(guildId);
                    guildInfo.roles.fetch();
                    const roleInfo = guildInfo.roles.cache.get(roleId);
    
                    const memberCount = guildInfo.memberCount;
    
                    //set rest time
                    const mentionDateMs = Date.parse((lastmention)?.toUTCString());
                    const mentionDateSec = mentionDateMs/1000

                    var embedMentionTime;
                    if (lastmention === null) {
                        embedMentionTime = inlineCode("Null")
                    } else {
                        embedMentionTime = `<t:${mentionDateSec}:f>`
                    }
    
                    var restTime;
                    if (mentionable === 1) {
                        restTime = inlineCode("--:--");
                    } else {
                        if (!lastmention) {
                            restTime = inlineCode("--:--");
                        } else {
                            restTime = `<t:${mentionDateSec+timeoutTime*60}:R>`;
                        }
                    }
    
                    const roleUsers = roleInfo.members.map(m=>m.user.tag);
    
                    const roleInfoEmbed = new EmbedBuilder()
                    .setColor(roleInfo.color)
                    .setTitle(`${roleInfo.name} (${roleId})`)
                    .addFields(
                        {name: "Guild", value: `${inlineCode(guildInfo.name)} (${inlineCode(guildInfo.id)})`, inline: true},
                        {name: "Members", value: inlineCode(memberCount.toString()), inline: true},
                        {name: "Role members", value: inlineCode(roleUsers.length), inline: true}
                    )
                    .addFields(
                        {name: "Mentionable", value: inlineCode(mentionable), inline: true},
                        {name: "In Error", value: inlineCode(errorStatus), inline: true},
                        {name: "\n", value: "\n", inline: true},
                    )
                    .addFields(
                        {name: "Timeout", value: inlineCode(secondsToDhms(timeoutTime*60)), inline: true},
                        {name: "Last Mention", value: embedMentionTime, inline: true},
                        {name: "Rest Time", value: restTime, inline: true}
                    )
                    .setTimestamp();
    
                    interaction.reply({embeds: [roleInfoEmbed], ephemeral: true});
                }
                return;
            };

            if (guildId) {
                const rolesinfo = await statGetRolesByGuild(guildId);

                if (!rolesinfo[0]) {
                    interaction.reply({embeds: [deniedMessage("This guide has no TimeOut roles :/")], ephemeral: true});
                    return;
                }

                const guildName = interaction.guild.name;

                const embed = await rolesList(client, guildName, rolesinfo, page);

                interaction.reply({embeds: [embed], ephemeral: true});

                return;
            };

            const globalRoles = await statGetAllRoles();

            if (!globalRoles[0]) {
                interaction.reply({embeds: [deniedMessage("There are no TimeOut roles :/")]})
            }

            const title = "Global";

            const embed = await rolesList(client, title, globalRoles, page);

            interaction.reply({embeds: [embed], ephemeral: true});
        };  

        if (subCom === "global") {

            await client.guilds.fetch()
            const totalGuilds = client.guilds.cache.size;

            const queryRespone = await getAllRoles();
            const totalTimedRoles = queryRespone[0].roles

            const globalStatEmbed = new EmbedBuilder()
            .setTitle("Ping Timeout Global Stats")
            .setThumbnail(client.user.avatarURL())
            .addFields(
                {
                    name: "Bot Name",
                    value: inlineCode(client.user.username),
                    inline: true,
                },
                {
                    name: "BotId",
                    value: inlineCode(client.user.id),
                    inline: true,
                },
                {
                    name: "Guilds",
                    value: inlineCode(totalGuilds),
                    inline: true,
                },
                {
                    name: "Timed Roles",
                    value: inlineCode(totalTimedRoles),
                },
            )
            .setTimestamp();
            
            interaction.reply({embeds: [globalStatEmbed]})
        }
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

async function rolesList (client, title, roles, page) {
    const totalRoles = roles.length;
    const totalPages = Math.ceil(totalRoles/20)

    const startRole = page*20-20;
    if (startRole+1 > totalRoles) {
        return deniedMessage(`Page ${inlineCode(page)} doesn't exist. Max page is ${inlineCode(totalPages)}`);
    }

    const embedTitle = `${title} TimeOut role(s)`
    
    var roleNames = "";
    var roleGuilds = "";
    
    const endRole = startRole+20
    for (roleObjectNr = startRole; roleObjectNr < endRole; roleObjectNr++) {
        if (totalRoles > roleObjectNr) {
            const guildData = client.guilds.cache.get(roles[roleObjectNr].guildId);
            const roleData = guildData.roles.cache.get(roles[roleObjectNr].roleId);

            roleNames = roleNames + `${inlineCode(roleData.name)} (${inlineCode(roleData.id)}) \n`;
            roleGuilds = roleGuilds + `${inlineCode(guildData.name)} (${inlineCode(guildData.id)}) \n`;
        };
    };

    const rolesEmbed = new EmbedBuilder()
    .setTitle(embedTitle)
    .addFields(
        {name: 'ROLE', value: roleNames, inline: true},
        {name: 'GUILD', value: roleGuilds, inline: true}
    )
    .setFooter({text: `Page: ${page}/${totalPages}`})
    .setTimestamp();
    return rolesEmbed;
}