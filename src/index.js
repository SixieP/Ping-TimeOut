const { Client, IntentsBitField } = require('discord.js');
const { applicationId, botToken } = require('../config.json');

const eventHandler = require('./handlers/eventHandler');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages
    ]
});

eventHandler(client)
client.login(botToken);
