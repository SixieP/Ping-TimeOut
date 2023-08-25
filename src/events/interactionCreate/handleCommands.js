const { devs, testGuild} = require('../../../config.json');
const { deniedMessage } = require('../../utils/baseUtils/defaultEmbeds');
const getLocalCommands = require('../../utils/baseUtils/getLocalCommands');


module.exports = async (client, interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const localCommands = getLocalCommands();
    try {
        const commandObject = localCommands.find(
            (cmd) => cmd.name === interaction.commandName
            );

        if (!commandObject) return;

        if (commandObject.devOnly) {
            if (!devs.includes(interaction.member.id)) {
                const embed = deniedMessage("No perms", "This is a DEV only command!")
                interaction.reply({
                    embeds: [embed],
                    ephemeral: true,
                });
                console.log(`
                WARNING | A dev only command was used by a non-authorized user.
                WARNING | Guild: ${interaction.guild.name} (${interaction.guildId})
                WARNING | User: ${interaction.user.username}#${interaction.user.discriminator} (${interaction.user.id})`);
                return;
            }
        }
        if (commandObject.testCommand) {
            if (!interaction.guild.id === testGuild) {
                interaction.reply({
                    content: 'Sorry! This command can not be executed at the moment',
                    ephemeral: true,
                });
                return;
            }
            
        }
        if (commandObject.permissionsRequired?.lenght) {
            for (const permission of commandObject.permissionsRequired) {
                if (!interaction.member.permissions.has(permission)) {
                    interaction.reply({
                        content: 'Not enough permissions!',
                        ephemeral: true,
                    });
                    return
                }
            }
        }
        if (commandObject.botPermissions?.length) {
            for (const permission of commandObject.botPermissions) {
                const bot = interaction.guild.members.me;

                if (!bot.permissions.has(permission)) {
                    interaction.reply({
                        content: 'The bot has not enough permissions!',
                        ephemeral: true,
                    });
                    return;
                }
            }
        } 
        await commandObject.callback(client, interaction);
    } catch (error) {
        console.log(`There was an error using this command: ${error}`);
    }
};
