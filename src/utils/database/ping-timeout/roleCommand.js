const logging = require('../../baseUtils/logging');

const connectDatabase = require('../connectDatabase');
const pool = connectDatabase();
const promisePool = pool.promise();

async function newTimeOutRole(interaction, roleId, guildId, timeoutTime, mentionable) {
    logging.verboseInfo(__filename, `newTimeOutRole, interactionId: ${interaction.id} | Query executed`);
    var mentionInt;
    if (mentionable === true | mentionable === 1) {
        mentionInt = 1;
    } else {
        mentionInt = 0;
    }

    try {
        await promisePool.execute(`
        insert into roles
        (roleId, guildId, timeoutTime, mentionable)
        values
        (?, ?, ?, ?)`,
        [roleId, guildId, timeoutTime, mentionInt])
    } catch (error) {
        if (error.code === "econnrefused") {
            logging.error(__filename, `newTimeOutRole, interactionId: ${interaction.id} | Error connecting to database: ${error}`);
            return "err_ECONNREFUSED";
        } else {
            logging.error(__filename, ` newTimeOutRole, interactionId: ${interaction.id} | There was an issue executing a database query: ${error}`);
            return "err_error";
        }
    }
}

async function updateTimeoutTime(interaction, roleId, timeoutTime, mentionable) {
    logging.verboseInfo(__filename, `updateTimeoutTime, interactionId: ${interaction.id} | Query executed`);
    var mentionInt;
    if (mentionable === true | mentionable === 1) {
        mentionInt = 1;
    } else {
        mentionInt = 0;
    }

    try {
        await promisePool.execute(`
        update roles
        set
        timeOutTime = ?,
        mentionable = ?,
        inError = 0
        where
        roleId = ?`,
        [timeoutTime, mentionInt, roleId]);
    } catch (error) {
        if (error.code === "econnrefused") {
            logging.error(__filename, `updateTimeoutTime, interactionId: ${interaction.id} | Error connecting to database: ${error}`);
            return "err_ECONNREFUSED";
        } else {
            logging.error(__filename, ` updateTimeoutTime, interactionId: ${interaction.id} | There was an issue executing a database query: ${error}`);
            return "err_error";
        }
    }
}

async function removeTimeoutRole(interaction, roleId) {
    logging.verboseInfo(__filename, `removeTimeoutRole, interactionId: ${interaction.id} | Query executed`);
    try {
        await promisePool.execute(`
        delete from roles
        where
        roleId = ?`, [roleId])
    } catch (error) {
        if (error.code === "econnrefused") {
            logging.error(__filename, `removeTimeoutRole, interactionId: ${interaction.id} | Error connecting to database: ${error}`);
            return "err_ECONNREFUSED";
        } else {
            logging.error(__filename, ` removeTimeoutRole, interactionId: ${interaction.id} | There was an issue executing a database query: ${error}`);
            return "err_error";
        }
    }

    return "success";
}

async function makeMentionable(interaction, roleId, mentionable) {
    logging.verboseInfo(__filename, `makeMentionable, interactionId: ${interaction.id} | Query executed`);
    var mentionInt;
    if (mentionable === true | mentionable === 1) {
        mentionInt = 1;
    } else {
        mentionInt = 0;
    }

    try {
        await promisePool.execute(`
        update roles
        set
        mentionable = ?,
        inError = 0
        where
        roleId = ?`,
        [mentionInt, roleId]);
    } catch (error) {
        if (error.code === "econnrefused") {
            logging.error(__filename, `makeMentionable, interactionId: ${interaction.id} | Error connecting to database: ${error}`);
            return "err_ECONNREFUSED";
        } else {
            logging.error(__filename, ` makeMentionable, interactionId: ${interaction.id} | There was an issue executing a database query: ${error}`);
            return "err_error";
        }
    }
}

//make functions global
module.exports = { 
    newTimeOutRole,
    updateTimeoutTime,
    removeTimeoutRole,
    makeMentionable,
};