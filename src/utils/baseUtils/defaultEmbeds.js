const { EmbedBuilder } = require("discord.js");


function deniedMessage(description, title) {

    var deniedEmbed
    if (title) {
        deniedEmbed = new EmbedBuilder()
        .setColor(0xC83400)
        .setTitle(title)
        .setDescription(`:x: ${description}`);
    } else {
        deniedEmbed = new EmbedBuilder()
        .setColor(0xC83400)
        .setDescription(`:x: ${description}`);
    }

    return deniedEmbed;
}

function aprovedMessage(description, title) {

    var doneEmbed;
    if (title) {
        doneEmbed = new EmbedBuilder()
        .setColor(0xB000)
        .setTitle(title)
        .setDescription(`:white_check_mark: ${description}`);
    } else {
        doneEmbed = new EmbedBuilder()
        .setColor(0xB000)
        .setDescription(`:white_check_mark: ${description}`);
    }

    return doneEmbed;
}

module.exports = {
    deniedMessage,
    aprovedMessage,
};