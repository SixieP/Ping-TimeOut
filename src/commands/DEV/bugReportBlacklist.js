const { EmbedBuilder, inlineCode, Embed, PermissionFlagsBits, ApplicationCommandOptionType, codeBlock, bold} = require('discord.js');
const { addUserToBlacklist, removeUserFromBlacklist, blacklistedUser } = require('../../utils/database/DEV/bugReportBlacklist');
const { deniedMessage, aprovedMessage } = require('../../utils/baseUtils/defaultEmbeds');

module.exports = {
    name: "dev-bug_report",
    description: 'Bug report blacklist command',
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
    options: [
        {
            name: "user",
            description: "(un)blacklist a user/get user info",
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
                {
                    name: "blacklist",
                    description: "Blacklist a user",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "user-id",
                            description: "The userId of the user that you want to blacklist",
                            type: ApplicationCommandOptionType.String,
                            required: true,
                        },
                        {
                            name: "reason",
                            description: "The reason why they are blacklisted",
                            type: ApplicationCommandOptionType.String,
                            maxLength: 1000,
                        },
                    ],
                },
                {
                    name: "un-blacklist",
                    description: "un-blacklist a user",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "user-id",
                            description: "The userId of the user that you want to un-blacklist",
                            type: ApplicationCommandOptionType.String,
                            required: true,
                        },
                    ],
                },
                {
                    name: "info",
                    description: "Get info about a blacklisted user",
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: "user-id",
                            description: "The userId of the user that you want info about",
                            type: ApplicationCommandOptionType.String,
                            required: true,
                        },
                    ],
                },
            ],
        },
    ],
    devOnly: Boolean,
    // inactive: Boolean,
    testCommand: Boolean,

    callback: async (client, interaction) => {
        const commGroup = interaction.options.getSubcommandGroup();
        const commName = interaction.options.getSubcommand();

        if (commGroup === "user") {
            if (commName === "blacklist") {
                const userId = interaction.options.get('user-id').value;
                const reason = interaction.options.get('reason')?.value;

                const blacklistUserQuery = await blacklistedUser(userId);
                if (blacklistUserQuery?.userId) {
                    interaction.reply({embeds: [deniedMessage("This user is already blacklisted")], ephemeral: true});
                    return;
                }

                const blacklistDate = new Date();

                if (reason) {
                    addUserToBlacklist(userId, blacklistDate, reason);
                    interaction.reply({embeds: [aprovedMessage(`Successfully blacklisted this user.\n ${bold("Reason:")}:\n${codeBlock(reason)}`)]})
                } else {
                    addUserToBlacklist(userId, blacklistDate);
                    interaction.reply({embeds: [aprovedMessage(`Successfully blacklisted this user`)]})
                };
            }

            if (commName === "un-blacklist") {
                const userId = interaction.options.get('user-id').value;

                const blacklistUserQuery = await blacklistedUser(userId);
                if (!blacklistUserQuery.userId) {
                    interaction.reply({embeds: [deniedMessage("This user is not blacklisted")], ephemeral: true});
                    return;
                }

                await removeUserFromBlacklist(userId);

                interaction.reply({embeds: [aprovedMessage("Succesfully un-blacklisted this user")], ephemeral: true})

            }

            if (commName === "info") {
                const userId = interaction.options.get('user-id').value;

                const blacklistUserQuery = await blacklistedUser(userId);
                if (!blacklistUserQuery?.userId) {
                    interaction.reply({embeds: [deniedMessage("This user is not blacklisted")], ephemeral: true});
                    return;
                }

                const blacklistUserId = blacklistUserQuery.userId;
                const blacklistDate = blacklistUserQuery.blacklistDate;
                var blacklistReason = blacklistUserQuery.reason;

                if (!blacklistReason) {
                    blacklistReason = "No reason"
                }

                const blacklistDateMs = Date.parse((blacklistDate)?.toUTCString());
                const blacklistDateSec = blacklistDateMs/1000

                const blacklistInfoEmbed = new EmbedBuilder()
                .setTitle("Bug-Report Blacklisted User")
                .addFields(
                    {name: "UserId", value: inlineCode(blacklistUserId), inline: true},
                    {name: "Date", value: `<t:${blacklistDateSec}:f>`, inline: true},
                    {name: "Reason", value: codeBlock(blacklistReason), inline: false},
                )
                .setTimestamp();

                interaction.reply({embeds: [blacklistInfoEmbed], ephemeral: true})
            }
        }

    }
}
