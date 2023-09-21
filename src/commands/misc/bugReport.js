const { EmbedBuilder, inlineCode, Embed, ApplicationCommand, ApplicationCommandOptionType, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, WebhookClient} = require('discord.js');
const { aprovedMessage } = require('../../utils/baseUtils/defaultEmbeds');
module.exports = {
    name: "bug-report",
    description: 'Report a bug in the bot',
    defaultMemberPermissions: null,
    modals: ["bugreport"],
    // devOnly: Boolean,
    // deleted: Boolean,
    // testCommand: Boolean,

    callback: async (client, interaction) => {
        const reportModal = new ModalBuilder()
            .setCustomId("bug-report")
            .setTitle("Bug Report Form");

        
        const bugMessage = new TextInputBuilder()
            .setCustomId("bugReportFormMessage")
            .setLabel("Describe the bug that you are experiencing")
            .setStyle(TextInputStyle.Paragraph);

        const reportModalRowOne = new ActionRowBuilder().addComponents(bugMessage);

        reportModal.addComponents(reportModalRowOne);

        await interaction.showModal(reportModal)
    },

    modal: async (client, interaction) => {
        const { bugReportWebhookId, bugReportWebhookToken} = require('../../../config.json');

        const bugReportMessage = interaction.fields.getTextInputValue('bugReportFormMessage');

        const userInfo = interaction.user;
        const globalName = userInfo.globalName;
        const userAvatar = userInfo.avatarURL();

        const guildId = interaction.guildId;

        const bugEmbed = new EmbedBuilder()
        .setTitle('Bug Report')
        .setAuthor({name: globalName, iconURL: userAvatar})
        .setDescription(bugReportMessage)
        .setFooter({text: `GuildId: ${guildId}`})
        .setTimestamp();

        const botName = client.user.username;
        const botAvatar = client.user.avatarURL();

        const webhookClient = new WebhookClient({id: bugReportWebhookId, token: bugReportWebhookToken});

        webhookClient.send({
            username: botName,
            avatarURL: botAvatar,
            embeds: [bugEmbed],
        });

        interaction.reply({embeds: [aprovedMessage("Thank you for submitting this bug report!")], ephemeral: true})
    }
}