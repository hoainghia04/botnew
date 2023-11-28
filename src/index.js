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

import config from './config.json' assert { type: "json" };


const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const TOKEN = config.BOT_TOKEN;
const CLIENT_ID = config.CLIENT_ID;
const roleid = ["1129782219750256680", "1110776745092718655"];
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
  await request(
    "https://fluxteam.net/android/checkpoint/check2.php",
    commonheader
  );
  await request(
    "https://fluxteam.net/android/checkpoint/check3.php",
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
const commandCooldowns = new Map();
function extractHWIDFromURL(url) {
  const regex = /HWID=([\w\d]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "key") {
    const link = interaction.options.get("link").value;

    await interaction.deferReply();

    try {
      const userhwid = extractHWIDFromURL(link);
      const isAdmin =
      roleid.some((roleId) =>
        interaction.member.roles.cache.has(roleId)
      ) ||
      interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR);

    if (!isAdmin && commandCooldowns.has(interaction.user.id)) {
      const lastuse = commandCooldowns.get(interaction.user.id);
      const currenttime = Date.now();
      const cooldown = 60 * 60 * 1000;

      if (currenttime - lastuse < cooldown) {
        const remainingTime = cooldown - (currenttime - lastuse);
        const remainingMinutes = Math.ceil(remainingTime / (60 * 1000));
        await interaction.editReply(
          `Hãy đợi ${remainingMinutes} phút sau để thử lại.`
        );
        return;
      }
    }
      const key = await bypass(userhwid);
      const keyWithoutSpaces = key.replace(/\s+/g, "");
      const embed = new EmbedBuilder()
        .setColor('#ffffff')
        .setTitle("*Copy Key Fluxus*")
        .setDescription("```" + keyWithoutSpaces + "```")
        .addFields(
          {
            name: "**Create By HN Gaming ❤**",
            value: "**Subscribe My Channel.**\n [HN Gaming](https://www.youtube.com/channel/UCVzNxeEWfSbnf_IK3YMhW3w)",
          },
        );

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      const errorMessage = await interaction.editReply(
        "An error occurred while generating your key."
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
      name: "key",
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