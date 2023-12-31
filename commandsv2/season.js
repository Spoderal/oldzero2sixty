const discord = require("discord.js");

const seasons = require("../data/seasons.json");
const { SlashCommandBuilder } = require("@discordjs/builders");
const User = require("../schema/profile-schema");
const colors = require("../common/colors");
const { numberWithCommas } = require("../common/utils");
const { tipFooterSeasonPages } = require("../common/tips");
const { GET_STARTED_MESSAGE } = require("../common/constants");
const { ActionRowBuilder, ButtonBuilder } = require("discord.js");
const partdb = require("../data/partsdb.json");
const cardb = require("../data/cardb.json");
const lodash = require("lodash");
const itemdb = require("../data/items.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("season")
    .setDescription("Check the spring season rewards page")
    .addStringOption((option) =>
      option
        .setName("event")
        .setDescription("View the season type")
        .addChoices(
          { name: "Spring Season", value: "spring" },
          { name: "Colonization Race", value: "space" }
        )
        .setRequired(true)
    ),
  async execute(interaction) {
    let userdata = await User.findOne({ id: interaction.user.id });
    if (!userdata?.id) return await interaction.reply(GET_STARTED_MESSAGE);

    let seasonrewards = seasons.Seasons.Spring.Rewards;
    let eventrewards = seasons.Seasons["Colonization Race"].Rewards;
    let reward = [];
    let embed;
    let page = interaction.options.getString("page");
    let type = interaction.options.getString("event");
    if (type == "spring" || !type) {
      let redeemed = userdata.springrewards || 1;
      for (var i in seasonrewards) {
        let item = seasonrewards[i];
        let requirednot = item.Number * 100;
        reward.push(
          `**${item.Number}** : ${item.Item} **Required : ${numberWithCommas(
            requirednot
          )} Notoriety**`
        );
      }
      let itemrewards1 = reward.slice(0, 10);
      let itemrewards2 = reward.slice(10, 20);
      let itemrewards3 = reward.slice(20, 30);
      let itemrewards4 = reward.slice(30, 40);
      let itemrewards5 = reward.slice(40, 50);
      let itemrewards6 = reward.slice(50, 60);
      let itemrewards7 = reward.slice(60, 70);
      let itemrewards8 = reward.slice(70, 80);
      let itemrewards9 = reward.slice(80, 90);
      let itemrewards10 = reward.slice(90, 100);
      let currentpage = [
        itemrewards1,
        itemrewards2,
        itemrewards3,
        itemrewards4,
        itemrewards5,
        itemrewards6,
        itemrewards7,
        itemrewards8,
        itemrewards9,
        itemrewards10,
      ];
      let row9 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("previous")
          .setEmoji("◀️")
          .setStyle("Secondary"),
        new ButtonBuilder()
          .setCustomId("next")
          .setEmoji("▶️")
          .setStyle("Secondary"),
        new ButtonBuilder()
          .setCustomId("first")
          .setEmoji("⏮️")
          .setStyle("Secondary"),
        new ButtonBuilder()
          .setCustomId("last")
          .setEmoji("⏭️")
          .setStyle("Secondary")
      );

      let seasonxp = userdata.noto6;

      if (!page || page == "1") {
        embed = new discord.EmbedBuilder()
          .setTitle("Spring Season Page 1 of 9")
          .setDescription(`${itemrewards1.join("\n")}`)
          .setColor(colors.blue)
          .setThumbnail("https://i.ibb.co/h9TxV6B/springicon.png")
          .setFooter(tipFooterSeasonPages);
      }
      let row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("claim")
          .setLabel(`Claim Reward ${redeemed}`)
          .setStyle(`Success`)
      );

      let notor = userdata.noto6;
      redeemed = userdata.springrewards || 1;
      let rew = redeemed || 1;
      let item = seasons.Seasons.Spring.Rewards[rew];
      let requirednot = item.Number * 100;
      if (requirednot > notor) {
        row.components[0].setStyle(`Danger`);
      }

      let msg = await interaction.reply({
        embeds: [embed],
        components: [row, row9],
      });

      let filter = (btnInt) => {
        return interaction.user.id === btnInt.user.id;
      };
      let collector = msg.createMessageComponentCollector({
        filter: filter,
      });

      collector.on("collect", async (i) => {
        if (i.customId.includes("claim")) {
          notor = userdata.noto6;
          redeemed = userdata.springrewards || 1;
          rew = redeemed || 1;
          item = seasons.Seasons.Spring.Rewards[rew];
          requirednot = item.Number * 100;
          if (requirednot > notor) {
            return i.update({
              content: `You need ${requirednot} notoriety!`,
            });
          }
          if (item.Item.endsWith("Cash")) {
            let amount = Number(item.Item.split(" ")[0]);
            userdata.cash += amount;
            userdata.springrewards += 1;
          } else if (item.Item.endsWith("Rare Keys")) {
            let amount = Number(item.Item.split(" ")[0]);
            console.log(amount);
            userdata.rkeys += amount;
            userdata.springrewards += 1;
          } else if (item.Item.endsWith("RP")) {
            let amount = Number(item.Item.split(" ")[0]);
            userdata.rp += amount;
            userdata.springrewards += 1;
          } else if (item.Item.endsWith("Exotic Keys")) {
            let amount = Number(item.Item.split(" ")[0]);
            userdata.ekeys += amount;
            userdata.springrewards += 1;
          } else if (item.Item.endsWith("Common Keys")) {
            let amount = Number(item.Item.split(" ")[0]);
            userdata.ckeys += amount;
            userdata.springrewards += 1;
          } else if (item.Item.endsWith("Drift Keys")) {
            let amount = Number(item.Item.split(" ")[0]);
            userdata.dkeys += amount;
            userdata.springrewards += 1;
          } else if (
            item.Item.endsWith("Barn Map") ||
            item.Item.endsWith("Barn Maps")
          ) {
            let amount = Number(item.Item.split(" ")[0]);
            userdata.cmaps += amount;
            userdata.springrewards += 1;
          } else if (item.Item.endsWith("Helmet")) {
            let helm = item.Item.toLowerCase();
            userdata.pfps.push(helm);
            userdata.springrewards += 1;
          } else if (
            item.Item.endsWith("Legendary Barn Map") ||
            item.Item.endsWith("Legendary Barn Maps")
          ) {
            let amount = Number(item.Item.split(" ")[0]);
            userdata.lmaps += amount;
          } else if (item.Item.endsWith("Garage Spaces")) {
            console.log("garage");
            let amount = Number(item.Item.split(" ")[0]);
            console.log(amount);
            parseInt(amount);
            userdata.garageLimit += amount;
            await User.findOneAndUpdate(
              {
                id: interaction.user.id,
              },
              {
                $set: {
                  springrewards: (userdata.springrewards += 1),
                },
              }
            );
            userdata.update();
          } else if (
            item.Item.endsWith("Bank Increase") ||
            item.Item.endsWith("Bank Increases")
          ) {
            let amount = item.Item.split(" ")[0];
            let user1newpart = [];
            for (var b = 0; i < amount; b++) user1newpart.push("bank increase");
            for (i in user1newpart) {
              userdata.parts.push("bank increase");
            }
            userdata.springrewards += 1;
          } else if (
            item.Item.endsWith("Big Bank Increase") ||
            item.Item.endsWith("Big Bank Increases")
          ) {
            let amount = item.Item.split(" ")[0];
            let user1newpart = [];
            for (var c = 0; i < amount; c++)
              user1newpart.push("big bank increase");
            for (i in user1newpart) {
              userdata.parts.push("big bank increase");
            }
            userdata.springrewards += 1;
          } else if (partdb.Parts[item.Item.toLowerCase()]) {
            console.log("part");
            userdata.parts.push(item.Item.toLowerCase());
            userdata.springrewards += 1;
          } else if (cardb.Cars[item.Item.toLowerCase()]) {
            let carindb = cardb.Cars[item.Item.toLowerCase()];
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
            userdata.cars.push(carobj);
            userdata.springrewards += 1;
          } else if (
            item.Item == "S1 Spring Badge" ||
            item.Item == "s1 spring badge"
          ) {
            userdata.achievements.push({
              name: "S1 Spring Badge",
              id: "s1 spring badge",
            });
          }
          userdata.noto6 -= requirednot;
          userdata.save();
          console.log(item);
          redeemed = userdata.spaceredeemed;
          row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId("claim")
              .setLabel(`Claim Reward ${redeemed}`)
              .setStyle(`Secondary`)
          );

          i.update({ embeds: [embed], components: [row, row9] });
        } else {
          let current = page;
          if (i.customId.includes("previous") && page !== 1) {
            embed.data.fields = null;

            page--;
          } else if (
            i.customId.includes("next") &&
            page !== currentpage.length
          ) {
            embed.data.fields = null;

            page++;
          } else if (i.customId.includes("first")) {
            embed.data.fields = null;

            page = 1;
          } else if (i.customId.includes("last")) {
            embed.data.fields = null;

            page = 9;
          }
          embed.setTitle(`Spring Season Page ${page} of 10`);
          embed.setDescription(`${currentpage[page].join("\n")}`);

          if (current !== page) {
            embed.setFooter({ text: `Pages ${page}/${currentpage.length}` });
            i.update({ embeds: [embed], fetchReply: true });
          } else {
            return i.update({ content: "No pages left!" });
          }
        }
      });
      if (userdata.tutorial && userdata.tutorial.stage == 1) {
        console.log("tutorial");
        interaction.channel.send({
          content: `You can buy a car with /buy [car id], or the full name, the car id is listed next to \`ID:\`, an example would be /buy \`2002 mustang\``,
        });
      }
    } else if (type == "space") {
      let redeemed = userdata.spaceredeemed || 1;
      for (var d in eventrewards) {
        let item = eventrewards[d];
        let requirednot = item.Number * 5;
        reward.push(
          `**${item.Number}** : ${item.Item} **Required : ${numberWithCommas(
            requirednot
          )} Tokens**`
        );
      }
      let itemrewards1 = reward.slice(0, 10);
      let itemrewards2 = reward.slice(10, 20);
      let itemrewards3 = reward.slice(20, 25);
      let currentpage = [itemrewards1, itemrewards2, itemrewards3];
      let row9 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("previous")
          .setEmoji("◀️")
          .setStyle("Secondary"),
        new ButtonBuilder()
          .setCustomId("next")
          .setEmoji("▶️")
          .setStyle("Secondary"),
        new ButtonBuilder()
          .setCustomId("first")
          .setEmoji("⏮️")
          .setStyle("Secondary"),
        new ButtonBuilder()
          .setCustomId("last")
          .setEmoji("⏭️")
          .setStyle("Secondary")
      );

      let seasonxp = userdata.spacetokens;

      if (!page || page == "1") {
        embed = new discord.EmbedBuilder()
          .setTitle("Colonization Race Page 1 of 3")
          .setDescription(`${itemrewards1.join("\n")}`)
          .setColor(colors.blue)
          .setThumbnail("https://i.ibb.co/bHk3x2n/moonevent.png")
          .setFooter(tipFooterSeasonPages);
      }
      let row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("claim")
          .setLabel(`Claim Reward ${redeemed}`)
          .setStyle(`Success`)
      );

      let notor = userdata.spacetokens;
      redeemed = userdata.spacereemed || 1;
      let rew = redeemed || 1;
      let item = seasons.Seasons["Colonization Race"].Rewards[rew];
      let requirednot = item.Number * 5;
      if (requirednot > notor) {
        row.components[0].setStyle(`Danger`);
      }

      let msg = await interaction.reply({
        embeds: [embed],
        components: [row, row9],
      });

      let filter = (btnInt) => {
        return interaction.user.id === btnInt.user.id;
      };
      let collector = msg.createMessageComponentCollector({
        filter: filter,
      });

      collector.on("collect", async (i) => {
        if (i.customId.includes("claim")) {
          notor = userdata.spacetokens;
          redeemed = userdata.spaceredeemed || 1;
          rew = redeemed || 1;
          item = seasons.Seasons["Colonization Race"].Rewards[rew];
          requirednot = item.Number * 5;
          if (requirednot > notor) {
            return i.update({
              content: `You need ${requirednot} space tokens!`,
            });
          }
          if (item.Item.endsWith("Cash")) {
            let amount = Number(item.Item.split(" ")[0]);
            userdata.cash += amount;
            userdata.spaceredeemed += 1;
          } else if (item.Item.endsWith("Rare Keys")) {
            let amount = Number(item.Item.split(" ")[0]);
            console.log(amount);
            userdata.rkeys += amount;
            userdata.spaceredeemed += 1;
          } else if (item.Item.endsWith("RP")) {
            let amount = Number(item.Item.split(" ")[0]);
            userdata.rp += amount;
            userdata.spaceredeemed += 1;
          } else if (item.Item.endsWith("Exotic Keys")) {
            let amount = Number(item.Item.split(" ")[0]);
            userdata.ekeys += amount;
            userdata.spaceredeemed += 1;
          } else if (item.Item.endsWith("Common Keys")) {
            let amount = Number(item.Item.split(" ")[0]);
            userdata.ckeys += amount;
            userdata.spaceredeemed += 1;
          } else if (
            item.Item.endsWith("Super Wheelspin") ||
            item.Item.endsWith("Super Wheelspin")
          ) {
            let amount = Number(item.Item.split(" ")[0]);
            userdata.ckeys += amount;
            userdata.spaceredeemed += 1;
          } else if (item.Item.endsWith("Drift Keys")) {
            let amount = Number(item.Item.split(" ")[0]);
            userdata.dkeys += amount;
            userdata.spaceredeemed += 1;
          } else if (
            item.Item.endsWith("Barn Map") ||
            item.Item.endsWith("Barn Maps")
          ) {
            let amount = Number(item.Item.split(" ")[0]);
            userdata.cmaps += amount;
            userdata.spaceredeemed += 1;
          } else if (item.Item.endsWith("Helmet")) {
            let helm = item.Item.toLowerCase();
            userdata.pfps.push(helm);
            userdata.spaceredeemed += 1;
          } else if (itemdb[item.Item.toLowerCase()]) {
            userdata.items.push(item.Item.toLowerCase());
            userdata.spaceredeemed += 1;
          } else if (item.Item.endsWith("Title")) {
            let title = item.Item.toLowerCase();
            let lastIndex = title.lastIndexOf(" ");

            title = title.substring(0, lastIndex);

            userdata.titles.push(title);
            userdata.spaceredeemed += 1;
          } else if (item.Item.endsWith("House")) {
            let house = item.Item.toLowerCase();
            let lastIndex = house.lastIndexOf(" ");

            house = house.substring(0, lastIndex);

            house = {
              id: "spaziale",
              Name: "Casa Spaziale",
              Price: 0,
              Perk: "Earn 1 free exotic key every day with /daily",
              Image:
                "https://i.ibb.co/9pJX9Lp/220727110249-01-space-perspective.jpg",
              Emote: "🪐",
              Type: "House",
              Space: 10,
              Prestige: 0,
            };

            userdata.houses.push(house);
            userdata.spaceredeemed += 1;
          } else if (
            item.Item.endsWith("Legendary Barn Map") ||
            item.Item.endsWith("Legendary Barn Maps")
          ) {
            let amount = Number(item.Item.split(" ")[0]);
            userdata.lmaps += amount;
          } else if (item.Item.endsWith("Garage Spaces")) {
            console.log("garage");
            let amount = Number(item.Item.split(" ")[0]);
            console.log(amount);
            parseInt(amount);
            userdata.garageLimit += amount;
            await User.findOneAndUpdate(
              {
                id: interaction.user.id,
              },
              {
                $set: {
                  spaceredeemed: (userdata.spaceredeemed += 1),
                },
              }
            );
            userdata.update();
          } else if (
            item.Item.endsWith("Bank Increase") ||
            item.Item.endsWith("Bank Increases")
          ) {
            let amount = item.Item.split(" ")[0];
            let user1newpart = [];
            for (var b = 0; i < amount; b++) user1newpart.push("bank increase");
            for (i in user1newpart) {
              userdata.parts.push("bank increase");
            }
            userdata.spaceredeemed += 1;
          } else if (
            item.Item.endsWith("Big Bank Increase") ||
            item.Item.endsWith("Big Bank Increases")
          ) {
            let amount = item.Item.split(" ")[0];
            let user1newpart = [];
            for (var c = 0; i < amount; c++)
              user1newpart.push("big bank increase");
            for (i in user1newpart) {
              userdata.parts.push("big bank increase");
            }
            userdata.spaceredeemed += 1;
          } else if (partdb.Parts[item.Item.toLowerCase()]) {
            console.log("part");
            userdata.parts.push(item.Item.toLowerCase());
            userdata.spaceredeemed += 1;
          } else if (cardb.Cars[item.Item.toLowerCase()]) {
            let carindb = cardb.Cars[item.Item.toLowerCase()];
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
            userdata.cars.push(carobj);
            userdata.spaceredeemed += 1;
          } else if (
            item.Item == "S1 Spring Badge" ||
            item.Item == "s1 spring badge"
          ) {
            userdata.achievements.push({
              name: "S1 Spring Badge",
              id: "s1 spring badge",
            });
          }
          userdata.spacetokens -= requirednot;
          userdata.save();
          console.log(item);
          redeemed = userdata.spaceredeemed;
          row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId("claim")
              .setLabel(`Claim Reward ${redeemed}`)
              .setStyle(`Secondary`)
          );

          i.update({ embeds: [embed], components: [row, row9] });
        } else {
          let current = page;
          if (i.customId.includes("previous") && page !== 1) {
            embed.data.fields = null;

            page--;
          } else if (
            i.customId.includes("next") &&
            page !== currentpage.length
          ) {
            embed.data.fields = null;

            page++;
          } else if (i.customId.includes("first")) {
            embed.data.fields = null;

            page = 1;
          } else if (i.customId.includes("last")) {
            embed.data.fields = null;

            page = 3;
          }
          embed.setTitle(`Colonization Race Page ${page} of 3`);
          embed.setDescription(`${currentpage[page].join("\n")}`);

          if (current !== page) {
            embed.setFooter({ text: `Pages ${page}/${currentpage.length}` });
            i.update({ embeds: [embed], fetchReply: true });
          } else {
            return i.update({ content: "No pages left!" });
          }
        }
      });
    }
  },
};
