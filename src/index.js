const { Client, IntentsBitField } = require('discord.js');
const { botToken } = require('../config.json');

const eventHandler = require('./handlers/eventHandler');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages
    ]
});

//START check database connection
const { mysqlHost, mysqlPort, mysqlUser, mysqlPass, mysqlDatabase } = require('../config.json');
const mysql = require('mysql2');
const { logging } = require('./utils/baseUtils/logging');

const pool = mysql.createPool({
    host: mysqlHost,
    port: mysqlPort,
    user: mysqlUser,
    password: mysqlPass,
    database: mysqlDatabase
});

logging("start");

pool.query(`show databases`, function (err) {
    if (err) throw err;

    logging("info", `Succesfully connected to the database. Database: "${mysqlDatabase}"`, 'startup-database')
})
//END check database connection

eventHandler(client)
client.login(botToken);
