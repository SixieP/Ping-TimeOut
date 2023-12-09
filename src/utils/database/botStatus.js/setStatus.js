const logging = require('../../baseUtils/logging');

const connectDatabase = require('../connectDatabase');
const pool = connectDatabase();
const promisePool = pool.promise();

async function getAllRoles(interaction) {
    logging.verboseInfo(__filename, `getAllRoles, interactionId: ${interaction.id} | Query executed`);
    try {
        const [ roles ] = await promisePool.execute(`
        select count(roleId) as roles from roles`);

        return roles;
    } catch (error) {
        if (error.code === "econnrefused") {
            logging.error(__filename, `getAllRoles, interactionId: ${interaction.id} | Error connecting to database: ${error}`);
            return "err_ECONNREFUSED";
        } else {
            logging.error(__filename, ` getAllRoles, interactionId: ${interaction.id} | There was an issue executing a database query: ${error}`);
            return "err_error";
        }
    }
}

//make functions global
module.exports = { 
    getAllRoles,
};