
const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ChannelType
} = require("discord.js");

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

if (!TOKEN || !CLIENT_ID) {
  throw new Error("Missing DISCORD_BOT_TOKEN or CLIENT_ID in environment variables.");
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const GOLD = 0xD4AF37;

const commands = [
  new SlashCommandBuilder()
    .setName("create-message")
    .setDescription("📢 Create and send an AVL announcement")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(o => o.setName("channel").setDescription("📍 Destination channel").addChannelTypes(ChannelType.GuildText).setRequired(true))
    .addStringOption(o => o.setName("message").setDescription("📝 Announcement message").setRequired(true))
    .addStringOption(o => o.setName("ping").setDescription("🔔 Ping: none, everyone, here").setRequired(true)
      .addChoices(
        { name: "🔕 None", value: "none" },
        { name: "📣 @everyone", value: "everyone" },
        { name: "🔔 @here", value: "here" }
      )),

  new SlashCommandBuilder()
    .setName("fixtures").setDescription("📅 Publish AVL fixtures")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(o => o.setName("gameweek").setDescription("Gameweek").setRequired(true))
    .addStringOption(o => o.setName("round").setDescription("Round").setRequired(true))
    .addStringOption(o => o.setName("match").setDescription("Match").setRequired(true))
    .addStringOption(o => o.setName("day").setDescription("Day").setRequired(true)),

  new SlashCommandBuilder()
    .setName("result").setDescription("🏁 Publish a match result")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(o => o.setName("match").setDescription("Match").setRequired(true))
    .addStringOption(o => o.setName("results").setDescription("Final score").setRequired(true)),

  new SlashCommandBuilder()
    .setName("match").setDescription("🏟️ Publish match details")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(o => o.setName("match").setDescription("Match").setRequired(true))
    .addStringOption(o => o.setName("day").setDescription("Day").setRequired(true))
    .addStringOption(o => o.setName("time").setDescription("Time").setRequired(true))
    .addStringOption(o => o.setName("stadium").setDescription("Stadium").setRequired(true))
    .addStringOption(o => o.setName("referee").setDescription("Referee").setRequired(true)),

  new SlashCommandBuilder()
    .setName("team").setDescription("🛡️ Publish team information")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(o => o.setName("team").setDescription("Team name").setRequired(true))
    .addStringOption(o => o.setName("president").setDescription("President").setRequired(true)),

  new SlashCommandBuilder()
    .setName("player").setDescription("👤 Publish player information")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(o => o.setName("team").setDescription("Team").setRequired(true))
    .addStringOption(o => o.setName("player").setDescription("Player").setRequired(true)),

  new SlashCommandBuilder()
    .setName("contract").setDescription("✍️ Announce a player transfer")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(o => o.setName("ancient-team").setDescription("Previous team").setRequired(true))
    .addStringOption(o => o.setName("new-team").setDescription("New team").setRequired(true))
    .addStringOption(o => o.setName("player").setDescription("Player").setRequired(true)),

  new SlashCommandBuilder()
    .setName("team-info").setDescription("📊 Publish full team statistics")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(o => o.setName("team").setDescription("Team").setRequired(true))
    .addStringOption(o => o.setName("president").setDescription("President").setRequired(true))
    .addStringOption(o => o.setName("division").setDescription("Division").setRequired(true))
    .addStringOption(o => o.setName("goals").setDescription("Goals").setRequired(true))
    .addStringOption(o => o.setName("classement").setDescription("League position").setRequired(true)),

  new SlashCommandBuilder()
    .setName("player-info").setDescription("⚽ Publish player statistics")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(o => o.setName("team").setDescription("Team").setRequired(true))
    .addStringOption(o => o.setName("goals").setDescription("Goals scored").setRequired(true))
].map(c => c.toJSON());

const templates = {
  "create-message": {
    title: "📢 AVL | OFFICIAL ANNOUNCEMENT",
    fields: ["channel", "message", "ping"]
  },
  fixtures: {
    title: "📅 AVL | FIXTURES",
    fields: ["gameweek", "round", "match", "day"]
  },
  result: {
    title: "🏁 AVL | MATCH RESULT",
    fields: ["match", "results"]
  },
  match: {
    title: "🏟️ AVL | MATCH INFORMATION",
    fields: ["match", "day", "time", "stadium", "referee"]
  },
  team: {
    title: "🛡️ AVL | TEAM ANNOUNCEMENT",
    fields: ["team", "president"]
  },
  player: {
    title: "👤 AVL | PLAYER ANNOUNCEMENT",
    fields: ["team", "player"]
  },
  contract: {
    title: "✍️ AVL | OFFICIAL SIGNING",
    fields: ["ancient-team", "new-team", "player"]
  },
  "team-info": {
    title: "📊 AVL | TEAM STATISTICS",
    fields: ["team", "president", "division", "goals", "classement"]
  },
  "player-info": {
    title: "⚽ AVL | PLAYER STATISTICS",
    fields: ["team", "goals"]
  }
};

const labels = {
  gameweek: "📆 Gameweek",
  round: "🔢 Round",
  match: "⚔️ Match",
  day: "📅 Day",
  results: "🏆 Results",
  time: "🕒 Time",
  stadium: "🏟️ Stadium",
  referee: "🧑‍⚖️ Referee",
  team: "🛡️ Team",
  president: "👑 President",
  player: "👤 Player",
  "ancient-team": "📤 Previous Team",
  "new-team": "📥 New Team",
  division: "🏅 Division",
  goals: "⚽ Goals",
  classement: "📊 Classement",
  message: "📝 Message"
};

function makeEmbed(title, fields) {
  const embed = new EmbedBuilder()
    .setColor(GOLD)
    .setTitle(title)
    .setDescription("━━━━━━━━━━━━━━━━━━━━")
    .addFields(fields)
    .setFooter({ text: "AVL • Arabic Virtual League 🏆" })
    .setTimestamp();

  return embed;
}

client.once("ready", async () => {
  console.log(`🏆 AVL Manager Bot V1 online as ${client.user.tag}`);

  try {
    const rest = new REST({ version: "10" }).setToken(TOKEN);
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );
    console.log("✅ All 9 AVL commands registered.");
  } catch (error) {
    console.error("❌ Command registration failed:", error.message);
  }
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (!interaction.inGuild() ||
      !interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({
      content: "⛔ Only server administrators can use AVL Manager commands.",
      ephemeral: true
    });
  }

  const template = templates[interaction.commandName];
  if (!template) return;

  try {
    const values = {};
    for (const key of template.fields) {
      if (key === "channel") continue;
      values[key] = interaction.options.getString(key);
    }

    if (interaction.commandName === "create-message") {
      const channel = interaction.options.getChannel("channel");
      const ping = interaction.options.getString("ping");
      const content = ping === "everyone" ? "@everyone"
        : ping === "here" ? "@here" : "";

      const embed = makeEmbed(template.title, [
        { name: "📣 Announcement", value: values.message.slice(0, 1024) }
      ]);

      await interaction.reply({
        content: "✅ Announcement published.",
        ephemeral: true
      });

      return channel.send({
        content,
        embeds: [embed],
        allowedMentions: {
          parse: ping === "none" ? [] : [ping]
        }
      });
    }

    const fields = template.fields.map(key => ({
      name: labels[key] || key,
      value: String(values[key] || "N/A").slice(0, 1024),
      inline: true
    }));

    const embed = makeEmbed(template.title, fields);

    await interaction.reply({
      content: "✅ AVL record published successfully!",
      ephemeral: true
    });

    await interaction.channel.send({ embeds: [embed] });
  } catch (error) {
    console.error("Command error:", error);
    if (interaction.replied || interaction.deferred) {
      // The command may already have published its result.
      return;
    }
    await interaction.reply({
      content: "❌ Something went wrong. Check the bot console.",
      ephemeral: true
    });
  }
});

client.login(TOKEN);
    
