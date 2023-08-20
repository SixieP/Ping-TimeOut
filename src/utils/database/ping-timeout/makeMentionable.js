const connectDatabase = require('../connectDatabase');
const pool = connectDatabase();

async function getNotMentionableRoles(guildId) {
    try {
        if (!guildId) {
            const [ roles ] = await pool.query(`
            select * from roles
            where
            mentionable = false`, 
            [guildId]);
            return roles;
        } else {
            const [ roles ] = await pool.query(`
            select * from roles
            where
            guildId = ?
            and
            mentionable = false`, 
            [guildId]);
            return roles;
        }
    } catch (error) {
        console.log(`Error with database-query (ping-timeout/makeMentionable.js/getNotMentionableRoles) | Error: ${error}`);
        return "error";
    }
}

async function updateSetMentionable (roleId) {
    try {
        await pool.query(`
        update roles
        set 
        mentionable = true
        where
        roleId = ?`, [ roleId ])
    } catch (error) {
        console.log(`Error with database-query (ping-timeout/makeMentionable.js/updateSetMentionable) | Error: ${error}`);
        return "error";
    }
}

//make functions global
module.exports = { 
    getNotMentionableRoles,
    updateSetMentionable,
};