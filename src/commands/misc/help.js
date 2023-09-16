const { EmbedBuilder, inlineCode, PermissionFlagsBits, bold, underscore, ApplicationCommandOptionType, italic } = require('discord.js');
const { deniedMessage } = require('../../utils/baseUtils/defaultEmbeds');
module.exports = {
    name: "help",
    description: 'Use this command if you need help with the bot',
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
                }
            ]
        }
    ],
    // devOnly: Boolean,
    // inactive: Boolean,
    // testCommand: Boolean,

    callback: (client, interaction) => {
        const page = interaction.options.get('page')?.value;

        var embed;
        if (!page || page === "page-1") {
            embed = new EmbedBuilder()
            .setTitle("Ping TimeOut | Help")
            .setDescription(`
            ${bold("All commands")}

            ${underscore("Main")}
            ${inlineCode("/timed-role add")} Add a timeout to a role that doesn't have one already.
            ${inlineCode("/timed-role edit")} Edit the timeout duration of a role that already has one.
            ${inlineCode("/timed-role remove")} Remove a timeout from a role that has one.

            ${underscore("Misc")}
            ${inlineCode("/check")} Gives a list of all the roles that you can add a timeout to. It also shows what roles already have a timeout enabled.
            ${inlineCode("/roles")} Gives info aboud all timed roles.
            ${inlineCode("/ping")} Gives the bots ping. You can also use this to check if the bot is still working when other commands don't work correctly.

            ${underscore("Help")}
            ${inlineCode("/setup")} Gives the setup guide.
            ${inlineCode("/help")} Gives the default help page.
            ${inlineCode("/help 1")} Gives help page 1 (default).

            *For other help pages than default use the optional page on the help command*
            `)
        }

        if (page === "setup") {
            embed = new EmbedBuilder()
            .setTitle("Ping TimeOut | Setup")
            .setDescription(`
            **Important**: You need to have the __Administrator__ permission for most of the commands. (Administrators can change slash command permissions under the intergration settings)
            
            **1** - Use ${inlineCode("/check")} to check for all roles that you can add a timeout to. 
            **2** - Use ${inlineCode("/timed-role add")} to add a timeout to a role.
            
            **3** - You can check if the bot work by following one of these steps
            **3a** - Use a account that doesn't have the permission to ping @everyone and ping the role. Then check if they can ping the role directly again.
            **3b** - Check in ${inlineCode("Server Settings -> Audit Log")} if the bot updated the role to Mentionable.

            **4** - Use ${inlineCode("/roles")} to see the role you added!
            `)
        }

        if (!embed) {
            interaction.reply({embeds: [deniedMessage("There was an error executing this command")], ephemeral: true})
        } else {
            interaction.reply({embeds: [embed]});
        }
        

    }
}
