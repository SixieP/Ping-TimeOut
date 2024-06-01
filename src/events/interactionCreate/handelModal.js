const { aprovedMessage, deniedMessage } = require("../../utils/baseUtils/defaultEmbeds");
const getLocalCommands = require("../../utils/baseUtils/getLocalCommands");
const logging = require('../../utils/baseUtils/logging');

module.exports = async (client, interaction) => {
    if(!interaction.isModalSubmit()) return;

    const localCommands = getLocalCommands();

    const command = localCommands?.find(
        (command) => command.name === interaction.customId
    );

    if (!command) {
        logging.error(__filename, "modal-handler", interaction, `Modal ID not connecting to command. There is no command with the same name as the modal ID ${interaction.customId}.`);
        interactionErrorResponse(interaction);
        return;
    }

    try {
        await command.modal(client, interaction);
    } catch (error) {
        logging.error(__filename, "modal-handler", interaction, `Something went wrong executing the modal code. Modal ID: ${interaction.customId} | ${error}`);
        interactionErrorResponse(interaction);
    }
}

function interactionErrorResponse (interaction) {

    if (interaction.isRepliable) {
        interaction.reply({embeds: [deniedMessage("Something went wrong submitting your bug report :/ \n Please report it in the support discord (sixie.xyz/sixie-discord) or try it again later.")]});
    } else {
        interaction.editReply({embeds: [deniedMessage("Something went wrong submitting your bug report :/ \n Please report it in the support discord (sixie.xyz/sixie-discord) or try it again later.")]});
    };
}