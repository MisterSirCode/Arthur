const { EmbedBuilder, SlashCommandBuilder, MessageFlags } = require('discord.js');

function topTenString(list, target) {
    let finished = "";
    for (let i = 0; i < 10; i++) {
        let item = list[i];
        finished += item.name + ' - ' + item[target] + '\n';
    }
    return finished;
}

module.exports = {
    local: true,
	data: new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('Get the leaderboard of certain topics')
        .addSubcommand(command => command
            .setName('mining_placing_crafting')
            .setDescription('Get the current stats for Mining, Placing, and Crafting')
        ),
	async execute(interaction) {
        let desc = '';
        switch (interaction.options.getSubcommand()) {
            case 'mining_placing_crafting':
                desc = 'Top ten users in each category in mining, crafting, and building'
                break;
            case '':
                break;
            default:
        }
        let players = global.arthurdb.get('deepworld.players');
        let arrayToSort = Object.entries(players).map(([key, value]) => ({key, value}));
        let removedAdmins = [];
        arrayToSort.forEach((val) => {
            let item = val.value;
            if (!item.admin) removedAdmins.push(item);
        });
        let mining_data = removedAdmins.toSorted((a, b) => (a.items_mined > b.items_mined) ? -1 : 1);
        let crafting_data = removedAdmins.toSorted((a, b) => (a.items_crafted > b.items_crafted) ? -1 : 1);
        let building_data = removedAdmins.toSorted((a, b) => (a.items_placed > b.items_placed) ? -1 : 1);
        let scaving_data = removedAdmins.toSorted((a, b) => (a.items_scavenged > b.items_scavenged) ? -1 : 1);
        const leaderboard = new EmbedBuilder()
            .setTitle(`Leaderboard`)
            .setDescription(desc)
			.setColor(global.color);
        leaderboard.addFields(
            { name: 'Blocks Mined', value: topTenString(mining_data, "items_mined"), inline: true, },
            { name: 'Items Crafted', value: topTenString(crafting_data, "items_crafted"), inline: true, },
            { name: 'Blocks Placed', value: topTenString(building_data, "items_placed"), inline: true, },
            { name: 'Items Scavenged', value: topTenString(scaving_data, "items_scavenged"), inline: true, },
        )
		await interaction.reply({ embeds: [leaderboard] });
	},
};