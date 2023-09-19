const { PermissionFlagsBits, ApplicationCommandOptionType, EmbedBuilder, inlineCode, Embed } = require("discord.js");
const registerPublicCommands = require('../../events/ready/02registerPublicCommands');
const registerTestCommands = require('../../events/ready/03registerTestCommands');
const { deniedMessage } = require(`../../utils/baseUtils/defaultEmbeds`);
const { statGetRole, statGetRolesByGuild, statGetAllRoles } = require("../../utils/database/DEV/stats");
const { timeout } = require("nodemon/lib/config");

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
    ],

    //deleted: Boolean,
    devOnly: Boolean,
    testCommand: Boolean,

    callback: async (client, interaction) => {
        const subCom = interaction.options._subcommand;

        if (subCom === "guilds") {
            
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
                        name: "Membercount",
                        value: inlineCode(guildMemberCount),
                        inline: false,
                    }
                )
                .setThumbnail(guild.iconURL())
                .setTimestamp();

                interaction.reply({embeds: [embed]});
            } else {
                if (!page) {
                    page = 1;
                }
                
                var counter = 0;
                var guildInfo = [];
                for (const guild of guilds) {
                    guildInfo[counter] = {id: guild[1].id, name: guild[1].name};
                    counter++;
                }
                const totalPage = Math.ceil((counter+1)/20);

                if (page > totalPage) {
                    interaction.reply({embeds: [deniedMessage(`There are only ${totalPage} page(s)`)]})
                    return;
                };

                const guildNrStart = (page-1)*20;

                var embedFieldCount = 0;
                var embedFields = []
                for (let guildNrCount = guildNrStart; guildNrCount < guildNrStart+20; guildNrCount++) {
                    if (!guildInfo[guildNrCount]) continue;

                    embedFields[embedFieldCount] = {name: guildInfo[guildNrCount].name, value: `GuildId: ${inlineCode(guildInfo[guildNrCount].id)}`};
                    embedFieldCount++;
                }

                const embed = {
                    color: 0x327fa8,
                    title: "Guilds",
                    fields: embedFields,
                    timestamp: new Date().toISOString(),
                    footer: {
                        text: `Page ${page}/${totalPage}`
                    },
                };

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

            if (roleId) {
                const page = interaction.options.get("page")?.value;
                const guildId = interaction.options.get("guild-id")?.value;
                const roleId = interaction.options.get("role-id")?.value;
    
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
    
                    client.guilds.fetch();
                    const guildInfo = client.guilds.cache.get(guildId);
                    guildInfo.roles.fetch();
                    const roleInfo = guildInfo.roles.cache.get(roleId);
    
                    const memberCount = guildInfo.memberCount;
    
                    //set rest time
                    const mentionDateMs = Date.parse((lastmention)?.toUTCString());
                    const mentionDateSec = mentionDateMs/1000
    
                    var restTime;
                    if (mentionable === 1) {
                        restTime = "--:--";
                    } else {
                        if (!lastmention) {
                            restTime = "--:--";
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
                        {name: "Mentionable", value: inlineCode(mentionable), inline: false},
                    )
                    .addFields(
                        {name: "Timeout", value: inlineCode(secondsToDhms(timeoutTime*60)), inline: true},
                        {name: "Last Mention", value: inlineCode(lastmention), inline: true},
                        {name: "Rest Time", value: inlineCode(restTime), inline: true}
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