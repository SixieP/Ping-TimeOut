const logging = require("../../utils/baseUtils/logging");

module.exports = async (client) => {
    logging.info(__filename, `The bot "${client.user.tag}" is online!`);
    console.log('=== BOT ONLINE ===');
}