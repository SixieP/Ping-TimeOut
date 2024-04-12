const { PermissionFlagsBits, ApplicationCommandOptionType } = require("discord.js");
const registerPublicCommands = require('../../events/ready/02registerPublicCommands');
const registerTestCommands = require('../../events/ready/03registerTestCommands');
const { aprovedMessage } = require("../../utils/baseUtils/defaultEmbeds");

const logging = require("../../utils/baseUtils/logging");

module.exports = {
    name: "dev-reload_commands",
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

    deleted: Boolean, 
    devOnly: Boolean,
    testCommand: Boolean,

    callback: async (client, interaction) => {
        const commandName = interaction.options.get('command-channel').value;
        if (commandName === "public") {
            logging.warn(__filename, `DEV COMMAND - Start reloading public command(s). userId: ${interaction.user.id}`);
            await registerPublicCommands(client);
            interaction.reply({embeds: [aprovedMessage("Successfully reloaded the 'public' commands!")], ephemeral: true});

            logging.warn(__filename, `DEV COMMAND - End reloading public command(s). userId: ${interaction.user.id}`);
        }
        if (commandName === "test") {
            logging.warn(__filename, `DEV COMMAND - Start reloading test command(s). userId: ${interaction.user.id}`);

            await registerTestCommands(client);    
            interaction.reply({embeds: [aprovedMessage("Successfully reloaded the 'test' commands!")], ephemeral: true});

            logging.warn(__filename, `DEV COMMAND - End reloading test command(s). userId: ${interaction.user.id}`);
        }
    },
};