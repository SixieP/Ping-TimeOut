const { PermissionFlagsBits, ApplicationCommandOptionType } = require("discord.js");
const registerPublicCommands = require('../../events/ready/02registerPublicCommands');
const registerTestCommands = require('../../events/ready/03registerTestCommands');

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
                    console.log("RELOAD-command | START reloading PUBLIC commands");
                    await registerPublicCommands(client);
                    console.log("RELOAD-command | END reloading PUBLIC commands");
            
                    interaction.reply({content: "Successfully reloaded the 'public' commands!", ephemeral: true});
        }
        if (commandName === "test") {
            console.log("RELOAD-command | START reloading TEST commands");
            await registerTestCommands(client);
            console.log("RELOAD-command | END reloading TEST commands");
    
            interaction.reply({content: "Successfully reloaded the 'test' commands!", ephemeral: true});
        }
    },
};