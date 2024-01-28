const { testGuild } = require('../../../config.json');
const areCommandsDifferent = require('../../utils/baseUtils/areCommandsDifferent');
const getApplicationCommands = require('../../utils/baseUtils/getApplicationCommands');
const getLocalCommands = require('../../utils/baseUtils/getLocalCommands');
const logging = require('../../utils/baseUtils/logging');

module.exports = async (client) => {
    try {
        logging.info(__filename, "Begin checking test commands");
        const localCommands = getLocalCommands();
        const applicationCommands = await getApplicationCommands(
            client, 
            testGuild
            );


        for (const localCommand of localCommands) {
            const {name, options, defaultMemberPermissions} = localCommand;
            const description = `TEST-COMMAND | ${localCommand.description}`;
            


            const existingCommand = await applicationCommands.cache.find(  
                (cmd) => cmd.name === name
            );

            if (existingCommand) {
                if (localCommand.deleted) {
                    await applicationCommands.delete(existingCommand.id);
                    logging.info(__filename, `The test command '${name}' has been deleted cause it is set to deleted`);
                    continue;
                };

                if (!localCommand.testCommand) {
                    await applicationCommands.delete(existingCommand.id);
                    logging.info(__filename, `The test command '${name}' has been deleted from the guild commands cause it is set to test`);
                    continue;
                };

                if(areCommandsDifferent(existingCommand, localCommand)) {
                    await applicationCommands.edit(existingCommand.id, {
                        description,
                        options,
                        defaultMemberPermissions,
                    });
                    logging.info(__filename, `The test command '${name}' has been changed.`);
                };
            } else {
                if (localCommand.deleted) {
                    //logging.info(__filename, `Skipping registering test command '${name}' cause it is set to deleted`);
                    continue;
                };

                if (!localCommand.testCommand) {
                    //logging.info(__filename, `Skipping registering "'${name}'" cause it is not a test command`);
                    continue;
                };

                await applicationCommands.create({
                    name,
                    description,
                    options,
                    defaultMemberPermissions,
                });
                
                logging.info(__filename, `The test command '${name}' has been registered.`);
            }
        }
        logging.info(__filename, `End test command check`);

    } catch (error) {
        logging.error(__filename, `There was a error registering a test command: ${error}`);
    }
};