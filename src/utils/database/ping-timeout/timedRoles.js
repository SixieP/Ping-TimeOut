const logging = require('../../baseUtils/logging');

const connectDatabase = require('../connectDatabase');
const pool = connectDatabase();
const promisePool = pool.promise();

async function rolesByGuild(guildId) {
    logging.verboseInfo(__filename, 'Executing "rolesByGuild" function and query');
    return new Promise(function (resolve, reject) {
        promisePool.execute(`
        select * from roles
        where
        guildId = ?`,
        [guildId])
        .then(([rows]) => {
            logging.verboseInfo(__filename, 'Successfully executed "rolesByGuild" query');

            resolve(rows);
            return;
        })
        .catch((error) => {
            logging.error(__filename, `Error executing "rolesByGuild" query. code": "err_datab_getRoles_byGui", errCode: "${error.code}", error: "${error}"`);

            reject(error);
            return;
        });
    });
};

//make functions global
module.exports = { 
    rolesByGuild,
};