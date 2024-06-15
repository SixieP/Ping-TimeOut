const { EmbedBuilder, inlineCode, Embed, ApplicationCommand, ApplicationCommandOptionType, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, WebhookClient, bold, codeBlock} = require('discord.js');
const { aprovedMessage, deniedMessage } = require('../../utils/baseUtils/defaultEmbeds');
const { blacklistedUser } = require('../../utils/database/DEV/bugReportBlacklist');
const logging = require('../../utils/baseUtils/logging');
module.exports = {
    name: "feedback",
    description: 'Submit feedback',
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

        // Use the same blacklist as bug report
        const checkUser = await blacklistedUser(userId)
        .catch((error) => logging.error(__filename, `Error fetching blacklisted users from database. interactionUserId: "${userId}", error: "${error}"`));

        if (checkUser?.userId === userId) {
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
            .setCustomId("feedback")
            .setTitle("Feedback Form");
        
        const bugMessage = new TextInputBuilder()
            .setCustomId("feedbackFormMessage")
            .setLabel("What feedback do you have?")
            .setStyle(TextInputStyle.Paragraph);

        const errCode = new TextInputBuilder()
            .setCustomId("feedbackFormContactMethod")
            .setLabel("Can we contact you and if so how?")
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
            .setMaxLength(150)
            .setPlaceholder("DM @SixieP - discord.gg/invite/INVITE - any other way");

        const reportModalRowOne = new ActionRowBuilder().addComponents(bugMessage);
        const reportModalRowTwo = new ActionRowBuilder().addComponents(errCode);

        reportModal.addComponents(reportModalRowOne);
        reportModal.addComponents(reportModalRowTwo);

        await interaction.showModal(reportModal)
    },

    modal: async (client, interaction) => {
        const { feedbackWebhookId, feedbackWebhookToken} = require('../../../config.json');

        const feedbackFormMessage = interaction.fields.getTextInputValue('feedbackFormMessage');
        const feedbackFormContactMethod = interaction.fields.getTextInputValue('feedbackFormContactMethod');

        const userInfo = interaction.user;
        const globalName = userInfo.globalName;
        const userId = userInfo.id;
        const userAvatar = userInfo.avatarURL();

        const guildId = interaction.guildId;

        const bugEmbed = new EmbedBuilder()
        .setTitle('Feedback')
        .setAuthor({name: `${globalName} (${userId})`, iconURL: userAvatar})
        .setDescription(codeBlock(feedbackFormMessage))
        .setFields(
            { name: "Way to contact", value: codeBlock(feedbackFormContactMethod || "No contact method given")}
        )
        .setFooter({text: `GuildId: ${guildId}`})
        .setTimestamp();

        const botName = client.user.username;
        const botAvatar = client.user.avatarURL();

        const webhookClient = new WebhookClient({id: feedbackWebhookId, token: feedbackWebhookToken});

        webhookClient.send({
            username: botName,
            avatarURL: botAvatar,
            embeds: [bugEmbed],
        });

        interaction.reply({embeds: [aprovedMessage("Thank you for submitting feedback!")], ephemeral: true})
    }
}
