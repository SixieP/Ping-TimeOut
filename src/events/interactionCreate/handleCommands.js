const { inlineCode, underscore, Collection } = require('discord.js');
const { devs, testGuild} = require('../../../config.json');
const { deniedMessage, warnMessage } = require('../../utils/baseUtils/defaultEmbeds');
const getLocalCommands = require('../../utils/baseUtils/getLocalCommands');

const logging = require('../../utils/baseUtils/logging');
const logTemplates = require('../../utils/baseUtils/logTemplates');

const defaultMessage = require('../../utils/defaults/messages/defaultMessages');



module.exports = async (client, interaction) => {
    if (!interaction.isChatInputCommand()) return;
    logging.verboseInfo(__filename, logTemplates.commandInteractionStart(interaction));

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
        const defaultCooldownDur = 1;
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
            logging.warn(__filename, logTemplates.commandInteractionException(interaction, "Checking if commandObject exists. Result is false, commandObject does not exist. User tried executing unrecognized command/bot cannot find command."));

            if (!interaction.replied) {
                interaction.reply({
                    embeds: [deniedMessage(
                    `Can't find this command. Please contact the bots owner or create a bug report using /bug-report`
                    )],
                    ephemeral: true
                });
            } else {
                interaction.editReply({
                    embeds: [deniedMessage(
                    `Can't find this command. Please contact the bots owner or create a bug report using /bug-report`
                    )],
                    ephemeral: true
                });
            };

            return;
        };

        if (commandObject?.disabled) {
            interaction.reply({
                embeds: [warnMessage(`
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
                logging.warn(__filename, logTemplates.commandInteractionInfo(interaction, "Dev only command executed by a none dev"))


                if (!interaction.replied) {
                    interaction.reply({
                        embeds: [warnMessage("This is a DEV only command! If you think that this is an error please create a bug report.")],
                        ephemeral: true,
                    });
                } else {
                    interaction.editReply({
                        embeds: [warnMessage("This is a DEV only command! If you think that this is an error please create a bug report.")],
                        ephemeral: true,
                    });
                };

                return;
            }
        }

        if (commandObject.testCommand) {
            if (!interaction.guild.id === testGuild) {
                logging.warn(__filename, logTemplates.commandInteractionInfo(interaction, "Test command executed outside test guild"));

                if (!interaction.replied) {
                    interaction.reply({
                        embed: [warnMessage('This command is not available in this guild')],
                        ephemeral: true
                    });
                } else {
                    interaction.editReply({
                        embed: [warnMessage('This command is not available in this guild')],
                        ephemeral: true
                    });
                };

                return;
            }
        }
        if (commandObject.permissionsRequired?.length) {
            for (const permission of commandObject.permissionsRequired) {
                if (!interaction.member.permissions.has(permission)) {
                    logging.globalInfo(__filename, logTemplates(interaction, "User executed command without the hardcoded required perms"))

                    if (!interaction.replied) {
                        interaction.reply({
                            embed: [deniedMessage('You do not have enough perms to execute this command')],
                            ephemeral: true
                        });
                    } else {
                        interaction.editReply({
                            embed: [deniedMessage('You do not have enough perms to execute this command')],
                            ephemeral: true
                        });
                    };

                    return;
                }
            }
        }
        if (commandObject.botPermissions?.length) {
            for (const permission of commandObject.botPermissions) {
                const bot = interaction.guild.members.me;

                if (!bot.permissions.has(permission)) {
                    logging.globalInfo(__filename, logTemplates(interaction, "Bot does not have the hardcoded required perms to execute command"))
                    
                    if (!interaction.replied) {
                        interaction.reply({
                            embed: [deniedMessage('The bot does not have enough perms to execute this command')],
                            ephemeral: true
                        });
                    } else {
                        interaction.editReply({
                            embed: [deniedMessage('The bot does not have enough perms to execute this command')],
                            ephemeral: true
                        });
                    };

                    return;
                }
            }
        } 
        await commandObject.callback(client, interaction);
    } catch (error) {
        logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while running the commandHandler/running the command logic", `"Error message:" "${error}"`));



        //Might be re-enabled later, for now nothing.
        return;
        console.log("ERRO HIU");
        interaction.fetchReply()
        .then((reply) => {
                if (!interaction.replied) {
                    interaction.reply({content: "", embeds: [deniedMessage("There was an error using this command :/. Please try again later and/or create a bug-report.")], ephemeral: true})
                    .catch((error) => console.log(error));
                } else {
                    interaction.editReply({content: "", embeds: [deniedMessage("There was an error using this command :/. Please try again later and/or create a bug-report.")], ephemeral: true})
                    .catch((error) => console.log(error));
                };
            }
        )
        .catch(logging.warn(__filename, logTemplates.commandInteractionException(interaction, "")))

        

        return;
    }
};
