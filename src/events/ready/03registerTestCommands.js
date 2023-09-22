const { testGuild } = require('../../../config.json');
const areCommandsDifferent = require('../../utils/baseUtils/areCommandsDifferent');
const getApplicationCommands = require('../../utils/baseUtils/getApplicationCommands');
const getLocalCommands = require('../../utils/baseUtils/getLocalCommands');
const { logging } = require('../../utils/baseUtils/logging');

module.exports = async (client) => {
    try {
        logging("info", `Begin command check`, "test_command_reg")
        const localCommands = getLocalCommands();
        const applicationCommands = await getApplicationCommands(
            client, 
            testGuild
            );


        for (const localCommand of localCommands) {
            const {name, options, defaultMemberPermissions} = localCommand;
            const description = `TEST-COMMAND | ${localCommand.description}`
            


            const existingCommand = await applicationCommands.cache.find(  
                (cmd) => cmd.name === name
            );

            if (existingCommand) {
                if (localCommand.deleted) {
                    await applicationCommands.delete(existingCommand.id);
                    logging("info", `The test command ${name} has been deleted cause it is set to deleted`, "test_command_reg")
                    continue;
                }

                if (!localCommand.testCommand) {
                    await applicationCommands.delete(existingCommand.id);
                    logging("info", `The command ${name} has been deleted from the test commands cause it is not a test command anymore`, "test_command_reg")
                    continue;
                }

                if(areCommandsDifferent(existingCommand, localCommand)) {
                    await applicationCommands.edit(existingCommand.id, {
                        description,
                        options,
                        defaultMemberPermissions,
                    });
                    logging("info", `The test command ${name} has been changed.`, "test_command_reg")
                }
            } else {
                if (localCommand.deleted) {
                    //logging("info", `Skipping registering test command ${name} cause it is set to deleted`, "test_command_reg")
                    continue;
                }

                if (!localCommand.testCommand) {
                    //logging("info", `Skipping registering "${name}" cause it is not a test command`, "test_command_reg")
                    continue;
                }

                await applicationCommands.create({
                    name,
                    description,
                    options,
                    defaultMemberPermissions,
                });
                logging("info", `The test command ${name} has been registered.`, "test_command_reg")
            }
        }
        logging("info", `End command check`, "test_command_reg")
    } catch (error) {
        logging("error", error, "test_command_reg")
    }
};