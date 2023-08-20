const connectDatabase = require('../connectDatabase');
const pool = connectDatabase();


async function updateLastMention (roleId, lastMention, mentionable) {
    try {
        await pool.query(`
        update roles
        set 
        lastMention = ?,
        mentionable = ?
        where
        roleId = ?`, [lastMention, mentionable, roleId ])
    } catch (error) {
        console.log(`Error with database-query (ping-timeout/newMention.js/updateLastMention) | Error: ${error}`);
        return "error";
    }
}

//make functions global
module.exports = { 
    updateLastMention,
};