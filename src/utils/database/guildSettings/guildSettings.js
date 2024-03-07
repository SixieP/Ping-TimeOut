const logging = require('../../baseUtils/logging');

const connectDatabase = require('../connectDatabase');
const pool = connectDatabase();
const promisePool = pool.promise();

async function createGuildSettings(guildId) {
    logging.verboseInfo(__filename, 'Executing "createGuildSettings" function and query');

    return new Promise(function (resolve, reject) {
        promisePool.execute(`
        insert into guild_settings (guildId, createTime, maxRoles) values (?, NOW(), 5);
        `,
        [guildId])
        .then(() => {
            logging.verboseInfo(__filename, 'Successfully executed "createGuildSettings" query');

            resolve("ok");
            return;
        })
        .catch((error) => {
            logging.error(__filename, `Error executing "createGuildSettings" query. code": "err_datab_createSets", errCode: "${error.code}", error: "${error}"`);

            reject(error);
            return;
        });
    });
};

async function removeGuildSettings(guildId) {
    logging.verboseInfo(__filename, 'Executing "removeGuildSettings" function and query');

    return new Promise(function (resolve, reject) {
        promisePool.execute(`
        DELETE FROM guild_settings WHERE guildId = ?
        `,
        [guildId])
        .then(() => {
            logging.verboseInfo(__filename, 'Successfully executed "removeGuildSettings" query');

            resolve("ok");
            return;
        })
        .catch((error) => {
            logging.error(__filename, `Error executing "removeGuildSettings" query. code": "err_datab_remSets", errCode: "${error.code}", error: "${error}"`);

            reject(error);
            return;
        });
    });
};

async function getGuildSettings(guildId) {
    logging.verboseInfo(__filename, 'Executing "getGuildSettings" function and query');

    return new Promise(function (resolve, reject) {
        promisePool.execute(`
        SELECT * FROM guild_settings WHERE guildId = ?
        `,
        [guildId])
        .then(([rows]) => {
            logging.verboseInfo(__filename, 'Successfully executed "getGuildSettings" query');

            resolve(rows[0]);
            return;
        })
        .catch((error) => {
            logging.error(__filename, `Error executing "getGuildSettings" query. code": "err_datab_getSets", errCode: "${error.code}", error: "${error}"`);

            reject(error);
            return;
        });
    });
};

//make functions global
module.exports = { 
    createGuildSettings,
    removeGuildSettings,
    getGuildSettings,
};