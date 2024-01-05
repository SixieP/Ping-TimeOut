const logging = require('./utils/baseUtils/logging.js');
const { version } = require('../package.json');

logging.info(__filename, `Starting Ping TimeOut version ${version}`)

const { Client, IntentsBitField, Collection } = require('discord.js');
const { botToken } = require('../config.json');

const eventHandler = require('./handlers/eventHandler');


logging.info(__filename, `Creating Client`)
const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildPresences,
        IntentsBitField.Flags.GuildMembers,
    ]
});
//START check database connection

logging.info(__filename, `Testing database connection`);

const { testConnecion } = require('./utils/database/startup/testConn.js');

testConnecion();

//END check database connection

//create a collection that is used for command cooldowns
client.cooldowns = new Collection();


eventHandler(client);
client.login(botToken);
