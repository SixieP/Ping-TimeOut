//list of scripts that will run when the bot starts
const setStatus = require('../../utils/botStatus/setStatus');

const logging = require('../../utils/baseUtils/logging');

module.exports = (client) => {
    //set the bots status
    logging.info(__filename, "Set the bot's status at startup")
    setStatus(client);
};