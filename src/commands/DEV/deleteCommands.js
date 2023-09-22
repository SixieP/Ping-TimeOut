const { PermissionFlagsBits, ApplicationCommandOptionType } = require("discord.js");

const getApplicationCommands = require('../../utils/baseUtils/getApplicationCommands');
const getLocalCommands = require('../../utils/baseUtils/getLocalCommands');

const { testGuild } = require('../../../config.json');
const { aprovedMessage, deniedMessage } = require("../../utils/baseUtils/defaultEmbeds");
const { logging } = require("../../utils/baseUtils/logging");

module.exports = {
    name: "dev-delete_commands",
    description: "Reload all commands while you don't have to restart the bot",
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
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

                logging("dev", "Start deleting commands", "pub_command")
                for (const appCommand of appCommands.cache) {
                    appCommands.delete(appCommand[1].id)
                }
                logging("dev", "End deleting commands", "pub_command")

                
                interaction.editReply({embeds: [aprovedMessage("All global (public) commands are removed!")], ephemeral: true})

            } catch (error) {
                console.log(error);

                interaction.editReply({embeds: [deniedMessage("There was an error removing the guild (test) commands!")], ephemeral: true})
            }
        }
        if (commandName === "test") {
            try {
                const appCommands = await getApplicationCommands(client, testGuild);

                logging("dev", "Start deleting commands", "test_command")
                for (const appCommand of appCommands.cache) {
                    appCommands.delete(appCommand[1].id)
                }
                logging("dev", "End deleting commands", "test_command")


                interaction.editReply({embeds: [aprovedMessage("All guild (test) commands are removed!")], ephemeral: true})

            } catch (error) {
                logging("error", error);

                interaction.editReply({embeds: [deniedMessage("There was an error removing the guild (test) commands!")], ephemeral: true})
            }
        }
    },
};