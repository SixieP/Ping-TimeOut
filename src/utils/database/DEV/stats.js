const logging = require('../../baseUtils/logging');

const connectDatabase = require('../connectDatabase');
const pool = connectDatabase();
const promisePool = pool.promise();

//get all the roles
async function statGetAllRoles() {
    logging.verboseInfo(__filename, 'Executing "statGetAllRoles" function and query');

    return new Promise(function (resolve, reject) {
        promisePool.execute(`
        select * from roles;
        `)
        .then(([results]) => {
            logging.verboseInfo(__filename, 'Successfully executed "statGetAllRoles" query');

            resolve(results);
        })
        .catch((error) => {
            logging.error(__filename, `Error executing "statGetAllRoles" query. code": "err_datab_getRoles", errCode: "${error.code}", error: "${error}"`);

            reject(error);
        });
    });
};

//get athe count of all roles
async function statGetAllRolesCounted() {
    logging.verboseInfo(__filename, 'Executing "statGetAllRolesCounted" function and query');

    return new Promise(function (resolve, reject) {
        promisePool.execute(`
        select count(*) as "totalTimeoutRoles" from roles;
        `)
        .then(([results]) => {
            logging.verboseInfo(__filename, 'Successfully executed "statGetAllRolesCounted" query');

            resolve(results);
        })
        .catch((error) => {
            logging.error(__filename, `Error executing "statGetAllRolesCounted" query. code": "err_datab_getRoles", errCode: "${error.code}", error: "${error}"`);

            reject(error);
        });
    });
};

//get all roles from a specific guild
async function statGetRolesByGuild(guildId) {
    logging.verboseInfo(__filename, 'Executing "statGetRolesByGuild" function and query');

    return new Promise(function (resolve, reject) {
        promisePool.execute(`
        select * from roles
        where
        guildId = ?;
        `, [guildId])
        .then(([results]) => {
            logging.verboseInfo(__filename, 'Successfully executed "statGetRolesByGuild" query');

            resolve(results);
        })
        .catch((error) => {
            logging.error(__filename, `Error executing "statGetRolesByGuild" query. code": "err_datab_getRoles_byGui", errCode: "${error.code}", error: "${error}"`);

            reject(error);
            return;
        });
    });
};

//get all roles from a specific guild
async function statGetRole(roleId) {
    logging.verboseInfo(__filename, 'Executing "statGetRole" function and query');

    return new Promise(function (resolve, reject) {
        promisePool.execute(`
        select * from roles
        where
        roleId = ?;
        `, [roleId])
        .then(([results]) => {
            logging.verboseInfo(__filename, 'Successfully executed "statGetRole" query');

            resolve(results);
        })
        .catch((error) => {
            logging.error(__filename, `Error executing "statGetRole" query. code": "err_datab_getRole", errCode: "${error.code}", error: "${error}"`);

            reject(error);
        });
    });
};

//make functions global
module.exports = { 
    statGetAllRoles,
    statGetAllRolesCounted,
    statGetRolesByGuild,
    statGetRole,
};