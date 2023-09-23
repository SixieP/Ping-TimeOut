const { logging } = require('../../baseUtils/logging');
const connectDatabase = require('../connectDatabase');
const pool = connectDatabase();

//add a user to the blacklist
async function addUserToBlacklist(userId, date, reason) {
    try {
        const [ result ] = await pool.query(`
        insert into bugReportBlacklist
        (userId, blacklistDate, blacklistReason)
        values
        (?, ?, ?)
        `,
        [userId, date, reason,])

        return result;
    } catch (error) {
        logging("error", error, "database/DEV/bugReportBlacklist.js/addUserToBlacklist")
        return "error";
    }
}

//remove a user from the blacklist
async function removeUserFromBlacklist(userId) {
    try {
        const [ result ] = await pool.query(`
        delete from bugReportBlacklist
        where
        userId = ?
        `,
        [userId])

        return result;
    } catch (error) {
        logging("error", error, "database/DEV/bugReportBlacklist.js/addUserToBlacklist")
        return "error";
    }
}

//remove a user from the blacklist
async function blacklistedUser(userId) {
    try {
        const [ userInfo ] = await pool.query(`
        select * from bugReportBlacklist
        where
        userId = ?;
        `,
        [userId])

        return userInfo[0];
    } catch (error) {
        logging("error", error, "database/DEV/bugReportBlacklist.js/addUserToBlacklist")
        return "error";
    }
}

//make functions global
module.exports = { 
    addUserToBlacklist,
    removeUserFromBlacklist,
    blacklistedUser,
};