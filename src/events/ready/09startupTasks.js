//list of scripts that will run when the bot starts
const setStatus = require('../../utils/botStatus/setStatus');

module.exports = (client) => {
    //set the bots status
    setStatus(client);
}