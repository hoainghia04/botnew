import { config } from "dotenv";
import { request } from "./request.mjs";
import cheerio from "cheerio";
import wait from "./wait.mjs";
import {
	REST,
	Routes,
	ApplicationCommandOptionType,
	Client,
	EmbedBuilder,
	GatewayIntentBits,
} from "discord.js";

config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const rest = new REST({ version: "10" }).setToken(TOKEN);

client.on("ready", () => {
	console.log('Bot Online!');
});

async function bypass(userhwid) {
	const start_url =
		"https://fluxteam.net/android/checkpoint/start.php?HWID=" + userhwid;
	const commonheader = {
		Referer: "https://linkvertise.com/",
		"User-Agent":
			"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36",
	};
	await request(start_url, {
		Referer: "https://fluxteam.net/",
	});
	await request(
		"https://fluxteam.net/android/checkpoint/check1.php",
		commonheader
	);
	const response = await request(
		"https://fluxteam.net/android/checkpoint/main.php",
		commonheader
	);
	const parsed = cheerio.load(response["data"]);
	const key = parsed("body > main > code").text();

	return key;
}

function extractHWIDFromURL(url) {
	const regex = /HWID=([\w\d]+)/;
	const match = url.match(regex);
	return match ? match[1] : null;
}

client.on("interactionCreate", async (interaction) => {
// 	const allowedChannelId = '1174298298778132490';
// 		if (!interaction.guild) {
// 			await interaction.reply("Chỉ được sử dụng lệnh trong server. [Click vào đây để được vào server!](https://discord.gg/hngaming)");
// 			return;
// 			}
//         if (interaction.channelId !== allowedChannelId) {
//     const allowedChannel = interaction.guild.channels.cache.get(allowedChannelId);
//     const channelLink = allowedChannel ? `<#${allowedChannel.id}>` : `channel ${allowedChannelId}`;
//     const replyMessage = await interaction.reply(`Chỉ được dùng lệnh trong ${channelLink}.`);

//     setTimeout(async () => {
//       await replyMessage.delete();
//     }, 3000); 
//     return;
//   }

	if (!interaction.isChatInputCommand()) return;

	if (interaction.commandName === "ikey") {
		const link = interaction.options.get("link").value;

		await interaction.deferReply();

		try {
			const userhwid = extractHWIDFromURL(link);
			const key = await bypass(userhwid);
			const keyWithoutSpaces = key.replace(/\s+/g, "");
			const embed = new EmbedBuilder()
				.setColor('#ffffff')
				.setTitle("*Copy Key Fluxus*")
				.setDescription("```" + keyWithoutSpaces + "```")
				.setThumbnail('https://cdn.discordapp.com/attachments/1174616840614457394/1189486919655116801/Lumii_20231227_163542469.jpg?ex=659e5705&is=658be205&hm=44614244dbb0a7b3f2c043efb0bcfced4bf3239dcedfd472e7d6cf799a191ac5&')
				.addFields(
				  {
					name: "**Create By Inaki ❤**",
					value: "**Subscribe My Channel.**\n [Click this is to go to youtube iNarki](https://www.youtube.com/channel/UC4FEU-bdsIZAJI7xOpUIxbw)",
				  },
				);

		await interaction.editReply({ embeds: [embed] });
		} catch (error) {
			const errorMessage = await interaction.editReply(
				"Vui lòng thử lại."
			);
			setTimeout(async () => {
				await errorMessage.delete();
			}, 3000);
		}
	}
});

async function main() {
	const commands = [
		{
			name: "ikey",
			description: "Enter your link",
			options: [
				{
					name: "link",
					description: "enter your link",
					type: ApplicationCommandOptionType.String,
					required: true,
				},
			],
		}
	];

	try {
		console.log("Successfully added application (/) commands.");
		await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
		client.login(TOKEN);
	} catch (error) {
		console.log(error);
	}
}

main();
