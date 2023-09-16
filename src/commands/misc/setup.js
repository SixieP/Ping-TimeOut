const { EmbedBuilder, inlineCode, Embed, PermissionFlagsBits} = require('discord.js');
const getLocalCommands = require('../../utils/baseUtils/getLocalCommands');

const localCommands = getLocalCommands();

module.exports = {
    name: "setup",
    description: 'Setup instructions for the bot',
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
    // devOnly: Boolean,
    // inactive: Boolean,
    // testCommand: Boolean,

    callback: (client, interaction) => {
        

        //get all info from the help command
        const commandObject = localCommands.find(
            (cmd) => cmd.name === "help"
            );

            //set the interaction to setup
            interaction.options._hoistedOptions[0] = { name: 'page', type: 3, value: 'setup' };

            commandObject.callback(client, interaction);
    }
}
