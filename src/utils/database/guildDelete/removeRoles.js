const logging = require('../../baseUtils/logging');

const connectDatabase = require('../connectDatabase');
const pool = connectDatabase();
const promisePool = pool.promise();

async function removeAllGuildRoles(interaction, guildId) {
    logging.verboseInfo(__filename, `removeAllGuildRoles, interactionId: ${interaction.id} | Query executed`);
    try {
        const [ roles ] = await promisePool.execute(`
        delete from roles
        where
        guildId = ?`,
        [guildId]);

        return roles;
    } catch (error) {
        if (error.code === "econnrefused") {
            logging.error(__filename, `removeAllGuildRoles, interactionId: ${interaction.id} | Error connecting to database: ${error}`);
            return "err_ECONNREFUSED";
        } else {
            logging.error(__filename, ` removeAllGuildRoles, interactionId: ${interaction.id} | There was an issue executing a database query: ${error}`);
            return "err_error";
        }
    }
}

//make functions global
module.exports = { 
    removeAllGuildRoles,
};