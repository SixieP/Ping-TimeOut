const cron = require('node-cron');
const makeMentionable = require('../../utils/ping-timeout/makeMentionable');
const setStatus = require('../../utils/botStatus/setStatus');

module.exports = (client) => {
    //ping-timeout
    cron.schedule('0-59 * * * *', () => {
        makeMentionable(client);
    })
    //set the bots status
    cron.schedule('0-59/5 * * * *', () => {
        setStatus(client);
    })
}