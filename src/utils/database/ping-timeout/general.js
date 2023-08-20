const connectDatabase = require('../connectDatabase');
const pool = connectDatabase();

async function roleInDatabase(roleId) {
    try {
        const [ role ] = await pool.query(`
        select * from roles
        where
        roleId = ?`, [roleId]);

        if (role[0]) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.log(`Error with database-query (ping-timeout/general.js/roleInDatabase) | Error: ${error}`);
        return "error";
    }
}

//make functions global
module.exports = { 
    roleInDatabase,
};