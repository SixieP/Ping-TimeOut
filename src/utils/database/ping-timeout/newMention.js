const logging = require('../../baseUtils/logging');

const connectDatabase = require('../connectDatabase');
const pool = connectDatabase();
const promisePool = pool.promise();

async function updateLastMention(interaction,  roleId, lastMention, mentionable) {
    logging.verboseInfo(__filename, `updateLastMention, interactionId: ${interaction.id} | Query executed`);
    var mentionInt;
    if (mentionable === true) {
        mentionInt = 1;
    } else {
        mentionInt = 0;
    }
    
    try {
        await promisePool.execute(`
        update roles
        set 
        lastMention = ?,
        mentionable = ?
        where
        roleId = ?`, [lastMention, mentionInt, roleId ])
    } catch (error) {
        if (error.code === "econnrefused") {
            logging.error(__filename, `updateLastMention, interactionId: ${interaction.id} | Error connecting to database: ${error}`);
            return "err_ECONNREFUSED";
        } else {
            logging.error(__filename, ` updateLastMention, interactionId: ${interaction.id} | There was an issue executing a database query: ${error}`);
            return "err_error";
        }
    }
}

//make functions global
module.exports = { 
    updateLastMention,
};