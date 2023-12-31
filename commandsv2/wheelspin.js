const Discord = require("discord.js");
const carsdb = require("../data/cardb.json");
const { SlashCommandBuilder } = require("@discordjs/builders");
const lodash = require("lodash");
const wheelspinrewards = require("../data/wheelspinrewards.json");
const partsdb = require("../data/partsdb.json");
const User = require("../schema/profile-schema");
const Cooldowns = require("../schema/cooldowns");
const colors = require("../common/colors");
const { numberWithCommas, toCurrency } = require("../common/utils");
const { GET_STARTED_MESSAGE } = require("../common/constants");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("wheelspin")
    .setDescription("Spin the wheel for prizes!"),
  async execute(interaction) {
    let uid = interaction.user.id;
    let userdata = await User.findOne({ id: uid });
    if (!userdata?.id) return await interaction.reply(GET_STARTED_MESSAGE);

    let cooldowns =
      (await Cooldowns.findOne({ id: uid })) || new Cooldowns({ id: uid });

    let wheelspincool = cooldowns.wheelspin;
    let timeout = 5000;

    if (wheelspincool !== null && timeout - (Date.now() - wheelspincool) > 0)
      return await interaction.reply(
        "Please wait 5 seconds before using this command again."
      );
    let wheelspins = userdata.wheelspins || 0;
    if (wheelspins <= 0) return interaction.reply("You're out of wheel spins!");
    let items = ["🏎️", "💵", "⚙️", "🗺️", "🛞"];
    let item = lodash.sample(items);
    let using = userdata.using;

    if (using.includes("orange juice")) {
      let cooldown = cooldowns.applejuice;
      let timeout = 60000;
      console.log(timeout - (Date.now() - cooldown));
      if (cooldown !== null && timeout - (Date.now() - cooldown) < 0) {
        console.log("pulled");
        userdata.using.pull("orange juice");
        userdata.update();
        interaction.channel.send("Your orange juice ran out! :(");
      } else {
        item = "🪛";
      }
    }
    let cash = wheelspinrewards.Cash;
    let maps = wheelspinrewards.Maps;
    let witems = wheelspinrewards.Items;

    let cars = wheelspinrewards.Cars;
    let parts = wheelspinrewards.Parts;
    let tier4 = wheelspinrewards.Tier4;
    let garagespaces = userdata.garageLimit;

    let usercars = userdata.cars;
    userdata.wheelspins -= 1;
    cooldowns.wheelspin = Date.now();
    let embed = new Discord.EmbedBuilder()
      .setTitle("Wheel Spin!")
      .setColor(colors.blue)
      .setImage("https://i.ibb.co/0jm0ZY5/wheelspin.gif");
    let msg = await interaction.reply({ embeds: [embed], fetchReply: true });

    setTimeout(() => {
      let item = lodash.sample(items);
      embed.setDescription(`${item}`);
      interaction.editReply({ embeds: [embed] });
      setTimeout(() => {
        if (item == "⚙️") {
          let reward = lodash.sample(parts);
          userdata.parts.push(reward.toLowerCase());

          embed.setDescription(
            `You won a ${partsdb.Parts[reward].Emote} ${partsdb.Parts[reward].Name}!`
          );
          interaction.editReply({ embeds: [embed] });
        } else if (item == "🪛") {
          let reward = lodash.sample(tier4);
          userdata.parts.push(reward.toLowerCase());

          embed.setDescription(
            `You won a ${partsdb.Parts[reward].Emote} ${partsdb.Parts[reward].Name}!`
          );
          interaction.editReply({ embeds: [embed] });
        } else if (item == "🛞") {
          userdata.swheelspins += 1;
          embed.setDescription(`You won 1 super wheel spin!`);
          interaction.editReply({ embeds: [embed] });
        } else if (item == "🏎️") {
          let randomnum = lodash.random(5);
          let reward;
          if (randomnum == 2) {
            reward = lodash.sample(wheelspinrewards.SuperRare);
          } else {
            reward = lodash.sample(cars);
          }
          let sellprice = carsdb.Cars[reward.toLowerCase()].sellprice;

          let row = new Discord.ActionRowBuilder().addComponents(
            new Discord.ButtonBuilder()
              .setCustomId("keep")
              .setLabel("Keep")
              .setStyle("Success"),
            new Discord.ButtonBuilder()
              .setCustomId("sell")
              .setLabel(`Sell for ${toCurrency(sellprice)}`)
              .setStyle("Danger")
          );
          embed.setDescription(
            `You won a ${carsdb.Cars[reward].Emote} ${carsdb.Cars[reward].Name}!`
          );
          let carname = carsdb.Cars[reward].Name;
          embed.setImage(carsdb.Cars[reward].Image);
          embed.addFields([
            { name: `ID`, value: `${carsdb.Cars[reward.toLowerCase()].alias}` },
          ]);
          interaction.editReply({
            embeds: [embed],
            components: [row],
            fetchReply: true,
          });
          let filter2 = (btnInt) => {
            return interaction.user.id === btnInt.user.id;
          };
          let collector = msg.createMessageComponentCollector({
            filter: filter2,
          });
          let filtered = usercars.filter((car) => car.Name == carname);

          if (filtered[0]) {
            parseInt(sellprice);
            userdata.cash += sellprice;
            interaction.channel.send(
              `You already own this car, so you got $${sellprice} instead.`
            );
            userdata.save();
            return;
          }
          collector.on("collect", async (i) => {
            if (i.customId.includes("keep")) {
              if (usercars.length >= garagespaces) {
                interaction.channel.send("You garage is full!");
                return;
              } else {
                let carindb = carsdb.Cars[reward];

                let ecarobj = {
                  ID: carindb.alias,
                  Name: carindb.Name,
                  Speed: carindb.Speed,
                  Acceleration: carindb["0-60"],
                  Handling: carindb.Handling,
                  Parts: [],
                  Emote: carindb.Emote,
                  Livery: carindb.Image,
                  Range: carindb.Range,
                  MaxRange: carindb.Range,
                  Miles: 0,
                };

                let carobj = {
                  ID: carindb.alias,
                  Name: carindb.Name,
                  Speed: carindb.Speed,
                  Acceleration: carindb["0-60"],
                  Handling: carindb.Handling,
                  Parts: [],
                  Emote: carindb.Emote,
                  Livery: carindb.Image,
                  Miles: 0,
                };

                if (carsdb.Cars[reward.toLowerCase()].Range) {
                  userdata.cars.push(ecarobj);
                } else {
                  userdata.cars.push(carobj);
                }
              }
              userdata.save();
              embed.setTitle("✅");
              await i.update({ embeds: [embed] });
              return;
            } else if (i.customId.includes("sell")) {
              userdata.cash += sellprice;
              userdata.save();
              embed.setTitle("✅");
              await i.update({ embeds: [embed] });
              return;
            }
          });
        } else if (item == "💵") {
          let reward = lodash.sample(cash);
          reward = Number(reward);
          let filteredhouse = userdata.houses.filter(
            (house) => house.Name == "Il Maniero"
          );
          if (userdata.houses && filteredhouse[0]) {
            reward += reward * 0.1;
            console.log(reward);
          }
          userdata.cash += Number(reward);
          embed.setDescription(`You won ${toCurrency(reward)} cash!`);
          interaction.editReply({ embeds: [embed] });
        } else if (item == "🗺️") {
          let reward = lodash.sample(maps);
          switch (reward) {
            case "Common":
              userdata.cmaps += 1;
              break;
            case "Rare":
              userdata.rmaps += 1;
              break;
          }
          embed.setDescription(
            `You won a ${numberWithCommas(reward)} barn map!`
          );
          interaction.editReply({ embeds: [embed] });
        } else if (item == "🏦") {
          let reward = lodash.sample(witems);
          userdata.items.push(reward.toLowerCase());
          embed.setDescription(`You won a ${numberWithCommas(reward)}`);
          interaction.editReply({ embeds: [embed] });
        }

        userdata.save();
      }, 500);
    }, 3000);
  },
};
