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
        logging("error", error, "database/ping-timeout/general.js/roleInDatabase")
        return "error";
    }
}

//make functions global
module.exports = { 
    roleInDatabase,
};