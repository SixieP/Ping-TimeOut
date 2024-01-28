const logging = require('../../baseUtils/logging');

const connectDatabase = require('../connectDatabase');
const pool = connectDatabase();
const promisePool = pool.promise();

module.exports = async () => {
    try {
        logging.verboseInfo(__filename, 'Checking if table "bugReportBlacklist" exists');

        const [result] = await promisePool.query(`
        create table if not exists bugReportBlacklist (
            userId varchar(40) not null primary key,
            blacklistDate datetime not null,
            blacklistReason varchar(1000)
        );
        `);
        if (result.warningStatus === 1) return;
        logging.info(__filename, 'Created the non existing table "bugReportBlacklist"');

    } catch (error) {
        logging.error(__filename, `There was an error creating a non-existing table "bugReportBlacklist" | Error: ${error}`)
    }
}

