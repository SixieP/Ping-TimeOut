const connectDatabase = require('../connectDatabase');
const pool = connectDatabase();


async function updateLastMention (roleId, lastMention, mentionable) {
    var mentionInt;
    if (mentionable === true) {
        mentionInt = 1;
    } else {
        mentionInt = 0;
    }
    
    try {
        await pool.query(`
        update roles
        set 
        lastMention = ?,
        mentionable = ?
        where
        roleId = ?`, [lastMention, mentionInt, roleId ])
    } catch (error) {
        logging("error", error, "database/ping-timeout/newMention.js/updateLastMention");
        return "error";
    }
}

//make functions global
module.exports = { 
    updateLastMention,
};