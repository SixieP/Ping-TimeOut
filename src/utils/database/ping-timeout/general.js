const logging = require('../../baseUtils/logging');

const connectDatabase = require('../connectDatabase');
const pool = connectDatabase();
const promisePool = pool.promise();

async function roleInDatabase(interaction, roleId) {
    logging.verboseInfo(__filename, `roleInDatabase, interactionId: ${interaction.id} | Query executed`);
    try {
        const [ role ] = await promisePool.execute(`
        select * from roles
        where
        roleId = ?`, [roleId]);

        if (role[0]) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        if (error.code === "econnrefused") {
            logging.error(__filename, `roleInDatabase, interactionId: ${interaction.id} | Error connecting to database: ${error}`);
            return "err_ECONNREFUSED";
        } else {
            logging.error(__filename, ` roleInDatabase, interactionId: ${interaction.id} | There was an issue executing a database query: ${error}`);
            return "err_error";
        }
    }
}

//make functions global
module.exports = { 
    roleInDatabase,
};