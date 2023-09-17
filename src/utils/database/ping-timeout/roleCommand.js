const connectDatabase = require('../connectDatabase');
const pool = connectDatabase();

async function newTimeOutRole(roleId, guildId, timeoutTime, mentionable) {
    var mentionInt;
    if (mentionable === true | mentionable === 1) {
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
        logging("error", error, "database/ping-timeout/roleCommand.js/newTimeOutRole");
        return "error";
    }
}

async function updateTimeoutTime(roleId, timeoutTime, mentionable) {
    var mentionInt;
    if (mentionable === true | mentionable === 1) {
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
        logging("error", error, "database/ping-timeout/roleCommand.js/updateTimeoutTime");
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
        logging("error", error, "database/ping-timeout/roleCommand.js/removeTimeoutRole");
        return "error"
    }
}

async function makeMentionable(roleId, mentionable) {
    var mentionInt;
    if (mentionable === true | mentionable === 1) {
        mentionInt = 1;
    } else {
        mentionInt = 0;
    }

    try {
        await pool.query(`
        update roles
        set
        mentionable = ?
        where
        roleId = ?`,
        [mentionInt, roleId]);
    } catch (error) {
        logging("error", error, "database/ping-timeout/roleCommand.js/updateTimeoutTime");
        return "error";
    }
}

//make functions global
module.exports = { 
    newTimeOutRole,
    updateTimeoutTime,
    removeTimeoutRole,
    makeMentionable,
};