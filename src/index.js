const { Client, IntentsBitField } = require('discord.js');
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
const { logging } = require('./utils/baseUtils/logging');
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

const pool = mysql.createPool({
    host: mysqlHost,
    port: mysqlPort,
    user: mysqlUser,
    password: mysqlPass,
    database: mysqlDatabase
});

logging("start");

pool.query(`show databases`, async function (err) {
    if (err) {
        logging("error", err, "database-startup")

        await sleep(300);

        throw err;
    }
    logging("info", `Succesfully connected to the database. Database: "${mysqlDatabase}"`, 'startup-database')
})
//END check database connection

eventHandler(client)
client.login(botToken);
