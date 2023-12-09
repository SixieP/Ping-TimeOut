const logging = require('../../baseUtils/logging');

const connectDatabase = require('../connectDatabase');
const pool = connectDatabase();
const promisePool = pool.promise();

//get all the roles
async function statGetAllRoles(interaction) {
    logging.verboseInfo(__filename, `statGetAllRoles, interactionId: ${interaction.id} | Query executed`);
    try {
        const [ role ] = await promisePool.execute(`
        select * from roles;
        `)

        return role;
    } catch (error) {
        if (error.code === "econnrefused") {
            logging.error(__filename, `statGetAllRoles, interactionId: ${interaction.id} | Error connecting to database: ${error}`);
            return "err_ECONNREFUSED";
        } else {
            logging.error(__filename, ` statGetAllRoles, interactionId: ${interaction.id} | There was an issue executing a database query: ${error}`);
            return "err_error";
        }
    }
}

//get all roles from a specific guild
async function statGetRolesByGuild(interaction, guildId) {
    logging.verboseInfo(__filename, `statGetRolesByGuild, interactionId: ${interaction.id} | Query executed`);
    try {
        const [ role ] = await promisePool.execute(`
        select * from roles
        where
        guildId = ?;
        `, [guildId])

        return role;
    } catch (error) {
        if (error.code === "econnrefused") {
            logging.error(__filename, `statGetRolesByGuild, interactionId: ${interaction.id} | Error connecting to database: ${error}`);
            return "err_ECONNREFUSED";
        } else {
            logging.error(__filename, ` statGetRolesByGuild, interactionId: ${interaction.id} | There was an issue executing a database query: ${error}`);
            return "err_error";
        }
    }
}

//get all roles from a specific guild
async function statGetRole(interaction, roleId) {
    logging.verboseInfo(__filename, `statGetRole, interactionId: ${interaction.id} | Query executed`);
    try {
        const [ role ] = await promisePool.execute(`
        select * from roles
        where
        roleId = ?;
        `, [roleId])

        return role;
    } catch (error) {
        if (error.code === "econnrefused") {
            logging.error(__filename, `statGetRole, interactionId: ${interaction.id} | Error connecting to database: ${error}`);
            return "err_ECONNREFUSED";
        } else {
            logging.error(__filename, ` statGetRole, interactionId: ${interaction.id} | There was an issue executing a database query: ${error}`);
            return "err_error";
        }
    }
}

//make functions global
module.exports = { 
    statGetAllRoles,
    statGetRolesByGuild,
    statGetRole,
};