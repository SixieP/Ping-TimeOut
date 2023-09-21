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
        mentionable = 1,
        inError = 0
        where
        roleId = ?`, [ roleId ])
    } catch (error) {
        logging("error", error, "database/ping-timeout/makeMentionable.js/updateSetMentionable")
        return "error";
    }
}

async function databaseRoleErrorState (roleId, errorState = true) {
    var setErrorState;
    if (errorState === false | errorState === 0) {
        setErrorState = 0
    } else {
        setErrorState = 1
    }
    try {
        await pool.query(`
        update roles
        set 
        inError = ?
        where
        roleId = ?`, [ setErrorState, roleId ])
    } catch (error) {
        logging("error", error, "database/ping-timeout/makeMentionable.js/setInError")
        return "error";
    }
}

//make functions global
module.exports = { 
    getNotMentionableRoles,
    updateSetMentionable,
    databaseRoleErrorState,
};