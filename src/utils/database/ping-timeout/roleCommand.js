const connectDatabase = require('../connectDatabase');
const pool = connectDatabase();

async function newTimeOutRole(roleId, guildId, timeoutTime, mentionable) {
    var mentionInt;
    if (mentionable === true) {
        mentionInt = 1;
    } else {
        mentionInt = 0;
    }

    try {
        await pool.query(`
        insert into roles
        (roleId, guildId, timeoutTime, mentionable)
        values
        (?, ?, ?, ?)`,
        [roleId, guildId, timeoutTime, mentionInt])
    } catch (error) {
        console.log(`Error with database-query (ping-timeout/roleCommand.js/newTimeOutRole) | Error: ${error}`);
        return "error";
    }
}

async function updateTimeoutTime(roleId, timeoutTime, mentionable) {
    var mentionInt;
    if (mentionable === true) {
        mentionInt = 1;
    } else {
        mentionInt = 0;
    }

    try {
        await pool.query(`
        update roles
        set
        timeOutTime = ?,
        mentionable = ?
        where
        roleId = ?`,
        [timeoutTime, mentionInt, roleId]);
    } catch (error) {
        console.log(`Error with database-query (ping-timeout/roleCommand.js/updateTimeoutTime) | Error: ${error}`);
        return "error";
    }
}

async function removeTimeoutRole(roleId) {
    try {
        await pool.query(`
        delete from roles
        where
        roleId = ?`, [roleId])
    } catch (error) {
        console.log(`Error with database-query (ping-timeout/roleCommand.js/removeTimeoutRole) | Error: ${error}`);
        return "error"
    }
}

//make functions global
module.exports = { 
    newTimeOutRole,
    updateTimeoutTime,
    removeTimeoutRole,
};