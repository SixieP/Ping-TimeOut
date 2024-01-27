const { EmbedBuilder, inlineCode, PermissionFlagsBits, bold, underscore, ApplicationCommandOptionType, italic, Embed } = require('discord.js');
const { deniedMessage, aprovedMessage } = require('../../utils/baseUtils/defaultEmbeds');
const { permsCheck } = require('../../utils/ping-timeout/permsCheck');

module.exports = {
    name: "help",
    description: 'Use this command if you need help with the bot',
    defaultMemberPermissions: PermissionFlagsBits.Administrator,
    options: [
        {
            name: "page",
            description: "The page or command you need help with",
            type: ApplicationCommandOptionType.String,
            choices: [
                {
                    name: "1",
                    value: "page-1"
                },
                {
                    name: "setup",
                    value: "setup"
                },
                {
                    name: "permscheck",
                    value: "permscheck"
                },
            ]
        }
    ],
    // devOnly: Boolean,
    // deleted: Boolean,
    // testCommand: Boolean,

    callback: async (client, interaction) => {
        const page = interaction.options.get('page')?.value;
        const guildId = interaction.guildId;
        const guildObject = interaction.guild;

        var embed;
        var permsCheckEmbed;
        if (!page || page === "page-1") {
            embed = new EmbedBuilder()
            .setTitle("Ping TimeOut | Help")
            .setDescription(`
            ${bold("All commands")}

            ${underscore("Main")}
            ${inlineCode("/timed-role add")} Add a new role that should be monitored.
            ${inlineCode("/timed-role edit")} Edit a role that already is being monitored.
            ${inlineCode("/timed-role remove")} Remove a role from the monitored roles.
            ${inlineCode("/timed-role reset-timer")} Resets the current timeout of a role.
            ${inlineCode("/check")} Get a list of all roles that could be monitored by the bit. 
            ${inlineCode("/roles")} Get information of all roles currently being monitored.

            ${underscore("Help")}
            ${inlineCode("/setup")} Show the the setup guide.
            ${inlineCode("/help")} Show the default help page.
            ${inlineCode("/help 1")} Show help page 1 (default).
            ${inlineCode("/help permscheck")} Checks if the bot has all required permissions to function.

            ${inlineCode("/bug-report")} Submit a bug report.
            `)
            .setFooter({text: "For other help pages than default use the optional page on the help command"});
        }

        if (page === "setup") {
            //permsCheck
            permsCheckEmbed = await permsCheck(guildObject);

            //setup embed
            embed = new EmbedBuilder()
            .setTitle("Ping TimeOut | Setup")
            .setDescription(`
            **Important**: You need to have the __Administrator__ permission for most of the commands. (Administrators can change slash command permissions under the intergration settings)
            
            **1** - Look at the bottom of this message if the bot has all required permissions.
            **2** - Use ${inlineCode("/check")} to check for roles that can be monitored by this bot.
            **3** - Use ${inlineCode("/timed-role add")} to add a role to be monitored.
            
            **4** - You can check if the bot work by following these steps
            **4a** - Ping the role you added to be monitored. Then check with an account that doesn't have the mentione everyone permsissions if the role disappears and reappears after the set time.
            **4b** - Ping the role you added to be monitored. Then check in ${inlineCode("Server Settings -> Audit Log")} if the role got updated by the bot to unmentionable.

            **5** - Use ${inlineCode("/roles")} to see the role you added!
            `)
            .setFooter({text: "Use /help for more information"});
        }

        if (page === "permscheck") {
            embed = await permsCheck(guildObject);
        }

        if (!embed) {
            interaction.reply({embeds: [deniedMessage("There was an error executing this command")], ephemeral: true})
        } else {
            if (permsCheckEmbed) {
                interaction.reply({embeds: [embed, permsCheckEmbed]});
            } else {
                interaction.reply({embeds: [embed]});
            }
        }
        

    }
}