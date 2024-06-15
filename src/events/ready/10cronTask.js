const cron = require('node-cron');
const makeMentionable = require('../../utils/ping-timeout/makeMentionable');
const setStatus = require('../../utils/botStatus/setStatus');

const logging = require('../../utils/baseUtils/logging');


module.exports = (client) => {
    logging.info(__filename, "Setup up multiple cron tasks");

    //ping-timeout
    cron.schedule('0-59 * * * *', () => { //Check if the bot should make a role mentionable again every minute;
        logging.verboseInfo(__filename, "Cron task: Checking for role's to make mentionable again.")
        makeMentionable(client);
    })
    //set the bots status
    cron.schedule('0-59/5 * * * *', () => {
        logging.verboseInfo(__filename, "Cron task: Setting the bot's status");
        setStatus(client);
    })
}