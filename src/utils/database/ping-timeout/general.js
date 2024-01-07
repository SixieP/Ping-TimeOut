const logging = require('../../baseUtils/logging');

const connectDatabase = require('../connectDatabase');
const pool = connectDatabase();
const promisePool = pool.promise();

function roleInDatabase(roleId) {
    return new Promise(function (resolve, reject) {
        promisePool.execute(`
        select * from roles
        where
        roleId = ?`, [roleId])
        .then(([rows, fields]) => {
            if (rows.length === 1) {
                resolve("true");
            } else if (rows.length > 1) {
                logging.warn(__filename, `roleId more than once in roles table. roleId: "${roleId}"`);
                reject("error: err_5");
            } else {
                resolve("false");
            }
        })
        .catch((error) => {
            if (error.code === "ECONNREFUSED") {
                logging.warn(__filename, `Database connection error. Code: "err_datab_nocon-roleInDatabase", errCode: "${error.code}"`);
            } else {
                logging.error(__filename, `Unkown database error. Code: "err_datab_unkown-roleInDatabase", errorCode: "${error.code}, error: "${error}""`);
            }

            try {
                reject(error.code)
            } catch (error) {
                console.log(error);
            }
        });
    })
}



//make functions global
module.exports = { 
    roleInDatabase,
};