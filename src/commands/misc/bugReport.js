const { EmbedBuilder, inlineCode, Embed, ApplicationCommand, ApplicationCommandOptionType, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, WebhookClient, bold, codeBlock} = require('discord.js');
const { aprovedMessage, deniedMessage } = require('../../utils/baseUtils/defaultEmbeds');
const { blacklistedUser } = require('../../utils/database/DEV/bugReportBlacklist');
const logging = require('../../utils/baseUtils/logging');
module.exports = {
    name: "bug-report",
    description: 'Report a bug in the bot',
    defaultMemberPermissions: null,
    context: [0],
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

        //LATER: Add error code field

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
        const userId = userInfo.id;
        const userAvatar = userInfo.avatarURL();

        const guildId = interaction.guildId;

        const bugEmbed = new EmbedBuilder()
        .setTitle('Bug Report')
        .setAuthor({name: `${globalName} (${userId})`, iconURL: userAvatar})
        .setDescription(codeBlock(bugReportMessage))
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

        interaction.reply({embeds: [aprovedMessage("Thank you for submitting a bug report!")], ephemeral: true})
    }
}
