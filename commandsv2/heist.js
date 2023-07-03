const { SlashCommandBuilder } = require("@discordjs/builders");
const User = require("../schema/profile-schema");
const lodash = require("lodash");
const { numberWithCommas, randomRange } = require("../common/utils");
const { GET_STARTED_MESSAGE } = require("../common/constants");
const Cooldowns = require("../schema/cooldowns");
const ms = require("pretty-ms");
const { EmbedBuilder } = require("discord.js");
const heistdb = require("../data/heists.json")

const colors = require("../common/colors");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("heist")
    .setDescription("Start a heist to rob a bank!")
    .addStringOption((option) =>
      option.setDescription("The place to rob").setName("location").setRequired(true)
      .setChoices(
        {name: "Bank", value: "bank"}
      )
    ),

  async execute(interaction) {
    let userid = interaction.user.id;
    let user = interaction.user;
    let location = interaction.options.getString("location");
    let userdata = await User.findOne({ id: userid });

    let locationindb = heistdb[location.toLowerCase()]

    let itemsrequired = locationindb.items

    for(let it in itemsrequired){
        if(!userdata.items.includes(itemsrequired[it])) return interaction.reply(`You need a ${itemsrequired[it]} to start this heist!`)
    }
    

    let embed = new EmbedBuilder()
    .setTitle(`Starting heist for ${locationindb.emote} ${locationindb.name}`)
    .setThumbnail(locationindb.image)
    .setColor(colors.blue)


    interaction.reply({embeds: [embed]})
   
  },
};
