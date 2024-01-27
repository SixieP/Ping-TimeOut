//sends a message to the guilds system message channel that the bot has no perms

const { EmbedBuilder } = require("@discordjs/builders");
const { permsCheck } = require("./permsCheck");

const logging = require("../baseUtils/logging");
const logTemplates = require("../baseUtils/logTemplates");

const { statGetRole } = require("../database/DEV/stats");


module.exports = (client, roleId, guildId, message) => {
    logging.globalInfo(__filename, `executing noPermsMessage. guildId: "${guildId}', roleId: "${roleId}"`);

    statGetRole(roleId)
    .then(([value]) => {
        if (!value.inError) {
            runCode();
        };
    })
    .catch((error) => logging.error(__filename, `Error getting timeout role from database. roleId: "${roleId}", error: "${error}'`));

    async function runCode() {
        logging.globalInfo(__filename, `noPermsMessage code started. roleId: ${roleId}`);

    //Set some global vars
    var guildObject;
    if (message) {
        guildObject = message.guild;
    } else {
        guildObject = await client.guilds.fetch(guildId)
        .catch((error) => logging.error(__filename, `Error fetching guild. guildId: "${guildId}", error: "${error}"`));

        if (!guildObject) return;
    };

    var errorEmbed;
    if (message) {
        logging.globalInfo(__filename, `noPermsMessage creating message with message. roleId: ${roleId}`);

        const messageChannelId = message.channelId;
        const messageId = message.id;

        const messageLink = `https://discord.com/channels/${guildId}/${messageChannelId}/${messageId}`;

        errorEmbed = new EmbedBuilder()
        .setTitle("Timeout Role Error")
        .setColor(0Xeb4c34)
        .addFields(
            {name: "Role", value: `<@&${roleId}>`, inline: true},
            {name: "Message", value: messageLink, inline: true},
            {name: "Issue", value: "A role that is monitored by Ping TimeOut was mentioned by a user. However the bot does not have the required permissions to manage the role. See below for the missing permissions."},
        )
        .setTimestamp();
    } else {
        logging.globalInfo(__filename, `noPermsMessage creating message withOUT message. roleId: ${roleId}`);

        errorEmbed = new EmbedBuilder()
        .setTitle("Timeout Role Issue")
        .setColor(0Xeb4c34)
        .addFields(
            {name: "Role", value: `<@&${roleId}>`, inline: true},
            {name: "Issue", value: "A role that is monitored by Ping Timeout its timeout has expired. However the bot does not have the required permissions to manage the role. See below for the missing permissions."},
        )
        .setTimestamp();
    };

    const guildMembers = guildObject.members;

    //Create the rol pos check
    const botMember = guildMembers.me;
    const botRoles = botMember.roles;
    const botHigestRole = botRoles.highest;

    guildObject.roles.fetch(roleId)
    .then((compareRole) => {
        compareRoles(compareRole);
    })
    .catch((error) => logging.error(__filename, `Error fetching role. roleId: "${roleId}", error: "${error}}"`));


    function compareRoles(compareRole) {
        const posDifference = botHigestRole.comparePositionTo(compareRole);

        var comparedRoleEmbed;
        if (posDifference > 0) { // Is good, role below the bot
            comparedRoleEmbed = new EmbedBuilder()
            .setTitle("Role Position Compare")
            .setColor(0X5bf531)
            .setDescription("This role is below the bot's highest role. Bot should be able manage it if the bot has all required permissions")
            .setTimestamp();

        } else if (posDifference === 0) { //Is bad, bots highest role so it can't manage it
            comparedRoleEmbed = new EmbedBuilder()
            .setTitle("Role Position Compare")
            .setColor(0Xeb4c34)
            .setDescription("This role is the bot's highest. A bot can only manage roles below it's highest role. A bot/user can never manage it's own highest role")
            .setTimestamp();
        } else if (posDifference < 0) { //Is bad, other role is above the bots role
            comparedRoleEmbed = new EmbedBuilder()
            .setTitle("Role Position Compare")
            .setColor(0Xeb4c34)
            .setDescription("This role is above the bot's highest role. A bot can only manage roles below it's highest role.")
            .setTimestamp();
        } else { //In case a unexpected value is present
            comparedRoleEmbed = new EmbedBuilder()
            .setTitle("Role Position Compare - Error")
            .setColor(0Xeb4c34)
            .setDescription("There was an error comparing roles.")
            .setTimestamp();
        };
        
        sendMessage(comparedRoleEmbed);
    };

    async function sendMessage(comparedRoleEmbed) {
        const permCheckEmbed = await permsCheck(guildObject); //Do the permscheck and get the embed

        const systemChannelObject = guildObject.systemChannel;

        if (!systemChannelObject) {
            logging.globalInfo(__filename, `Guild has no systemChannel. No perms message NOT send. roleId: "${roleId}", guildId: "${guildId}"`);
            return;
        };
    
        systemChannelObject.send({embeds: [errorEmbed, comparedRoleEmbed, permCheckEmbed]})
        .catch((error) => logging.error(__filename, `Error while sending message to a guilds system channel. roleId: "${roleId}", guildId: "${guildId}", error: "${error}"`));
    };
    }
};