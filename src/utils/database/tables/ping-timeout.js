const connectDatabase = require('../connectDatabase');
const pool = connectDatabase();
const { logging } = require('../../baseUtils/logging');

module.exports = async () => {
    try {
        const [result] = await pool.query(`
        create table if not exists roles(
            roleId VARCHAR(32) not null PRIMARY KEY,
            guildId VARCHAR(32) not null,
            lastMention DATETIME null,
            timeoutTime INT not null,
            mentionable BOOLEAN not null DEFAULT false,
            inError boolean
            )
        `);
        if (result.warningStatus === 0) {
            logging("info", 'Created the non existing table "roles"', "database/tables/ping-timeout.js");
        }

    } catch (error) {
        logging("error", `There was an error creating a non-existing table "roles": ${error}`, "database/tables/ping-timeout.js");
    }

    try {
        const [result] = await pool.query(`
        alter table roles
        add inError boolean;
        `);
        logging("info", 'Created the non existing column "inError" in table "roles"', "database/tables/ping-timeout.js");

    } catch (error) {
        if (error.code !== "ER_DUP_FIELDNAME") {
            logging("error", `There was an error creating a non-existing table "roles": ${error}`, "database/tables/ping-timeout.js");
        }
    }
}