const connectDatabase = require('../connectDatabase');
const pool = connectDatabase();

async function getNotMentionableRoles(guildId) {
    try {
        if (!guildId) {
            const [ roles ] = await pool.query(`
            select * from roles
            where
            mentionable = 0`, 
            [guildId]);
            return roles;
        } else {
            const [ roles ] = await pool.query(`
            select * from roles
            where
            guildId = ?
            and
            mentionable = 0`, 
            [guildId]);
            return roles;
        }
    } catch (error) {
        logging("error", error, "database/ping-timeout/makeMentionable.js/getNotMentionableRoles")
        return "error";
    }
}

async function updateSetMentionable (roleId) {
    try {
        await pool.query(`
        update roles
        set 
        mentionable = 1
        where
        roleId = ?`, [ roleId ])
    } catch (error) {
        logging("error", error, "database/ping-timeout/makeMentionable.js/updateSetMentionable")
        return "error";
    }
}

//make functions global
module.exports = { 
    getNotMentionableRoles,
    updateSetMentionable,
};