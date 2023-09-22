const { EmbedBuilder, inlineCode, bold, italic } = require("discord.js");

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

function warnMessage(description, title) {

    var warnEmbed;
    if (title) {
        warnEmbed = new EmbedBuilder()
        .setColor(0xf0b616)
        .setTitle(title)
        .setDescription(`:warning: ${description}`);
    } else {
        warnEmbed = new EmbedBuilder()
        .setColor(0xf0b616)
        .setDescription(`:warning: ${description}`);
    }

    return warnEmbed;
}

module.exports = {
    deniedMessage,
    aprovedMessage,
    warnMessage,
};