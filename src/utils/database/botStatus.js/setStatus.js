const connectDatabase = require('../connectDatabase');
const pool = connectDatabase();

async function getAllRoles() {
    try {
        const [ roles ] = await pool.query(`
        select count(roleId) as roles from roles`);

        return roles;
    } catch (error) {
        console.log(`Error with database-query (botStatus/setStatus.js/getAllRoles) | Error: ${error}`);
        return "error";
    }
}

//make functions global
module.exports = { 
    getAllRoles,
};