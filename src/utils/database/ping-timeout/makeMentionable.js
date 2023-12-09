const logging = require('../../baseUtils/logging');

const connectDatabase = require('../connectDatabase');
const pool = connectDatabase();
const promisePool = pool.promise();

async function getNotMentionableRoles(interaction, guildId) {
    logging.verboseInfo(__filename, `getNotMentionableRoles, interactionId: ${interaction.id} | Query executed`);
    try {
        if (!guildId) {
            const [ roles ] = await promisePool.execute(`
            select * from roles
            where
            mentionable = 0`, 
            [guildId]);
            return roles;
        } else {
            const [ roles ] = await promisePool.execute(`
            select * from roles
            where
            guildId = ?
            and
            mentionable = 0`, 
            [guildId]);
            return roles;
        }
    } catch (error) {
        if (error.code === "econnrefused") {
            logging.error(__filename, `getNotMentionableRoles, interactionId: ${interaction.id} | Error connecting to database: ${error}`);
            return "err_ECONNREFUSED";
        } else {
            logging.error(__filename, ` getNotMentionableRoles, interactionId: ${interaction.id} | There was an issue executing a database query: ${error}`);
            return "err_error";
        }
    }
}

async function updateSetMentionable (interaction, roleId) {
    logging.verboseInfo(__filename, `updateSetMentionable, interactionId: ${interaction.id} | Query executed`);
    try {
        await promisePool.execute(`
        update roles
        set 
        mentionable = 1,
        inError = 0
        where
        roleId = ?`, [ roleId ])
    } catch (error) {
        if (error.code === "econnrefused") {
            logging.error(__filename, `updateSetMentionable, interactionId: ${interaction.id} | Error connecting to database: ${error}`);
            return "err_ECONNREFUSED";
        } else {
            logging.error(__filename, ` updateSetMentionable, interactionId: ${interaction.id} | There was an issue executing a database query: ${error}`);
            return "err_error";
        }
    }
}

async function databaseRoleErrorState (interaction, roleId, errorState = true) {
    logging.verboseInfo(__filename, `databaseRoleErrorState, interactionId: ${interaction.id} | Query executed`);
    var setErrorState;
    if (errorState === false | errorState === 0) {
        setErrorState = 0
    } else {
        setErrorState = 1
    }
    try {
        await promisePool.execute(`
        update roles
        set 
        inError = ?
        where
        roleId = ?`, [ setErrorState, roleId ])
    } catch (error) {
        if (error.code === "econnrefused") {
            logging.error(__filename, `databaseRoleErrorState, interactionId: ${interaction.id} | Error connecting to database: ${error}`);
            return "err_ECONNREFUSED";
        } else {
            logging.error(__filename, ` databaseRoleErrorState, interactionId: ${interaction.id} | There was an issue executing a database query: ${error}`);
            return "err_error";
        }
    }
}

//make functions global
module.exports = { 
    getNotMentionableRoles,
    updateSetMentionable,
    databaseRoleErrorState,
};