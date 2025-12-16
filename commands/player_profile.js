const { EmbedBuilder, SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
    local: false,
	data: new SlashCommandBuilder()
		.setName('player_profile')
		.setDescription('Configure your deepworld profile (Must be registered to your discord account!)')
        .addStringOption((option) => option
            .setName('set_color')
            .setRequired(true)),
	async execute(interaction) {
        let players = global.arthurdb.get('deepworld.players');
        let arrayToSort = Object.entries(players).map(([key, value]) => ({key, value}));
        
		await interaction.reply({ embeds: [helpEmbed], flags: MessageFlags.Ephemeral });
	},
};