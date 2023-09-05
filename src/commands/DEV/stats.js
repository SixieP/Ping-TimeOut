const { PermissionFlagsBits, ApplicationCommandOptionType, EmbedBuilder, inlineCode, Embed } = require("discord.js");
const registerPublicCommands = require('../../events/ready/02registerPublicCommands');
const registerTestCommands = require('../../events/ready/03registerTestCommands');
const { deniedMessage } = require(`../../utils/baseUtils/defaultEmbeds`);

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

                //console.log(guilds);

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
                } else
                
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
                    timestap: new Date().toISOString(),
                    footer: {
                        text: `Page ${page}/${totalPage}`
                    },
                };

                interaction.reply({embeds: [embed]});

            }
        }
    },
};