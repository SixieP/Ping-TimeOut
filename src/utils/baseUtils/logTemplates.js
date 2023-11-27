exports.interactionBasic = (message, interaction) => {

    const JSONinfo = {'interactionId': interaction.id, 'createdAt': interaction.createdAt, 'userId': interaction.user.id, 'guildId': interaction.guildId, 'appPerms': interaction.appPermissions, 'memberPerms': interaction.memberPermissions};

    const returnMessage = `${message} | ${JSONinfo}`;

    return returnMessage;
};

exports.commandinteractionBasic = (message, interaction) => {

    const JSONinfo = {'interactionId': interaction.id, 'commandName':interaction.commandName , 'subCommand':interaction.options.getSubcommand(), 'subCommandGroup':interaction.options.getSubcommandGroup() ,'createdAt': interaction.createdAt, 'userId': interaction.user.id, 'guildId': interaction.guildId, 'appPerms': interaction.appPermissions, 'memberPerms': interaction.memberPermissions};

    const returnMessage = `${message} | ${JSONinfo}`;

    return returnMessage;
};
