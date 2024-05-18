const { PermissionFlagsBits, ApplicationCommandOptionType } = require("discord.js");

const getApplicationCommands = require('../../utils/baseUtils/getApplicationCommands');
const getLocalCommands = require('../../utils/baseUtils/getLocalCommands');

const { testGuild } = require('../../../config.json');
const { aprovedMessage, deniedMessage } = require("../../utils/baseUtils/defaultEmbeds");

const logging = require("../../utils/baseUtils/logging");
const logTemplates = require("../../utils/baseUtils/logTemplates");

module.exports = {
    name: "dev-delete_commands",
    description: "Reload all commands while you don't have to restart the bot",
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
    context: [0],
    options: [
        {
            name: "command-channel",
            description: "The command type",
            required: true,
            type: ApplicationCommandOptionType.String,
            choices: [
                {
                    name: "Public",
                    value: "public",
                },
                {
                    name: "Test",
                    value: "test",
                },
            ],
        },
    ],

    //deleted: Boolean,
    devOnly: Boolean,
    testCommand: Boolean,

    callback: async (client, interaction) => {
        const commandName = interaction.options.get('command-channel').value;
        await interaction.deferReply({ephemeral: true});

        if (commandName === "public") {
            try {
                const appCommands = await getApplicationCommands(client);

                logging.warn(__filename, logTemplates.commandInteractionInfo(interaction, "DEV COMMAND - Start deleting public commands"));
                for (const appCommand of appCommands.cache) {
                    appCommands.delete(appCommand[1].id)
                    logging.warn(__filename, logTemplates.commandInteractionInfo(interaction, `DEV COMMAND - Deleted the "public"command: "${appCommand[1].name} (${appCommand[1].id})"`));
                }
                logging.warn(__filename, logTemplates.commandInteractionInfo(interaction, "DEV COMMAND - End deleting public commands"));

                
                interaction.editReply({embeds: [aprovedMessage("All global (public) commands are removed!")], ephemeral: true})

            } catch (error) {
                console.log(error);

                interaction.editReply({embeds: [deniedMessage("There was an error removing the guild (test) commands!")], ephemeral: true})
            }
        }
        if (commandName === "test") {
            try {
                const appCommands = await getApplicationCommands(client, testGuild);

                logging.warn(__filename, logTemplates.commandInteractionInfo(interaction, "DEV COMMAND - Start deleting test commands"));
                for (const appCommand of appCommands.cache) {
                    appCommands.delete(appCommand[1].id)
                    logging.warn(__filename, logTemplates.commandInteractionInfo(interaction, `DEV COMMAND - Deleted the "test"command: "${appCommand[1].name} (${appCommand[1].id})"`));

                }
                logging.warn(__filename, logTemplates.commandInteractionInfo(interaction, "DEV COMMAND - End deleting test commands"));


                interaction.editReply({embeds: [aprovedMessage("All guild (test) commands are removed!")], ephemeral: true})

            } catch (error) {
                logging.error(__filename, logTemplates.commandInteractionException(interaction, `DEV COMMAND - Error while deleting command's`));

                interaction.editReply({embeds: [deniedMessage("There was an error removing the guild (test) commands!")], ephemeral: true});
            }
        }
    },
};