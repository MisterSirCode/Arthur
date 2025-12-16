const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
let XMLHttpRequest = require('xhr2');

let crow = [
    "<:crow1:1449855729904128111>",
    "<:crow2:1449855728843100210>",
    "<:crow3:1449855728016687146>",
    "<:crow4:1449855727064846380>",
    "<:crow5:1449855726255083703>",
    "<:crow6:1449855724971757749>",
]

let crow_color = [
    "58627B",
    "C29E45",
    "4E70BB",
    "C64F4F",
    "4B3A5B",
    "94B1C9"
]

const levDist = (s, t) => {
    if (!s.length) return t.length;
    if (!t.length) return s.length;
    const arr = [];
    for (let i = 0; i <= t.length; i++) {
        arr[i] = [i];
        for (let j = 1; j <= s.length; j++) {
            arr[i][j] = i === 0 ? j : Math.min(
                arr[i - 1][j] + 1,
                arr[i][j - 1] + 1,
                arr[i - 1][j - 1] + (s[j - 1] === t[i - 1] ? 0 : 1)
            );
        }
    }
    return arr[t.length][s.length];
};  

function sum(list) {
    let sum = 0;
    Object.keys(list).forEach(key => {
        sum += list[key];
    });
    return sum;
}

function time(t) {
    let res = "";
    let years = Math.floor(t / 31536000);
    let months = Math.floor(t / 2592000);
    let weeks = Math.floor(t / 604800);
    let days = Math.floor(t / 86400);
    let hours = Math.floor(t / 3600) % 24;
    let minutes = Math.floor(t / 60) % 60;
    let seconds = t % 60;
    if (years > 1) res += years + " Years ";
    // if (months > 2) return months + " Months";
    // if (weeks > 2) return weeks + " Weeks";
    if (days > 1) res += days + " Days ";
    if (hours > 1) res += hours + " Hours ";
    if (minutes > 1) res += minutes + " Minutes ";
    // return Math.floor(seconds) + " Seconds";
    return res;
}

module.exports = {
    local: true,
	data: new SlashCommandBuilder()
        .setName('player')
        .setDescription(`Grab the available info about a player`)
        .addStringOption((option) => option
            .setName('name')
            .setRequired(true)
            .setDescription('Player you wish to know about')),
        // .addStringOption((option) => option
        //     .setName('token')
        //     .setAutocomplete(false)
        //     .setRequired(false)
        //     .setDescription('Use your api token (/api ingame)')),
	async execute(interaction) {
        let name = interaction.options.getString('name').replace(/[^[\x00-\x7F]+$/g, "");
        if (name.length == 0) {
            interaction.reply('Player not specified');
            return;
        }
        let players = global.arthurdb.get('deepworld.players');
        let arrayToSort = Object.entries(players).map(([key, value]) => ({key, value}));
        let match = {};
        let matchfound = false;
        arrayToSort.forEach((val) => {
            let item = val.value;
            if (val.key.toLowerCase() == name.toLowerCase()) {
                match = item;
                matchfound = true;
            }
        });
        if (match) {
            let stats = match.statistics;
            let kills = sum(match.statistics.kills || {}) || 0;
            let kd = (Math.round(kills / match.deaths * 100) / 100);
            const profileEmbed = new EmbedBuilder()
                .setTitle(match.orders.crow > 0 ? 
                    match.name + " " + crow[match.orders.crow - 1] : match.name)
                .setDescription(
                    match.admin ? "Administrator\n" : "" 
                    + "Level " + match.level + " (Skill Level " + match.skill_level + ")"
                    + "\n" + (match.deaths || 0) + " Deaths - " + kills + " Kills"
                    + "\nK/D Ratio: " + (isNaN(kd) ? 0 : kd))
                .addFields([
                    { inline: true, name: "Explored Areas", value: `${stats.areas_explored || 0}` },
                    { inline: true, name: "Shillings Spent", value: `${stats.shillings_spent_in_scrap_market || 0}`},
                    { inline: true, name: "Dungeon Raids", value: `${stats.dungeons_raided || 0}` },
                    { inline: true, name: "Repaired Teles", value: `${stats.discoveries["mechanical/teleporter"] || 0}` },
                    { inline: true, name: "Items Mined", value: `${match.items_mined || 0}` },
                    { inline: true, name: "Items Crafted", value: `${match.items_crafted || 0}` },
                    { inline: true, name: "Items Placed", value: `${match.items_placed || 0}` },
                    { inline: true, name: "Items Scavenged", value: `${match.items_scavenged || 0}` },
                ])
                .setColor(match.orders.crow > 0 ? 
                    crow_color[match.orders.crow - 1] :
                    match.appearance["h*"])
                .setFooter({ text: `Time Playing: ${time(stats.play_time)}` });
            if ((stats.discoveries["mechanical/teleporter"] || 0) > 0) {
                stats.discoveries["mechanical/teleporter"] = 0;
                profileEmbed.addFields(
                    { inline: true, name: "Machine Parts", value: `${sum(stats.discoveries) || 0}` },
                );
            } else {
                profileEmbed.addFields(
                    { inline: true, name: "Machine Parts", value: `0` },
                );
            }
            interaction.reply({ embeds: [profileEmbed] });
        } else {
            interaction.reply('Player not found');
            return;
        }
	},
};