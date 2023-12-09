const logging = require('../../baseUtils/logging');

const connectDatabase = require('../connectDatabase');
const pool = connectDatabase();
const promisePool = pool.promise();

//add a user to the blacklist
async function addUserToBlacklist(interaction, userId, date, reason) {
    logging.verboseInfo(__filename, `addUserToBlacklist, interactionId: ${interaction.id} | Query executed`);
    try {
        const [ result ] = await promisePool.execute(`
        insert into bugReportBlacklist
        (userId, blacklistDate, blacklistReason)
        values
        (?, ?, ?)
        `,
        [userId, date, reason,])

        return result;
    } catch (error) {
        if (error.code === "econnrefused") {
            logging.error(__filename, `addUserToBlacklist, interactionId: ${interaction.id} | Error connecting to database: ${error}`);
            return "err_ECONNREFUSED";
        } else {
            logging.error(__filename, ` addUserToBlacklist, interactionId: ${interaction.id} | There was an issue executing a database query: ${error}`);
            return "err_error";
        }
    }
}

//remove a user from the blacklist
async function removeUserFromBlacklist(interaction, userId) {
    logging.verboseInfo(__filename, `removeUserFromBlacklist, interactionId: ${interaction.id} | Query executed`);
    try {
        const [ result ] = await promisePool.execute(`
        delete from bugReportBlacklist
        where
        userId = ?
        `,
        [userId])

        return result;
    } catch (error) {
        if (error.code === "econnrefused") {
            logging.error(__filename, `removeUserFromBlacklist, interactionId: ${interaction.id} | Error connecting to database: ${error}`);
            return "err_ECONNREFUSED";
        } else {
            logging.error(__filename, ` removeUserFromBlacklist, interactionId: ${interaction.id} | There was an issue executing a database query: ${error}`);
            return "err_error";
        }
    }
}

//remove a user from the blacklist
async function blacklistedUser(interaction, userId) {
    logging.verboseInfo(__filename, `blacklistedUser, interactionId: ${interaction.id} | Query executed`);
    try {
        const [ userInfo ] = await promisePool.execute(`
        select * from bugReportBlacklist
        where
        userId = ?;
        `,
        [userId])

        return userInfo[0];
    } catch (error) {
        if (error.code === "econnrefused") {
            logging.error(__filename, `blacklistedUser, interactionId: ${interaction.id} | Error connecting to database: ${error}`);
            return "err_ECONNREFUSED";
        } else {
            logging.error(__filename, ` blacklistedUser, interactionId: ${interaction.id} | There was an issue executing a database query: ${error}`);
            return "err_error";
        }
    }
}

//make functions global
module.exports = { 
    addUserToBlacklist,
    removeUserFromBlacklist,
    blacklistedUser,
};