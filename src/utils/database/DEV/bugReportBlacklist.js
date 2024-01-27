const logging = require('../../baseUtils/logging');

const connectDatabase = require('../connectDatabase');
const pool = connectDatabase();
const promisePool = pool.promise();

//add a user to the blacklist
async function addUserToBlacklist(userId, date, reason) {
    logging.verboseInfo(__filename, 'Executing "blacklistedUser" function and query');

    return new Promise(function (resolve, reject) {
        promisePool.execute(`
        insert into bugReportBlacklist
        (userId, blacklistDate, blacklistReason)
        values
        (?, ?, ?)
        `,
        [userId, date, reason,])
        .then(([value]) => {
            logging.verboseInfo(__filename, 'Successfully executed "blacklistedUser" query');

            resolve(value);
        })
        .catch((error) => {
            logging.error(__filename, `Error executing "blacklistedUser" query. code": "err_datab_getRoles_byGui", errCode: "${error.code}", error: "${error}"`);

            reject(error);
            return;
        });
    });
};

//remove a user from the blacklist
async function removeUserFromBlacklist(userId) {
    logging.verboseInfo(__filename, 'Executing "blacklistedUser" function and query');

    return new Promise(function (resolve, reject) {
        promisePool.execute(`
        delete from bugReportBlacklist
        where
        userId = ?
        `,
        [userId])
        .then(([value]) => {
            logging.verboseInfo(__filename, 'Successfully executed "blacklistedUser" query');

            resolve(value);
        })
        .catch((error) => {
            logging.error(__filename, `Error executing "blacklistedUser" query. code": "err_datab_getRoles_byGui", errCode: "${error.code}", error: "${error}"`);

            reject(error);
            return;
        });
    });
};

//remove a user from the blacklist
async function blacklistedUser(userId) {
    logging.verboseInfo(__filename, 'Executing "blacklistedUser" function and query');

    return new Promise(function (resolve, reject) {
        promisePool.execute(`
        select * from bugReportBlacklist
        where
        userId = ?;
        `,
        [userId])
        .then(([value]) => {
            logging.verboseInfo(__filename, 'Successfully executed "blacklistedUser" query');

            resolve(value);
        })
        .catch((error) => {
            logging.error(__filename, `Error executing "blacklistedUser" query. code": "err_datab_getRoles_byGui", errCode: "${error.code}", error: "${error}"`);

            reject(error);
            return;
        });
    });
};

//make functions global
module.exports = { 
    addUserToBlacklist,
    removeUserFromBlacklist,
    blacklistedUser,
};