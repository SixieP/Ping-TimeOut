const { EmbedBuilder, inlineCode, Embed} = require('discord.js');
module.exports = {
    name: "ping",
    description: 'Pong!',
    defaultMemberPermissions: null,
    // devOnly: Boolean,
    // inactive: Boolean,
    testCommand: Boolean,

    callback: (client, interaction) => {
        const firstEmbed = new EmbedBuilder()
        .setDescription(inlineCode('Pinging...'))

        const timeOne = Date.now();
        interaction.reply({ embeds: [firstEmbed], ephemeral: true}).then (async (int) =>{
            const timeTwo = Date.now();
            const secondEmbed = new EmbedBuilder()
            .setDescription(`Ping: ` + inlineCode(`${timeTwo - timeOne}ms`))
            .setTimestamp()

            interaction.editReply({ embeds: [secondEmbed]});
        })



    }
}
