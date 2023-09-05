const connectDatabase = require('../connectDatabase');
const pool = connectDatabase();

module.exports = async () => {
    try {
        const [result] = await pool.query(`
        create table if not exists roles(
            roleId VARCHAR(32) not null PRIMARY KEY,
            guildId VARCHAR(32) not null,
            lastMention DATETIME null,
            timeoutTime INT not null,
            mentionable BOOLEAN not null DEFAULT false
            )
        `);
        if (result.warningStatus === 1) return;
        logging("info", 'Created the non existing table "roles"', "database/tables/ping-timeout.js");

    } catch (error) {
        logging("error", `There was an error creating a non-existing table "roles": ${error}`, "database/tables/ping-timeout.js");
    }
}