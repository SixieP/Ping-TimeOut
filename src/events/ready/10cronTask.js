const cron = require('node-cron');
const makeMentionable = require('../../utils/ping-timeout/makeMentionable');

module.exports = (client) => {
    //ping-timeout
    cron.schedule('0-59 * * * *', () => {
        makeMentionable(client);
    })
}