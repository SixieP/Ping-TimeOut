const areCommandsDifferent = require('../../utils/baseUtils/areCommandsDifferent');
const getApplicationCommands = require('../../utils/baseUtils/getApplicationCommands');
const getLocalCommands = require('../../utils/baseUtils/getLocalCommands');
const logging = require('../../utils/baseUtils/logging');

module.exports = async (client) => {
    try {
        logging.info(__filename, "Begin checking public commands");
        const localCommands = getLocalCommands();
        const applicationCommands = await getApplicationCommands(
            client
            );


        for (const localCommand of localCommands) {
            const {name, description, options, defaultMemberPermissions, contexts, intergration_types, dm_permission } = localCommand;

            const existingCommand = await applicationCommands.cache.find(  
                (cmd) => cmd.name === name
            );

            if (existingCommand) {
                if (localCommand.deleted) {
                    logging.info(__filename, `The public command '${name}' has been deleted cause it is set to deleted`);
                    await applicationCommands.delete(existingCommand.id);
                    continue;
                };

                if (localCommand.testCommand) {
                    logging.info(__filename, `The public command ''${name}'' has been deleted from the guild commands cause it is set to test`);
                    await applicationCommands.delete(existingCommand.id);
                    continue;
                };

                if(areCommandsDifferent(existingCommand, localCommand)) {
                    logging.info(__filename, `The public command '${name}' has been changed.`);
                    await applicationCommands.edit(existingCommand.id, {
                        description,
                        options,
                        defaultMemberPermissions,
                        contexts,
                        intergration_types,
                        dm_permission
                    });
                };
            } else {
                if (localCommand.deleted) {
                    logging.info(__filename, `Skipping registering public command '${name}' cause it is set to deleted`);
                    continue;
                };

                if (localCommand.testCommand) {
                    logging.info(__filename, `Skipping registering "'${name}'" cause it is not a public command`);
                    continue;
                };

                await applicationCommands.create({
                    name,
                    description,
                    options,
                    defaultMemberPermissions,
                    contexts,
                    intergration_types,
                    dm_permission
                });

                logging.info(__filename, `The public command '${name}' has been registered.`);
            };
        }
        logging.info(__filename, `End public command check`);
    } catch (error) {
        logging.error(__filename, `There was a error registering a public command: ${error}`);
    }
};