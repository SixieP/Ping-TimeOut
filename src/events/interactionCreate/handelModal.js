const { aprovedMessage, deniedMessage } = require("../../utils/baseUtils/defaultEmbeds");
const getLocalCommands = require("../../utils/baseUtils/getLocalCommands");
const { logging } = require('../../utils/baseUtils/logging');

module.exports = async (client, interaction) => {
    if(!interaction.isModalSubmit()) return;

    const localCommands = getLocalCommands();

    const command = localCommands?.find(
        (command) => command.name === interaction.customId
    );

    if (!command) {
        logging("ERROR", "Command not found", "handelModal.js");
        interaction.reply({embeds: [deniedMessage("Something went wrong reporting your bug :/ \n Please report it in the support discord (sixie.xyz/sixie-discord)")]});
        return;
    }

    try {
        await command.modal(client, interaction);
    } catch (error) {
        logging("ERROR", `Something went wrong executing the modal response | ${error}`, "handelModal.js");
    }
}