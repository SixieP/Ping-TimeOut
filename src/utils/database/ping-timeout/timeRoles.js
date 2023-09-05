const connectDatabase = require('../connectDatabase');
const pool = connectDatabase();

async function rolesByGuild(guildId) {
    try {
        const [result] = await pool.query(`
        select * from roles
        where
        guildId = ?`,
        [guildId]);

        if (!result[0]) {
            return "noDataError";
        };
        return result;
    } catch (error) {
        console.log(`Error with database-query (ping-timeout/timeRoles.js/rolesByGuild) | Error: ${error}`);
        return "error";
    }
}

//make functions global
module.exports = { 
    rolesByGuild,
};