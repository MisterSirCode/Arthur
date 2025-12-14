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
                desc = 'Leaderboards for mining, crafting, and building'
                break;
            case '':
                break;
            default:
        }
        let players = global.arthurdb.get('deepworld.players');
        let arrayToSort = Object.entries(players).map(([key, value]) => ({key, value}));
        let mining_data = arrayToSort.toSorted((a, b) => {
            if (a.admin & !b.admin) 1;
            if (b.admin & !a.admin) -1;
            if (a.items_mined > b.items_mined) -1;
            else if (a.items_mined < b.items_mined) 1;
            else 0;
        });
        let crafting_data = arrayToSort.toSorted((a, b) => {
            if (a.admin & !b.admin) 1;
            if (b.admin & !a.admin) -1;
            if (a.items_crafted > b.items_crafted) -1;
            else if (a.items_crafted < b.items_crafted) 1;
            else 0;
        });
        let building_data = arrayToSort.toSorted((a, b) => {
            if (a.admin & !b.admin) 1;
            if (b.admin & !a.admin) -1;
            if (a.items_placed > b.items_placed) -1;
            else if (a.items_placed < b.items_placed) 1;
            else 0;
        });
        console.log(mining_data);
        const leaderboard = new EmbedBuilder()
            .setTitle(`Leaderboard`)
            .setDescription(desc)
			.setColor(global.color);
        leaderboard.addFields(
            { name: 'Blocks Mined', value: topTenString(mining_data), inline: true, },
            { name: 'Items Crafted', value: topTenString(crafting_data), inline: true, },
            { name: 'Blocks Placed', value: topTenString(building_data), inline: true, },
        )
		await interaction.reply({ embeds: [leaderboard], flags: MessageFlags.Ephemeral });
	},
};