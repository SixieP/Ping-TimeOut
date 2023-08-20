const { testGuild } = require('../../../config.json');
const areCommandsDifferent = require('../../utils/baseUtils/areCommandsDifferent');
const getApplicationCommands = require('../../utils/baseUtils/getApplicationCommands');
const getLocalCommands = require('../../utils/baseUtils/getLocalCommands');

module.exports = async (client) => {
    try {
        console.log('STARTUP-command | BEGIN test command check')
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
                    console.log(`TEST-COMMAND | The private command ${name} has been deleted cause it is set to deleted`);
                    continue;
                }

                if (!localCommand.testCommand) {
                    await applicationCommands.delete(existingCommand.id);
                    console.log(`TEST-COMMAND | The command ${name} has been deleted from the private commands cause it is not a test command anymore`);
                    continue;
                }

                if(areCommandsDifferent(existingCommand, localCommand)) {
                    await applicationCommands.edit(existingCommand.id, {
                        description,
                        options,
                        defaultMemberPermissions,
                    });
                    console.log(`TEST-COMMAND | The private command ${name} has been changed.`);
                }
            } else {
                if (localCommand.deleted) {
                    //console.log(`TEST-COMMAND | Skipping registering private command ${name} cause it is set to deleted`)
                    continue;
                }

                if (!localCommand.testCommand) {
                    //console.log(`TEST-COMMAND | Skipping registering "${name}" cause it is not a private command`)
                    continue;
                }

                await applicationCommands.create({
                    name,
                    description,
                    options,
                    defaultMemberPermissions,
                });

                console.log(`TEST-COMMAND | The private command ${name} has been registered.`);
            }
        }
        console.log('STARTUP-command | END test command check')
    } catch (error) {
        console.error(`There was a error registering a test command | Error: ${error}`)
    }
};