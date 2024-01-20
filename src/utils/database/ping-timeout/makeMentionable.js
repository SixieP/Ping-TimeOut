const logging = require('../../baseUtils/logging');

const connectDatabase = require('../connectDatabase');
const pool = connectDatabase();
const promisePool = pool.promise();

async function getNotMentionableRoles() {
    logging.verboseInfo(__filename, 'Executing "getNotMentionableRoles" function and query');

    return new Promise(function(resolve, reject) {
        promisePool.execute(`
        select * from roles
        where
        mentionable = 0`)
        .then(([value]) => {
            logging.verboseInfo(__filename, 'Successfully executed "getNotMentionableRoles" query');

            resolve(value);
        })
        .catch((error) => {
            logging.error(__filename, `Error executing "getNotMentionableRoles" query. code": "err_datab_gtMenRols", errCode: "${error.code}", error: "${error}"`);

            reject(error);
        });
    });
};

async function updateSetMentionable (roleId) {
    logging.verboseInfo(__filename, 'Executing "updateSetMentionable" function and query');

    return new Promise(function(resolve, reject) {
        promisePool.execute(`
        update roles
        set 
        mentionable = 1,
        inError = 0
        where
        roleId = ?`, [ roleId ])
        .then(() => {
            logging.verboseInfo(__filename, 'Successfully executed "updateSetMentionable" query');

            resolve("ok");
        })
        .catch((error) => {
            logging.error(__filename, `Error executing "updateSetMentionable" query. code": "err_datab_updRol", errCode: "${error.code}", error: "${error}"`);

            reject(error);
        });
    });
};

async function databaseRoleErrorState (roleId, errorState = true) {
    logging.verboseInfo(__filename, 'Executing "databaseRoleErrorState" function and query');

    if (errorState === false | errorState === 0) {
        errorState = 0;
    } else {
        errorState = 1;
    };

    return new Promise(function(resolve, reject) {
        promisePool.execute(`
        update roles
        set 
        inError = ?
        where
        roleId = ?`, [errorState, roleId ])
        .then(() => {
            logging.verboseInfo(__filename, 'Successfully executed "databaseRoleErrorState" query');

            resolve("ok");
        })
        .catch((error) => {
            logging.error(__filename, `Error executing "databaseRoleErrorState" query. code": "err_datab_updRol", errCode: "${error.code}", error: "${error}"`);

            reject(error);
        });
    });
};

//make functions global
module.exports = { 
    getNotMentionableRoles,
    updateSetMentionable,
    databaseRoleErrorState,
};