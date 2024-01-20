const logging = require('../../baseUtils/logging');

const connectDatabase = require('../connectDatabase');
const pool = connectDatabase();
const promisePool = pool.promise();

async function removeAllGuildRoles(guildId) {
    logging.verboseInfo(__filename, 'Executing "removeAllGuildRoles" function and query');

    return new Promise(function (resolve, reject) {
        promisePool.execute(`
        delete from roles
        where
        guildId = ?`,
        [guildId])
        .then(() => {
            logging.verboseInfo(__filename, 'Successfully executed "removeAllGuildRoles" query');

            resolve("ok");
            return;
        })
        .catch((error) => {
            logging.error(__filename, `Error executing "removeAllGuildRoles" query. code": "err_datab_dellAllRoles", errCode: "${error.code}", error: "${error}"`);

            reject(error);
            return;
        });
    });
};

//make functions global
module.exports = { 
    removeAllGuildRoles,
};