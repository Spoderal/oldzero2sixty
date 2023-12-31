const Discord = require("discord.js");
const ms = require("ms");

const { SlashCommandBuilder } = require("@discordjs/builders");
const User = require("../schema/profile-schema");
const Cooldowns = require("../schema/cooldowns");
const colors = require("../common/colors");
const { toCurrency, formatDate } = require("../common/utils");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("daily")
    .setDescription("Collect your daily cash"),
  async execute(interaction) {
    let uid = interaction.user.id;
    let dcash = 250;
    let userdata = (await User.findOne({ id: uid })) || new User({ id: uid });
    let cooldowndata =
      (await Cooldowns.findOne({ id: interaction.user.id })) ||
      new Cooldowns({ id: uid });

    let daily = cooldowndata.daily;
    let patreon = userdata.patron;
    let lastDaily = cooldowndata.lastDaily;
    let streak = userdata.settings.dailyStreak || 0;

    let lastDailyTime = new Date(lastDaily);

    let timestamp = lastDailyTime.getTime();
    let now = new Date(Date.now()).getTime();

    console.log(now);

    let delta = now - timestamp;

    console.log(delta);

    let time = 172800000;
    if (delta > time) {
      userdata.settings.dailyStreak = 1;
    } else {
      userdata.settings.dailyStreak += 1;
    }

    userdata.markModified("settings");

    if (interaction.guild.id == "931004190149460048") {
      dcash += 500;
    }
    let Global = require("../schema/global-schema");
    let global = await Global.findOne();
    if (global.zeroplus.includes(interaction.guild.id)) {
      dcash = dcash * 1.5;
    }
    let timeout = 86400000;
    let prestige = userdata.prestige;
    if (prestige) {
      let mult = prestige * 0.05;

      let multy = mult * dcash;

      dcash = dcash += multy;
    }
    if (daily !== null && timeout - (Date.now() - daily) > 0) {
      let time = ms(timeout - (Date.now() - daily));
      let timeEmbed = new Discord.EmbedBuilder()
        .setColor(colors.blue)
        .setDescription(
          `You've already collected your daily cash\n\nCollect it again in ${time}.`
        );
      await interaction.reply({ embeds: [timeEmbed], fetchReply: true });
    } else {
      let house = userdata.house;
      if (house && house.perks.includes("Daily $300")) {
        dcash += 300;
      }
      if (house && house.perks.includes("Daily $500")) {
        dcash += 500;
      }
      if (house && house.perks.includes("Daily $1000")) {
        dcash += 1000;
      }
      if (house && house.perks.includes("Daily $1500")) {
        dcash += 1500;
      }
      if (patreon && patreon.tier == 1) {
        dcash *= 2;
      }
      if (patreon && patreon.tier == 2) {
        dcash *= 3;
      }
      if (patreon && patreon.tier == 3) {
        dcash *= 5;
      }
      if (patreon && patreon.tier == 4) {
        dcash *= 5;
      }
      let filteredhouse = userdata.houses.filter(
        (house) => house.Name == "Albergo Delle Meraviglie"
      );
      let filteredhouse2 = userdata.houses.filter(
        (house) => house.Name == "Cabina Accogliente"
      );
      if (userdata.houses && filteredhouse[0]) {
        userdata.swheelspins += 1;
        interaction.channel.send("+1 Super Wheelspin");
      }
      if (userdata.houses && filteredhouse2[0]) {
        userdata.lmaps += 1;
        interaction.channel.send("+1 Legendary Barn Map");
      }
      let dailystre = streak;
      if (streak > 1) {
        dcash = dcash * (dailystre -= 0.5);
      }
      let using = userdata.using;

      if (using.includes("oil")) {
        let cooldown = cooldowndata.oil;
        let timeout = 604800000;
        console.log(timeout - (Date.now() - cooldown));
        if (cooldown !== null && timeout - (Date.now() - cooldown) < 0) {
          console.log("pulled");
          userdata.using.pull("oil");

          userdata.update();
          interaction.channel.send("Your oil ran out! :(");
        }
      }
      userdata.cash += dcash;
      cooldowndata.daily = Date.now();
      cooldowndata.lastDaily = Date.now();
      userdata.save();
      cooldowndata.save();

      let embed = new Discord.EmbedBuilder()
        .setTitle(`Daily Cash ${interaction.user.username}`)
        .addFields([{ name: "Earned Cash", value: `${toCurrency(dcash)}` }]);
      if (streak > 1) {
        embed.addFields([{ name: "Streak", value: `${(streak += 1)}` }]);
      }
      embed.setColor(colors.blue);

      await interaction.reply({ embeds: [embed] });
      console.log(userdata.settings.dailyStreak);
    }
  },
};
