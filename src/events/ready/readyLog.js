const { logging } = require("../../utils/baseUtils/logging");

module.exports = async (client) => {
    logging("info", `The bot "${client.user.tag}" is online!`, "startup")
    console.log('=== BOT ONLINE ===');
}