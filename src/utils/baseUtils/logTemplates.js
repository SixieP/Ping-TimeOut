// Application Command Interactions

exports.commandInteractionStart = (interaction) => { // Used when an Application Command Interaction is executed

    const info = {
        'interactionId': interaction.id,
        'createdAt': interaction.createdAt,
        'userId': interaction.user.id,
        'guildId': interaction.guildId,
        'appPerms': interaction.appPermissions,
        'memberPerms': interaction.memberPermissions,
        'commandName': interaction.commandName
    };

    JSONinfo = JSON.stringify(info);

    const returnMessage = `Application Slash Command has been executed | ${JSONinfo}`;

    return returnMessage;
};

exports.commandInteractionInfo = (interaction, event) => { // Used to give general information

    const returnMessage = `${event} | InteractionId: ${interaction.id}`;

    return returnMessage;
}

exports.commandInteractionException  = (interaction, event, additionalData) => { // Used in both warnings and errors

    const info = {
        'interactionId': interaction.id,
        'commandName': interaction.commandName,
        'deferred': interaction.deferred,
        'ephemeral': interaction.ephemeral,
        'replied': interaction.replied,
    };

    JSONinfo = JSON.stringify(info);

    var returnMessage;
    if (additionalData) {
        returnMessage = `Error with application command: ${event} | ${JSONinfo} | Additional Data: ${additionalData}`;
    } else {
        returnMessage = `Error with application command: ${event} | ${JSONinfo}`;
    }

    return returnMessage;
};

exports.commandInteractionEnd = (interaction) => { // Used when an commandInteraction is done

    const returnMessage = `End of Application Command Interaction | InteractionId: ${interaction.id}`;

    return returnMessage;
}

exports.messageInteractionCreate = (message) => {
    const info = {
        'messageId': message.id,
        'authorId': message.author.id,
        'guildId': message.guildId
    }

    JSONinfo = JSON.stringify(info);

    const logMessage = `A message was send/created | ${JSONinfo};`;

    return logMessage;
}

exports.messageInteractionCustomInfo = (message, event, customInfo) => {

    var logMessage;
    if (customInfo) {
        logMessage = `Log entry surrounding action that result by a message being created: ${event} | Message id: ${message.id} | Custom info: ${customInfo};`;
    } else {
        logMessage = `Log entry surrounding action that result by a message being created: ${event} | Message id: ${message.id};`;
    }

    return logMessage;
}