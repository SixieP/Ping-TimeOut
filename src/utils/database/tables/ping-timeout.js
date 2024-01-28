const logging = require('../../baseUtils/logging');

const connectDatabase = require('../connectDatabase');
const pool = connectDatabase();
const promisePool = pool.promise();


module.exports = async () => {
    try {
        logging.verboseInfo(__filename, 'Checking if table "roles" exists');

        const [result] = await promisePool.query(`
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
            logging.info(__filename, 'Created the non existing table "roles"');
        }

    } catch (error) {
        logging.error(__filename, `There was an error creating a non-existing table "roles" | Error: ${error}`)
    }

    try {
        logging.verboseInfo(__filename, 'Checking if table "roles" has the column "inError"');
        const [result] = await promisePool.query(`
        alter table roles
        add inError boolean;
        `);
        logging.info(__filename, 'Created the non existing column "inError" in table "roles"');

    } catch (error) {
        if (error.code !== "ER_DUP_FIELDNAME") {
            logging.error(__filename, `There was an error creating a non-existing column "inError" in table "roles" | Error: ${error}`);
        }
    }
}