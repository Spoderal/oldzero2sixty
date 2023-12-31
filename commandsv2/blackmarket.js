const {
  ActionRowBuilder,
  SelectMenuBuilder,
  EmbedBuilder,
} = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const parts = require("../data/partsdb.json");
const cars = require("../data/cardb.json");
const colors = require("../common/colors");
const { numberWithCommas } = require("../common/utils");
const { tipFooterPurchasePart } = require("../common/tips");
const carpacks = require("../data/carpacks.json");
//comment
module.exports = {
  data: new SlashCommandBuilder()
    .setName("blackmarket")
    .setDescription("Check the blackmarket"),

  async execute(interaction) {
    const row = new ActionRowBuilder().addComponents(
      new SelectMenuBuilder()
        .setCustomId("select")
        .setPlaceholder("Select an item")
        .addOptions([
          {
            label: "Parts",
            description: "Select this for the list of black market parts",
            value: "parts",
            customId: "parts",
          },
          {
            label: "Cars",
            description: "Select this for the list of black market cars",
            value: "cars",
            customId: "cars",
          },
        ])
    );

    let embed = new EmbedBuilder()
      .setTitle("Black Market")
      .setThumbnail("https://i.ibb.co/89GbzcB/Logo-Makr-8u-BQuo.png")
      .addFields([
        {
          name: `Available Parts`,
          value:
            "*Choose an item from the drop down below*\n\n**Exclusive parts you can only buy with gold!**",
          inline: true,
        },
      ])
      .setColor(colors.blue)
      .setDescription(
        `\`/buy (part)\` to buy a part\n\n[Official Server](https://discord.gg/bHwqpxJnJk)\n[Buy me a coffee!](https://www.buymeacoffee.com/zero2sixty)`
      );

    interaction
      .reply({ embeds: [embed], components: [row] })
      .then(async (msg) => {
        try {
          const filter = (interaction) =>
            interaction.isSelectMenu() &&
            interaction.user.id === interaction.user.id;

          const collector = interaction.channel.createMessageComponentCollector(
            { filter, time: 1000 * 30 }
          );

          collector.on("collect", async (collected) => {
            const value = collected.values[0];
            if (value === "parts") {
              let embed2;
              embed2 = new EmbedBuilder()
                .setTitle("Black Market Parts")
                .setFooter(tipFooterPurchasePart)
                .setDescription(
                  `**
                  Page 1\n
                  ${parts.Parts["bm1drifttires"].Emote}  ${
                    parts.Parts["bm1drifttires"].Name
                  } : 🪙 ${numberWithCommas(
                    parts.Parts["bm1drifttires"].Price
                  )}\n
                  ${parts.Parts["bm1driftsuspension"].Emote}  ${
                    parts.Parts["bm1driftsuspension"].Name
                  } : 🪙 ${numberWithCommas(
                    parts.Parts["bm1driftsuspension"].Price
                  )}\n
                  ${parts.Parts["bm1racesuspension"].Emote}  ${
                    parts.Parts["bm1racesuspension"].Name
                  } : 🪙 ${numberWithCommas(
                    parts.Parts["bm1racesuspension"].Price
                  )}\n
                  ${parts.Parts["bm1turbo"].Emote}  ${
                    parts.Parts["bm1turbo"].Name
                  } : 🪙 ${numberWithCommas(parts.Parts["bm1turbo"].Price)}\n
                  ${parts.Parts["ludicrous"].Emote}  ${
                    parts.Parts["ludicrous"].Name
                  } : 🪙 ${numberWithCommas(
                    parts.Parts["ludicrous"].Price
                  )} EV ONLY\n
                  **`
                )
                .setColor(colors.blue)
                .setThumbnail("https://i.ibb.co/sP3F1p2/exhaustdefault.png");

              interaction.editReply({ embeds: [embed2], components: [row] });
            } else if (value === "cars") {
              let embed2;
              embed2 = new EmbedBuilder()
                .setTitle("Cars")
                .setFooter(tipFooterPurchasePart)
                .setDescription(
                  `**
                  Page 1\n
                  ${cars.Cars["bm 2002 nissan skyline r34"].Emote}  ${
                    cars.Cars["bm 2002 nissan skyline r34"].Name
                  } : 🪙 ${numberWithCommas(
                    cars.Cars["bm 2002 nissan skyline r34"].Price
                  )}\n
                  ${cars.Cars["bm 2019 toyota 86"].Emote}  ${
                    cars.Cars["bm 2019 toyota 86"].Name
                  } : 🪙 ${numberWithCommas(
                    cars.Cars["bm 2019 toyota 86"].Price
                  )}\n
                  ${cars.Cars["bm 2022 bmw m8"].Emote}  ${
                    cars.Cars["bm 2022 bmw m8"].Name
                  } : 🪙 ${numberWithCommas(
                    cars.Cars["bm 2022 bmw m8"].Price
                  )}\n
                  ${cars.Cars["bm 2014 lamborghini huracan"].Emote}  ${
                    cars.Cars["bm 2014 lamborghini huracan"].Name
                  } : 🪙 ${numberWithCommas(
                    cars.Cars["bm 2014 lamborghini huracan"].Price
                  )}\n
                  ${cars.Cars["1997 porsche 911 gt1"].Emote}  ${
                    cars.Cars["1997 porsche 911 gt1"].Name
                  } : 🪙 ${numberWithCommas(
                    cars.Cars["1997 porsche 911 gt1"].Price
                  )}\n
                  ${cars.Cars["bm 2020 koenigsegg jesko"].Emote}  ${
                    cars.Cars["bm 2020 koenigsegg jesko"].Name
                  } : 🪙 ${numberWithCommas(
                    cars.Cars["bm 2020 koenigsegg jesko"].Price
                  )}\n
                  
                  Car Packs
                   __${carpacks.roadsters.Name} : 🪙 ${
                    carpacks.roadsters.Gold
                  }__
                   ${cars.Cars["2017 pagani huayra roadster"].Emote} ${
                    cars.Cars["2017 pagani huayra roadster"].Name
                  }
                   ${cars.Cars["2021 aston martin vantage roadster"].Emote} ${
                    cars.Cars["2021 aston martin vantage roadster"].Name
                  }
                   ${cars.Cars["2022 bmw z4 roadster"].Emote} ${
                    cars.Cars["2022 bmw z4 roadster"].Name
                  }
                  __${carpacks["suv adventures"].Name} : 🪙 ${
                    carpacks["suv adventures"].Gold
                  }__
                   ${cars.Cars["2023 bmw x4"].Emote} ${
                    cars.Cars["2023 bmw x4"].Name
                  }
                   ${cars.Cars["2022 porsche cayenne coupe"].Emote} ${
                    cars.Cars["2022 porsche cayenne coupe"].Name
                  }
                   ${cars.Cars["2023 mercedes glc coupe"].Emote} ${
                    cars.Cars["2023 mercedes glc coupe"].Name
                  }
                  **`
                )
                .setColor(colors.blue)
                .setThumbnail("https://i.ibb.co/NKHhh2r/tiresdefault.png");

              interaction.editReply({ embeds: [embed2], components: [row] });
            }
          });
        } catch (err) {
          return msg.reply(`Error: ${err}`);
        }
      });
  },
};
