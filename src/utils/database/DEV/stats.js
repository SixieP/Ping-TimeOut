const connectDatabase = require('../connectDatabase');
const pool = connectDatabase();

//get all the roles
async function statGetAllRoles() {
    try {
        const [ role ] = await pool.query(`
        select * from roles;
        `)

        return role;
    } catch (error) {
        logging("error", error, "database/DEV/stats.js/getALLRoles")
        return "error";
    }
}

//get all roles from a specific guild
async function statGetRolesByGuild(guildId) {
    try {
        const [ role ] = await pool.query(`
        select * from roles
        where
        guildId = ?;
        `, [guildId])

        return role;
    } catch (error) {
        logging("error", error, "database/DEV/stats.js/statGetRolesByGuild")
        return "error";
    }
}

//get all roles from a specific guild
async function statGetRole(roleId) {
    try {
        const [ role ] = await pool.query(`
        select * from roles
        where
        roleId = ?;
        `, [roleId])

        return role;
    } catch (error) {
        logging("error", error, "database/DEV/stats.js/statGelRole")
        return "error";
    }
}

//make functions global
module.exports = { 
    statGetAllRoles,
    statGetRolesByGuild,
    statGetRole,
};