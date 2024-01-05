//sends a message to the guilds system message channel that the bot has no perms

const { EmbedBuilder, bold } = require("@discordjs/builders");
const { permsCheck } = require("./permsCheck");
const compareBotRoleRank = require("./compareBotRoleRank");
const { aprovedMessage, deniedMessage } = require("../baseUtils/defaultEmbeds");

const logging = require("../baseUtils/logging");
const logTemplates = require("../baseUtils/logTemplates");


module.exports = async (client, roleId, guildId, interaction) => {
    //get info about the guild and role
    client.guilds.fetch();
    const guildInfo = client.guilds.fetch(guildId).catch(error => {
        logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while fetching guild", `Error: ${error}`));
        return;
    });

    const systemChannelId = guildInfo.systemChannelId;

    if (!systemChannelId) {
        logging.globalInfo(__filename, logTemplates.commandInteractionInfo(interaction, `Guild has no system channel. noPermsMessage NOT send. ${guildId}, roleId: ${roleId}`));
        return;
    }
    
    var errorEmbed;
    if (interaction) {
        const messageChannelId = interaction.channelId;
        const messageId = interaction.id;

        const messageLink = `https://discord.com/channels/${guildId}/${messageChannelId}/${messageId}`;
        
        errorEmbed = new EmbedBuilder()
        .setTitle("Timed Role Error")
        .setColor(0xB000)
        .setAuthor({name: interaction.author.globalName, iconURL: interaction.author.avatarURL()})
        .addFields(
            {name: "Role", value: `<@&${roleId}>`, inline: true},
            {name: "Message", value: messageLink, inline: true},
            {name: "Issue", value: "This timed role has been mentioned by a user but the bot doesn't have the required permissions to edit the role. Check below for more info."},
        )
        .setTimestamp();
        
    } else {
        errorEmbed = new EmbedBuilder()
        .setTitle("Timed Role Error")
        .setColor(0xB000)
        .setAuthor({name: client.user.globalName, iconURL: client.user.avatarURL()})
        .addFields(
            {name: "Role", value: `<@&${roleId}>`, inline: true},
            {name: "Issue", value: "The bot has tried to make this role mentionable again after the timed time expired but the doesn't have the required permisssions to do that. Check below for more info."},
        )
        .setTimestamp();
    }

    guildInfo.channels.fetch();
    const systemChannelInfo = guildInfo.channels.fetch(systemChannelId).catch(error => {
        logging.error(__filename, logTemplates.commandInteractionException(interaction, "Error while fetching channel", `channelId: ${channelId}. Error: ${error}`));
    });

    const permsEmbed = await permsCheck(client, guildId);

    const rolePos = compareBotRoleRank(client, guildId, roleId);

    var rolePosEmbed;
    if (rolePos > 0) {
        rolePosEmbed = deniedMessage(`The bots role has a ${bold('lower')} position than the role mentioned!`, "Role Position Check")
    } else {
        rolePosEmbed = aprovedMessage(`The bots role has a ${bold('higher')} position than the role mentioned.`, "Role Position Check")
    }

    await systemChannelInfo.send({embeds: [errorEmbed, permsEmbed, rolePosEmbed]}).catch(error => {
        logging.error(__filename, logTemplates.commandInteractionException(interaction, "Trying to send a embedded message.", `Error: ${error}`));
    })
}