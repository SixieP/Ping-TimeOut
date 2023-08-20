const areCommandsDifferent = require('../../utils/baseUtils/areCommandsDifferent');
const getApplicationCommands = require('../../utils/baseUtils/getApplicationCommands');
const getLocalCommands = require('../../utils/baseUtils/getLocalCommands');

module.exports = async (client) => {
    try {
        console.log('STARTUP-command | BEGIN public command check')
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
                    console.log(`PUBLIC-COMMAND | The command ${name} has been deleted cause it is set to deleted`);
                    continue;
                }

                if (localCommand.testCommand) {
                    await applicationCommands.delete(existingCommand.id);
                    console.log(`PUBLIC-COMMAND | The command ${name} has been deleted from the guild commands cause it is set to test`);
                    continue;
                }

                if(areCommandsDifferent(existingCommand, localCommand)) {
                    await applicationCommands.edit(existingCommand.id, {
                        description,
                        options,
                        defaultMemberPermissions,
                    });
                    console.log(`PUBLIC-COMMAND | The public command ${name} has been changed.`);
                }
            } else {
                if (localCommand.deleted) {
                    console.log(`PUBLIC-COMMAND | Skipping registering public command ${name} cause it is set to deleted`)
                    continue;
                }

                if (localCommand.testCommand) {
                    console.log(`PUBLIC-COMMAND | Skipping registering "${name}" cause it is not a public command`)
                    continue;
                }

                await applicationCommands.create({
                    name,
                    description,
                    options,
                    defaultMemberPermissions,
                });

                console.log(`PUBLIC-COMMAND | The public command ${name} has been registered.`);
            }
        }
        console.log('STARTUP-command | END public command check')
    } catch (error) {
        console.error(`There was a error registering a public command | Error: ${error}`)
    }
};