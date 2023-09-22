const { inlineCode, underscore, Collection } = require('discord.js');
const { devs, testGuild} = require('../../../config.json');
const { deniedMessage, warnMessage } = require('../../utils/baseUtils/defaultEmbeds');
const getLocalCommands = require('../../utils/baseUtils/getLocalCommands');


module.exports = async (client, interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const localCommands = getLocalCommands();
    //command handeling logic
    try {
        const commandObject = localCommands.find(
            (cmd) => cmd.name === interaction.commandName
            );

        //cooldown logic
        const { cooldowns } = client;

        if (!cooldowns.has(commandObject.name)) {
            cooldowns.set(commandObject.name, new Collection());
        }

        const now = Date.now();
        const timestamps = cooldowns.get(commandObject.name);
        const defaultCooldownDur = 5;
        const cooldownAmount = (commandObject.cooldown ?? defaultCooldownDur) * 1000;

        if (timestamps.has(interaction.user.id)) {
            const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

            if (now < expirationTime) {
                const expiredTimestamp = Math.round(expirationTime/1000);
                return interaction.reply({embeds: [warnMessage(`Command cooldown! Please wait for: <t:${expiredTimestamp}:R>`)], ephemeral: true})
            }
        }

        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);


        
        //command checking
        if (!commandObject) {
            interaction.reply({
                embeds: [deniedMessage(`
                Can't find this command. Please contact the bots owner`)], ephemeral: true
            });
            return;};

        if (commandObject?.disabled) {
            interaction.reply({
                embeds: [deniedMessage(`
                Sorry, this command is currently disabled.

                ${underscore("Reason:")}
                ${commandObject.disabled}
                `)],
                ephemeral: true,
            });
            return;
        };

        if (commandObject.devOnly) {
            if (!devs.includes(interaction.member.id)) {
                const embed = deniedMessage("This is a DEV only command!")
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
