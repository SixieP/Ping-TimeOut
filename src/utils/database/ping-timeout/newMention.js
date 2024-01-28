const logging = require('../../baseUtils/logging');

const connectDatabase = require('../connectDatabase');
const pool = connectDatabase();
const promisePool = pool.promise();

async function updateLastMentionQuery(roleId, mentionable) {
    logging.verboseInfo(__filename, 'Executing "updateLastMentionQuery" function and query');


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
        lastMention = NOW(),
        mentionable = ?
        where
        roleId = ?`, [mentionable, roleId])
    })
    .then(() => {
        logging.verboseInfo(__filename, 'Successfully executed "updateLastMentionQuery" query');

        resolve("ok");
    })
    .catch((error) => {
        logging.error(__filename, `Error executing "updateLastMentionQuery" query. code": "err_datab_updRol", roleId: "${roleId}", errCode: "${error.code}", error: "${error}"`);

        reject(error);
    });
};

//make functions global
module.exports = { 
    updateLastMentionQuery,
};