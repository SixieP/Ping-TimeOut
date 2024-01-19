const logging = require('../../baseUtils/logging');

const connectDatabase = require('../connectDatabase');
const pool = connectDatabase();
const promisePool = pool.promise();

async function rolesByGuild(interaction, guildId) {
    logging.verboseInfo(__filename, `rolesByGuild, interactionId: ${interaction.id} | Query executed`);
    try {
        const [result] = await promisePool.execute(`
        select * from roles
        where
        guildId = ?`,
        [guildId]);

        if (!result[0]) {
            return "noDataError";
        };
        return result;
    } catch (error) {
        if (error.code === "econnrefused") {
            logging.error(__filename, `rolesByGuild, interactionId: ${interaction.id} | Error connecting to database: ${error}`);
            return "err_ECONNREFUSED";
        } else {
            logging.error(__filename, ` rolesByGuild, interactionId: ${interaction.id} | There was an issue executing a database query: ${error}`);
            return "err_error";
        }
    }
}

//make functions global
module.exports = { 
    rolesByGuild,
};