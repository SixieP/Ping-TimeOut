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
        console.log('DATABASE-table_create | Created the non existing table "roles"')

    } catch (error) {
        console.error(`There was an error creating a non-existing table "roles" | Error: ${error}`)
    }
}