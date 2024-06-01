const { EmbedBuilder, inlineCode, Embed, ApplicationCommand, ApplicationCommandOptionType, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, WebhookClient, bold, codeBlock} = require('discord.js');
const { aprovedMessage, deniedMessage } = require('../../utils/baseUtils/defaultEmbeds');
const { blacklistedUser } = require('../../utils/database/DEV/bugReportBlacklist');
const logging = require('../../utils/baseUtils/logging');
module.exports = {
    name: "bug-report",
    description: 'Report a bug in the bot',
    defaultMemberPermissions: null,
    contexts: [0, 1],
    intergration_types: [0],
    dm_permission: true,
    cooldown: 60,
    // devOnly: Boolean,
    // deleted: Boolean,
    // testCommand: Boolean,

    callback: async (client, interaction) => {
        const userId = interaction.user.id;

        const checkUser = await blacklistedUser(userId)
        .catch((error) => logging.error(__filename, `Error fetching blacklisted users from database. interactionUserId: "${userId}", error: "${error}"`));

        if (checkUser?.userId === userId) { //FIX: Fix user blacklist code.
            if (checkUser?.blacklistReason) {
                interaction.reply({embeds: [deniedMessage(`You can't submit a bug-report due to you being blacklisted!\n
                ${bold("Reason:")}
                ${codeBlock(checkUser.blacklistReason)}`)], ephemeral: true});
            } else {
                interaction.reply({embeds: [deniedMessage(`You can't submit a bug-report due to you being blacklisted!`)], ephemeral: true});
            };

            return;
        };

        const reportModal = new ModalBuilder()
            .setCustomId("bug-report")
            .setTitle("Bug Report Form");
        
        const bugMessage = new TextInputBuilder()
            .setCustomId("bugReportFormMessage")
            .setLabel("Describe the bug that you are experiencing")
            .setStyle(TextInputStyle.Paragraph);

        const errCode = new TextInputBuilder()
            .setCustomId("bugReportFormErrorCode")
            .setLabel("What error code did you get?")
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
            .setMaxLength(50);

        const guildIdName = new TextInputBuilder()
            .setCustomId("bugReportFormGuidIdName")
            .setLabel("Server name/id")
            .setStyle(TextInputStyle.Short)
            .setMaxLength(100)

        const reportModalRowOne = new ActionRowBuilder().addComponents(bugMessage);
        const reportModalRowTwo = new ActionRowBuilder().addComponents(errCode);
        const reportModalRowThree = new ActionRowBuilder().addComponents(guildIdName);

        reportModal.addComponents(reportModalRowOne);
        reportModal.addComponents(reportModalRowTwo);
        if (!interaction.guildId) {
            reportModal.addComponents(reportModalRowThree);
        };

        await interaction.showModal(reportModal)
    },

    modal: async (client, interaction) => {
        const { bugReportWebhookId, bugReportWebhookToken} = require('../../../config.json');

        const bugReportMessage = interaction.fields.getTextInputValue('bugReportFormMessage');
        const bugReportErrCode = interaction.fields.getTextInputValue('bugReportFormErrorCode');

        const userInfo = interaction.user;
        const globalName = userInfo.globalName;
        const userId = userInfo.id;
        const userAvatar = userInfo.avatarURL();

        const guildId = interaction.guildId;

        var bugEmbed;
        if (guildId) {
            bugEmbed = new EmbedBuilder()
            .setTitle('Bug Report')
            .setAuthor({name: `${globalName} (${userId})`, iconURL: userAvatar})
            .setDescription(codeBlock(bugReportMessage))
            .setFields(
                { name: "Error code", value: codeBlock(bugReportErrCode)}
            )
            .setFooter({text: `GuildId: ${guildId}`})
            .setTimestamp();
        } else {
            const bugReportGuildIdName = interaction.fields.getTextInputValue('bugReportFormGuidIdName');
            bugEmbed = new EmbedBuilder()
            .setTitle('Bug Report')
            .setAuthor({name: `${globalName} (${userId})`, iconURL: userAvatar})
            .setDescription(codeBlock(bugReportMessage))
            .setFields(
                { name: "Error code", value: codeBlock(bugReportErrCode)}
            )
            .setFooter({text: `GuildId/Name: ${bugReportGuildIdName}`})
            .setTimestamp();
        }

        const botName = client.user.username;
        const botAvatar = client.user.avatarURL();

        const webhookClient = new WebhookClient({id: bugReportWebhookId, token: bugReportWebhookToken});

        webhookClient.send({
            username: botName,
            avatarURL: botAvatar,
            embeds: [bugEmbed],
        });

        interaction.reply({embeds: [aprovedMessage("Thank you for submitting a bug report!")], ephemeral: true})
    }
}
