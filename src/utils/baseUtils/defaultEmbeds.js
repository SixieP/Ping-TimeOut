const { EmbedBuilder } = require("discord.js");


function deniedMessage(description, title) {

    var noPermsEmbed
    if (title) {
        noPermsEmbed = new EmbedBuilder()
        .setColor(0xC83400)
        .setTitle(title)
        .setDescription(`:x: ${description}`);
    } else {
        noPermsEmbed = new EmbedBuilder()
        .setColor(0xC83400)
        .setDescription(`:x: ${description}`);
    }

    return noPermsEmbed;
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