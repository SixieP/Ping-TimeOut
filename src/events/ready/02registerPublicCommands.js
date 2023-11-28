const areCommandsDifferent = require('../../utils/baseUtils/areCommandsDifferent');
const getApplicationCommands = require('../../utils/baseUtils/getApplicationCommands');
const getLocalCommands = require('../../utils/baseUtils/getLocalCommands');
const { logging } = require('../../utils/baseUtils/logging');

module.exports = async (client) => {
    try {
        logging("info", `Begin command check`, "pub_command_reg")
        const localCommands = getLocalCommands();
        const applicationCommands = await getApplicationCommands(
            client
            );


        for (const localCommand of localCommands) {
            const {name, description, options, defaultMemberPermissions} = localCommand;

            const existingCommand = await applicationCommands.cache.find(  
                (cmd) => cmd.name === name
            );

            if (existingCommand) {
                if (localCommand.deleted) {
                    await applicationCommands.delete(existingCommand.id);
                    logging("info", `The command ${name} has been deleted cause it is set to deleted`, "pub_command_reg")
                    continue;
                }

                if (localCommand.testCommand) {
                    await applicationCommands.delete(existingCommand.id);
                    logging("info", `The command ${name} has been deleted from the guild commands cause it is set to test`, "pub_command_reg")
                    continue;
                }

                if(areCommandsDifferent(existingCommand, localCommand)) {
                    await applicationCommands.edit(existingCommand.id, {
                        description,
                        options,
                        defaultMemberPermissions,
                    });
                    logging("info", `The public command ${name} has been changed.`, "pub_command_reg")
                }
            } else {
                if (localCommand.deleted) {
                    logging("info", `Skipping registering public command ${name} cause it is set to deleted`, "pub_command_reg")
                    continue;
                }

                if (localCommand.testCommand) {
                    logging("info", `Skipping registering "${name}" cause it is not a public command`, "pub_command_reg")
                    continue;
                }

                await applicationCommands.create({
                    name,
                    description,
                    options,
                    defaultMemberPermissions,
                });

                logging("info", `The public command ${name} has been registered.`, "pub_command_reg")
            }
        }
        logging("info", `End command check`, "pub_command_reg")
    } catch (error) {
        logging("error", `There was a error registering a public command: ${error}`, "pub_command_reg")
    }
};