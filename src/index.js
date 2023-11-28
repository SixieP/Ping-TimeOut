const logging = require('./utils/baseUtils/logging.js');
const { version } = require('../package.json');

logging.info(`Starting Ping TimeOut version ${version}`)

const { Client, IntentsBitField, Collection } = require('discord.js');
const { botToken } = require('../config.json');

const eventHandler = require('./handlers/eventHandler');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildPresences,
        IntentsBitField.Flags.GuildMembers,
    ]
});
//START check database connection
logging.info("Starting database connection test", `${__filename} - Database Connection Test`)
const { mysqlHost, mysqlPort, mysqlUser, mysqlPass, mysqlDatabase } = require('../config.json');
const mysql = require('mysql2');

const pool = mysql.createPool({
    host: mysqlHost,
    port: mysqlPort,
    user: mysqlUser,
    password: mysqlPass,
    database: mysqlDatabase
});

pool.query(`show databases`, function(err) {
    if (err) {
        logging.error(`Database connection error | ${err}`, `${__filename} - Database Connection Test`);
    } else {
        logging.info(`Succesfully connected to the database. Database: "${mysqlDatabase}"`, `${__filename} - Database Connection Test`);
    }

});

//END check database connection

//create a collection that is used for command cooldowns
client.cooldowns = new Collection();

eventHandler(client)
client.login(botToken);
