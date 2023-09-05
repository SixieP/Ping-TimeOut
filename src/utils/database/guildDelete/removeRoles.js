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
        console.log(`Error with database-query (guildDelete/removRoles.js/removeAllGuildRoles) | Error: ${error}`);
        return "error";
    }
}

//make functions global
module.exports = { 
    removeAllGuildRoles,
};