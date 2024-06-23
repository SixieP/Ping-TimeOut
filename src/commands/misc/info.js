const { EmbedBuilder, inlineCode } = require('discord.js');
const { deniedMessage, aprovedMessage } = require('../../utils/baseUtils/defaultEmbeds');
const { permsCheck } = require('../../utils/ping-timeout/permsCheck');
const packageJson = require('../../../package.json');

module.exports = {
    name: "info",
    description: 'Use this command to get information about the bot',
    defaultMemberPermissions: null,
    contexts: [0, 1],
    intergration_types: [0],
    dm_permission: true,
    // devOnly: Boolean,
    // deleted: Boolean,
    // testCommand: Boolean,

    callback: async (client, interaction) => {
        const appStartTime = (((new Date).valueOf()) - client.uptime)/1000 | 0;

        const embed = new EmbedBuilder()
            .setTitle("Ping TimeOut | Info")
            .setURL("https://github.com/SixieP/Ping-TimeOut")
            .addFields(
                { name: "User", value: inlineCode(client.user.displayName), inline: true },
                { name: "Author", value: inlineCode("@sixiep"), inline: true },
                { name: "Version", value: inlineCode(packageJson.version), inline: true },
                { name: "Uptime", value: `<t:${appStartTime}:R>`, inline: true },
            );

            interaction.reply({embeds: [embed]})
            .catch((error) => logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while sending interaction reply", `code: "err_int_reply", error: "${error}"`)));
    }
};