const connectDatabase = require('../connectDatabase');
const pool = connectDatabase();
const { logging } = require('../../baseUtils/logging');

module.exports = async () => {
    try {
        const [result] = await pool.query(`
        create table if not exists bugReportBlacklist (
            userId varchar(40),
            blacklistDate datetime
        );
        `);
        if (result.warningStatus === 1) return;
        logging("info", 'Created the non existing table "roles"', "database/tables/ping-timeout.js");

    } catch (error) {
        logging("error", `There was an error creating a non-existing table "bugReportBlacklist": ${error}`, "database/tables/DEV.js");
    }
}

