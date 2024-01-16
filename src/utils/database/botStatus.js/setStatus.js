const logging = require('../../baseUtils/logging');

const connectDatabase = require('../connectDatabase');
const pool = connectDatabase();
const promisePool = pool.promise();

async function getAllRoles() {
    logging.verboseInfo(__filename, `set bot status - getAllRoles | Query executed`);

    return new Promise(function (resolve, reject) {
        promisePool.execute(`
        select count(roleId) as roles from roles`)
        .then(([rows, fields]) => resolve(rows))
        .catch((error) => {
            logging.error(__filename, `Error executing query. code: "err_datab_roles_get_nr", errCode: "${error.code}", error: "${error}"`);

            reject(error);
        });
    });
}

//make functions global
module.exports = { 
    getAllRoles,
};