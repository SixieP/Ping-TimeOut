// Exepted data - includes: trying to do something to a role that is imposible, so user errors, etc.

const { inlineCode } = require("discord.js");
const { EmbedBuilder } = require("@discordjs/builders");

// Errors - Unexpected things that isn't the user's fault. Like database errors, api errors, etc.

exports.generalCommandError = (errMessage, errCode) => {
    const embed = new EmbedBuilder()
    .setColor(0xb01b04)
    .setTitle("Error")
    .setDescription(`Something went wrong executing this command. Please try again later`)
    .addFields(
        {name: "Error message", value: inlineCode(errMessage), inline: true},
        {name: "Error Code", value: inlineCode(errCode), inline: true}
    )
    .setTimestamp();

    return embed;
};