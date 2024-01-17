const logging = require('../../baseUtils/logging');

const connectDatabase = require('../connectDatabase');
const pool = connectDatabase();
const promisePool = pool.promise();

function createNewTimedroleQuery (roleId, guildId, timeoutDuration, mentionable) {
    logging.verboseInfo(__filename, 'Executing "createNewTimedroleQuery" function and query');

    // Database doesn't always correctly handle booleans. 0 and 1 always works.
    if (mentionable === true) {
        mentionable = 1;
    } else {
        mentionable = 0;
    };

    return new Promise(function (resolve, reject) {
        promisePool.execute(`
        insert into roles
        (roleId, guildId, timeoutTime, mentionable)
        values
        (?, ?, ?, ?)`,
        [roleId, guildId, timeoutDuration, mentionable])
        .then(() => {
            logging.verboseInfo(__filename, 'Successfully executed "createNewTimedroleQuery" query');

            resolve("ok");
            return;
        })
        .catch((error) => {
            logging.error(__filename, `Error executing "createNewTimedroleQuery" query. code": "err_datab_rolco_createRo", errCode: "${error.code}", error: "${error}"`);

            reject(error);
            return;
        });
    });
};

function editTimedRoleQuery (roleId, timeoutDuration, mentionable) {
    logging.verboseInfo(__filename, 'Executing "editTimedRoleQuery" function and query');

    // Database doesn't always correctly handle booleans. 0 and 1 always works.
    if (mentionable === true) {
        mentionable = 1;
    } else {
        mentionable = 0;
    };

    return new Promise(function(resolve, reject) {
        promisePool.execute(`
        update roles
        set
        timeOutTime = ?,
        mentionable = ?,
        inError = 0
        where
        roleId = ?`,
        [timeoutDuration, mentionable, roleId])
        .then(() => {
            logging.verboseInfo(__filename, 'Successfully executed "editTimedRoleQuery" query');

            resolve("ok");
            return;
        })
        .catch((error) => {
            logging.error(__filename, `Error executing "editTimedRoleQuery" query. code": "err_datab_rolco_createRo", errCode: "${error.code}", error: "${error}"`);

            reject(error);
            return;
        });
    });
}

function removeTimedRoleQuery (roleId, guildId) {
    logging.verboseInfo(__filename, 'Executing "removeTimedRoleQuery" function and query');

    return new Promise(function(resolve, reject) {
        promisePool.execute(`
        DELETE FROM roles WHERE roleId = ? and guildId = ?`,
        [roleId, guildId])
        .then(() => {
            logging.verboseInfo(__filename, 'Successfully executed "removeTimedRoleQuery" query');

            resolve("ok");
            return;
        })
        .catch((error) => {
            logging.error(__filename, `Error executing "removeTimedRoleQuery" query. code": "err_datab_rolco_createRo", errCode: "${error.code}", error: "${error}"`);

            reject(error);
            return;
        });
    });
};

function resetTimerTimedRoleQuery(roleId, mentionable) {
    logging.verboseInfo(__filename, 'Executing "resetTimerTimedRoleQuery" function and query');

    // Database doesn't always correctly handle booleans. 0 and 1 always works.
    if (mentionable === true) {
        mentionable = 1;
    } else {
        mentionable = 0;
    };

    return new Promise(function(resolve, reject) {
        promisePool.execute(`
        update roles
        set
        mentionable = ?,
        inError = 0
        where
        roleId = ?`,
        [mentionable, roleId])
        .then(() => {
            logging.verboseInfo(__filename, 'Successfully executed "resetTimerTimedRoleQuery" query');

            resolve("ok");
            return;
        })
        .catch((error) => {
            logging.error(__filename, `Error executing "resetTimerTimedRoleQuery" query. code": "err_datab_roleco_resetTiRoTime", errCode: "${error.code}", error: "${error}"`);

            reject(error);
            return;
        })
    });
}

//make functions global
module.exports = { 
    createNewTimedroleQuery,
    editTimedRoleQuery,
    removeTimedRoleQuery,
    resetTimerTimedRoleQuery
};