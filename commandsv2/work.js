const Discord = require("discord.js");
const carsdb = require("../data/cardb.json");
const { SlashCommandBuilder } = require("@discordjs/builders");
const lodash = require("lodash");
const ms = require("ms");
const itemdb = require("../data/items.json");
const User = require("../schema/profile-schema");
const Cooldowns = require("../schema/cooldowns");
const colors = require("../common/colors");
const { ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require("discord.js");
const {
  toCurrency,
  blankInlineField,
  randomRange,
  convertMPHtoKPH,
  numberWithCommas,
} = require("../common/utils");
const { GET_STARTED_MESSAGE } = require("../common/constants");
const jobdb = require("../data/jobs.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("job")
    .setDescription("Manage your job, work, etc")
    .addSubcommand((cmd) =>
      cmd.setName("work").setDescription("Work at your job")
    )
    .addSubcommand((cmd) => cmd.setName("quit").setDescription("Quit your job"))
    .addSubcommand((cmd) =>
      cmd
        .setName("hire")
        .setDescription("Hire yourself for a job")
        .addStringOption((option) =>
          option
            .setName("job")
            .setDescription("The job to hire yourself for")
            .setRequired(true)
            .addChoices(
              { name: "Pizza Delivery", value: "pizza delivery" },
              { name: "Police", value: "police" },
              { name: "Chef", value: "chef" },
              { name: "Criminal", value: "criminal" }
            )
        )
    )
    .addSubcommand((cmd) =>
      cmd.setName("info").setDescription("View info about your job progress")
    ),
  async execute(interaction) {
    let uid = interaction.user.id;
    let userdata = await User.findOne({ id: uid });
    if (!userdata?.id) return await interaction.reply(GET_STARTED_MESSAGE);
    let jobsarr = [];

    for (let job in jobdb) {
      jobsarr.push(jobdb[job]);
    }

    let subcommand = interaction.options.getSubcommand();
    if (subcommand == "hire") {
      if (userdata.work) return interaction.reply("You already have a job!");
      let job = interaction.options.getString("job");
      let jobindb = jobdb[job.toLowerCase()];

      console.log(jobindb);
      let jobtoset = {
        name: `${jobindb.name}`,
        cooldown: 0,
        shifts: 0,
        xp: 0,
        earned: 0,
        success: 0,
        fails: 0,
        salary: jobindb.Positions[0].salary,
        position: jobindb.Positions[0].name,
      };
      userdata.work = jobtoset;
      userdata.save();
      console.log(jobtoset);
      interaction.reply(`Hired for ${job}`);
    } else if (subcommand == "quit") {
      if (!userdata.work) return interaction.reply("You don't have a job!");

      userdata.work = null;
      userdata.save();
      interaction.reply(`You quit your job!`);
    } else if (subcommand == "info") {
      if (!userdata.work) return interaction.reply("You don't have a job.");

      let jobtowork = userdata.work;

      let userjobfilter = jobsarr.filter(
        (job) => job.name.toLowerCase() == jobtowork.name.toLowerCase()
      );
      let positionfilter = userjobfilter[0].Positions.filter(
        (pos) => pos.name.toLowerCase() == jobtowork.position.toLowerCase()
      );
      let prevrank = positionfilter[0].rank;
      let nextrank = (prevrank += 1);
      let newpositionfilter = userjobfilter[0].Positions.filter(
        (pos) => pos.rank == nextrank
      );

      if (!newpositionfilter[0]) {
        newpositionfilter[0] = {
          xp: 0,
        };
      }

      let embed = new EmbedBuilder()
        .setTitle(`${interaction.user.username}'s stats for ${jobtowork.name}`)
        .addFields(
          {
            name: "Position",
            value: `${jobtowork.position} ${positionfilter[0].emote}`,
          },
          {
            name: "XP",
            value: `${numberWithCommas(jobtowork.xp)}/${numberWithCommas(
              newpositionfilter[0].xp
            )}`,
          },
          {
            name: "Salary",
            value: `${toCurrency(jobtowork.salary)}`,
          },
          {
            name: "Earned",
            value: `${toCurrency(jobtowork.earned)}`,
          },
          {
            name: "Success/Fail Ratio",
            value: `${jobtowork.success}/${jobtowork.fails}`,
          }
        )
        .setColor(colors.blue);

      interaction.reply({ embeds: [embed] });
    } else if (subcommand == "work") {
      if (!userdata.work) return interaction.reply("You don't have a job.");

      let jobtowork = userdata.work;

      let timeout = 28800000;
      if (
        userdata.work.cooldown !== null &&
        timeout - (Date.now() - userdata.work.cooldown) > 0
      ) {
        let time = ms(timeout - (Date.now() - userdata.work.cooldown));
        let timeEmbed = new Discord.EmbedBuilder()
          .setColor(colors.blue)
          .setDescription(`You've already worked\n\nWork again in ${time}.`);
        await interaction.reply({ embeds: [timeEmbed], fetchReply: true });
        return;
      }

      let activities = ["memory"];

      let activity = lodash.sample(activities);
      let userjobfilter = jobsarr.filter(
        (job) => job.name.toLowerCase() == jobtowork.name.toLowerCase()
      );
      let positionfilter = userjobfilter[0].Positions.filter(
        (pos) => pos.name.toLowerCase() == jobtowork.position.toLowerCase()
      );
      let prevrank = positionfilter[0].rank;
      let nextrank = (prevrank += 1);
      let newpositionfilter = userjobfilter[0].Positions.filter(
        (pos) => pos.rank == nextrank
      );

      let embed = new EmbedBuilder()
        .setTitle(`Working as a ${jobtowork.position} for ${jobtowork.name}`)
        .setColor(colors.blue);
      console.log(newpositionfilter);

      if (newpositionfilter[0] && jobtowork.xp >= newpositionfilter[0].xp) {
        interaction.reply(
          `You've received a promotion! Your new salary is ${toCurrency(
            newpositionfilter[0].salary
          )}`
        );
        userdata.work.position = newpositionfilter[0].name;
        if (userdata.work.salary < newpositionfilter[0].salary) {
          userdata.work.salary = newpositionfilter[0].salary;
        }
        userdata.work.xp = 0;

        userdata.markModified("work");
        userdata.save();
        return;
      }

      if (activity == "memory") {
        let colors = ["🟢", "🔵", "🔴"];
        let color = lodash.sample(colors);
        let words = ["tire", "engine", "exhaust"];
        let word = lodash.sample(words);
        let colors2 = ["🟡", "🟣", "🟤"];
        let words2 = ["grape", "apple", "orange"];
        let word2 = lodash.sample(words2);
        let color2 = lodash.sample(colors2);
        let colors3 = ["⭕", "⚪", "⚫"];
        let words3 = ["chicken", "pig", "cow"];
        let word3 = lodash.sample(words3);
        let color3 = lodash.sample(colors3);

        let objects = [];

        let object1 = {
          color: color,
          word: word,
        };

        let object2 = {
          color: color2,
          word: word2,
        };

        let object3 = {
          color: color3,
          word: word3,
        };

        objects = [object1, object2, object3];

        let objectinend = lodash.sample(objects);

        embed.setDescription(
          `Memorize the following\n\n${object1.color} ${object1.word}\n${object2.color} ${object2.word}\n${object3.color} ${object3.word}`
        );
        interaction.reply({ embeds: [embed], fetchReply: true });

        setTimeout(async () => {
          embed.setDescription(`What emote was next to ${objectinend.word}`);
          let row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId(object1.word)
              .setLabel(object1.color)
              .setStyle("Secondary"),
            new ButtonBuilder()
              .setCustomId(object2.word)
              .setLabel(object2.color)
              .setStyle("Secondary"),
            new ButtonBuilder()
              .setCustomId(object3.word)
              .setLabel(object3.color)
              .setStyle("Secondary")
          );

          let msg = await interaction.editReply({
            embeds: [embed],
            components: [row],
            fetchReply: true,
          });

          let filter = (btnInt) => {
            return interaction.user.id === btnInt.user.id;
          };

          let collector = msg.createMessageComponentCollector({
            filter: filter,
          });

          collector.on("collect", async (i) => {
            if (i.customId == objectinend.word) {
              let prompt = lodash.sample(userjobfilter[0].winprompts);
              let randomxp = randomRange(1, 100);
              if (userdata.work.xpmult) {
                let mult = userdata.work.xpmult;
                let one = 100 * mult;
                let max = (one += 100);
                randomxp = randomRange(50, max);
              }

              let itemchance = randomRange(1, 10);
              let itemchance2 = randomRange(1, 20);
              let randompizza = lodash.sample(["pizza", "veggie pizza"]);
              let randomchef = lodash.sample(["spatula", "cooking pot"]);

              if (itemchance == 6 && userdata.work.name == "Pizza Delivery") {
                embed.addFields({
                  name: "Found Item",
                  value: `${itemdb[randompizza].Emote} ${itemdb[randompizza].Name}`,
                });

                userdata.items.push(randompizza);
              }

              if (itemchance == 3 && userdata.work.name == "Chef") {
                embed.addFields({
                  name: "Found Item",
                  value: `${itemdb[randomchef].Emote} ${itemdb[randomchef].Name}`,
                });

                userdata.items.push(randomchef);
              }

              if (itemchance == 6 && userdata.work.name == "Police Officer") {
                embed.addFields({
                  name: "Found Item",
                  value: `${itemdb["taser"].Emote} ${itemdb["taser"].Name}`,
                });

                userdata.items.push("taser");
              }

              if (itemchance2 == 6 && userdata.work.name == "Criminal") {
                embed.addFields({
                  name: "Found Item",
                  value: `${itemdb["gem"].Emote} ${itemdb["gem"].Name}`,
                });

                userdata.items.push("gem");
              }
              let salary = userdata.work.salary;
              if (
                userdata.work.name == "Chef" &&
                userdata.items.includes("spatula")
              ) {
                randomxp = randomxp += randomxp * 0.5;
              }
              if (
                userdata.work.name == "Chef" &&
                userdata.items.includes("cooking pot")
              ) {
                salary = salary += salary * 0.5;
              }

              console.log(itemchance);
              embed.setDescription(
                `${prompt} and earned ${toCurrency(salary)} and ${randomxp} xp!`
              );
              userdata.cash += Number(userdata.work.salary);
              userdata.work.xp += randomxp;
              userdata.work.shifts += 1;
              userdata.work.success += 1;
              userdata.work.earned += positionfilter[0].salary;
              userdata.work.cooldown = Date.now();
              userdata.markModified("work");
              userdata.save();

              await i.update({ embeds: [embed], components: [] });
            } else {
              let prompt = lodash.sample(userjobfilter[0].loseprompts);
              embed.setDescription(
                `${prompt}\nYou earned ${toCurrency(
                  positionfilter[0].fail
                )} for not doing your job.`
              );
              await i.update({ embeds: [embed], components: [] });
              userdata.cash += positionfilter[0].fail;
              userdata.work.earned += positionfilter[0].fail;
              userdata.work.fails += 1;
              userdata.work.shifts += 1;
              userdata.work.cooldown = Date.now();
              userdata.markModified("work");
              userdata.save();
            }
          });
        }, 3000);
      }
    }
  },
};
