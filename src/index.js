const logging = require('./utils/baseUtils/logging.js');
const { version } = require('../package.json');

logging.basicInfoLog(`Starting Ping TimeOut version ${version}`)

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
const { mysqlHost, mysqlPort, mysqlUser, mysqlPass, mysqlDatabase } = require('../config.json');
const mysql = require('mysql2');
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

const pool = mysql.createPool({
    host: mysqlHost,
    port: mysqlPort,
    user: mysqlUser,
    password: mysqlPass,
    database: mysqlDatabase
});
pool.query(`show databases`, async function (err) {
    if (err) {
        logging.basicErrorLog(__filename, err, "connecting to mysql database");

        await sleep(300);

        throw err;
    }
    logging.basicInfoLog(`Succesfully connected to the database. Database: "${mysqlDatabase}"`, 'startup-database')
})
//END check database connection

//create a collection that is used for command cooldowns
client.cooldowns = new Collection();


eventHandler(client)
client.login(botToken);
