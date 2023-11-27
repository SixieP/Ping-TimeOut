const connectDatabase = require('../connectDatabase');
const pool = connectDatabase();
const logging = require('../../baseUtils/logging');

module.exports = async () => {
    try {
        logging.background(`Checking "bugReportBlacklist" table`, `${__filename} - startup-database`);
        const [result] = await pool.query(`
        create table if not exists bugReportBlacklist (
            userId varchar(40) not null primary key,
            blacklistDate datetime not null,
            blacklistReason varchar(1000)
        );
        `);
        if (result.warningStatus === 1) return;
        logging.info('Created the non existing table "bugReportBlacklist"', `${__filename} - startup-database`)

    } catch (error) {
        logging.error(`There was an error checking/creating a non-existing table "bugReportBlacklist": ${error}`, `${__filename} - startup-database`);
    }
}

