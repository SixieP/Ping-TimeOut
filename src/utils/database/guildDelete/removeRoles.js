const { logging } = require('../../baseUtils/logging');
const connectDatabase = require('../connectDatabase');
const pool = connectDatabase();

async function removeAllGuildRoles(guildId) {
    try {
        const [ roles ] = await pool.query(`
        delete from roles
        where
        guildId = ?`,
        [guildId]);

        return roles;
    } catch (error) {
        logging("error", error, "database/guildDelete/removRoles.js/removeAllGuildRoles")
        return "error";
    }
}

//make functions global
module.exports = { 
    removeAllGuildRoles,
};