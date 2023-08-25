const { EmbedBuilder } = require("discord.js");


function deniedMessage(title, description) {
    const noPermsEmbed = new EmbedBuilder()
    .setColor(0xC83400)
    .setTitle(title)
    .setDescription(`:x: ${description}`);

    return noPermsEmbed;
}

function aprovedMessage(title, description) {
    const doneEmbed = new EmbedBuilder()
    .setColor(0xB000)
    .setTitle(title)
    .setDescription(`:white_check_mark: ${description}`);

    return doneEmbed;
}

module.exports = {
    deniedMessage,
    aprovedMessage,
};