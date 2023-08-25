const { PermissionFlagsBits, ApplicationCommandOptionType } = require("discord.js");

const getApplicationCommands = require('../../utils/baseUtils/getApplicationCommands');
const getLocalCommands = require('../../utils/baseUtils/getLocalCommands');

const { testGuild } = require('../../../config.json');
const { aprovedMessage, deniedMessage } = require("../../utils/baseUtils/defaultEmbeds");

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


        if (commandName === "public") {
            try {
                const appCommands = await getApplicationCommands(client);

                console.log("DELETE-command | START deleting PUBLIC commands");
                for (const appCommand of appCommands.cache) {
                    appCommands.delete(appCommand[1].id)
                }
                console.log("DELETE-command | END deleting PUBLIC commands");

                
                interaction.reply({embeds: [aprovedMessage("Commands removed", "All global (public) commands are removed!")], ephemeral: true})

            } catch (error) {
                console.log(error);

                interaction.reply({embeds: [deniedMessage("Error", "There was an error removing the guild (test) commands!")], ephemeral: true})
            }
        }
        if (commandName === "test") {
            try {
                const appCommands = await getApplicationCommands(client, testGuild);

                console.log("DELETE-command | START deleting TEST commands");
                for (const appCommand of appCommands.cache) {
                    appCommands.delete(appCommand[1].id)
                }
                console.log("DELETE-command | END deleting TEST commands");


                interaction.reply({embeds: [aprovedMessage("Commands removed", "All guild (test) commands are removed!")], ephemeral: true})

            } catch (error) {
                console.log(error);

                interaction.reply({embeds: [deniedMessage("Error", "There was an error removing the guild (test) commands!")], ephemeral: true})
            }
        }
    },
};