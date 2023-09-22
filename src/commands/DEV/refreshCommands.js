const { PermissionFlagsBits, ApplicationCommandOptionType } = require("discord.js");
const registerPublicCommands = require('../../events/ready/02registerPublicCommands');
const registerTestCommands = require('../../events/ready/03registerTestCommands');
const { logging } = require("../../utils/baseUtils/logging");
const { aprovedMessage } = require("../../utils/baseUtils/defaultEmbeds");

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

    //deleted: Boolean,
    devOnly: Boolean,
    testCommand: Boolean,

    callback: async (client, interaction) => {
        const commandName = interaction.options.get('command-channel').value;
        if (commandName === "public") {
            logging("dev", "Start reloading commands", "pub_command")
            await registerPublicCommands(client);
            logging("dev", "End reloading commands", "pub_command")
    
            interaction.reply({embeds: [aprovedMessage("Successfully reloaded the 'public' commands!")], ephemeral: true});
        }
        if (commandName === "test") {
            logging("dev", "Start reloading commands", "priv_command")
            await registerTestCommands(client);
            logging("dev", "Start reloading commands", "priv_command")
    
            interaction.reply({embeds: [aprovedMessage("Successfully reloaded the 'test' commands!")], ephemeral: true});
        }
    },
};