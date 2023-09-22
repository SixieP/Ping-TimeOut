const { logging } = require('../../baseUtils/logging');
const connectDatabase = require('../connectDatabase');
const pool = connectDatabase();

async function getAllRoles() {
    try {
        const [ roles ] = await pool.query(`
        select count(roleId) as roles from roles`);

        return roles;
    } catch (error) {
        logging("error", error, "database/botStatus/setStatus.js/getAllRoles");
        return "error";
    }
}

//make functions global
module.exports = { 
    getAllRoles,
};