const connectDatabase = require('../connectDatabase');
const pool = connectDatabase();
const logging = require('../../baseUtils/logging');

module.exports = async () => {
    try {
        logging.background(`Checking "roles" table`, `${__filename} - startup-database`);
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
            logging.info('Created the non existing table "roles"', `${__filename} - startup-database`)
        }

    } catch (error) {
        logging.error(`There was an error checking/creating a non-existing table "roles": ${error}`, `${__filename} - startup-database`);
    }

    try {
        logging.background(`Checking the "inError" colum in table "roles"`, `${__filename} - startup-database`);
        const [result] = await pool.query(`
        alter table roles
        add inError boolean;
        `);
        logging.info('Created the non existing column "inError" in table "roles"', `${__filename} - startup-database`);

    } catch (error) {
        if (error.code !== "ER_DUP_FIELDNAME") {
            logging.error(`There was an error checking/creating a non-existing colum "inError" in table "roles": ${error}`, `${__filename} - startup-database`); 
        }
    }
}