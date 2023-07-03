const {
    ActionRowBuilder,
    EmbedBuilder,
    SelectMenuBuilder,
    ButtonBuilder
  } = require("discord.js");
  const { SlashCommandBuilder } = require("@discordjs/builders");
  const colors = require("../common/colors");
  const cardb = require("../data/cardb.json");
  const itemdb = require("../data/items.json");
  const User = require("../schema/profile-schema")
  const partdb = require("../data/partsdb.json").Parts

  module.exports = {
    data: new SlashCommandBuilder()
      .setName("tune")
      .setDescription("Tune a car!")
      .addStringOption((option) => option
      .setName("car")
      .setRequired(true)
      .setDescription("The car to tune")
      ),
    async execute(interaction) {

        let cartofind = interaction.options.getString("car")
        let userdata = await User.findOne({id: interaction.user.id}) 

        let selected = userdata.cars.filter((car) => car.ID.toLowerCase() == cartofind.toLowerCase())

        selected = selected[0]
        let tunes = []
        let rowturbo = new ActionRowBuilder()
        let rowsuspension = new ActionRowBuilder()

        if(selected.Turbo.toLowerCase()){
            rowturbo.addComponents(
                new ButtonBuilder()
                .setEmoji("➕")
                .setCustomId("plusturbo")
                .setStyle("Success")
                .setLabel("1 PSI"),
                new ButtonBuilder()
                .setEmoji("➖")
                .setCustomId("minusturbo")
                .setLabel("1 PSI")
                .setStyle("Danger")
            )
                let psi = selected.PSI || partdb[selected.Turbo.toLowerCase()].PSI
                tunes.push(`${partdb[selected.Turbo.toLowerCase()].Emote} PSI: ${psi}`)

            
        }
        
        if(selected.Suspension.toLowerCase()){
            if(partdb[selected.Suspension.toLowerCase()].Tier >= 3){
                rowsuspension.addComponents(
                    new ButtonBuilder()
                    .setEmoji("➕")
                    .setCustomId("plusheight")
                    .setStyle("Success")
                    .setLabel("1 Ride Height"),
                    new ButtonBuilder()
                    .setEmoji("➖")
                    .setCustomId("minusheight")
                    .setLabel("1 Ride Height")
                    .setStyle("Danger")
                )
                let rideheight = selected.Height || partdb[selected.Suspension.toLowerCase()].Height
                tunes.push(`${partdb[selected.Suspension.toLowerCase()].Emote} Ride Height: ${rideheight} in`)

            }
        }
        

        let embed = new EmbedBuilder()
        .setTitle(`Tune`)
        .setDescription(`${tunes.join('\n')}`)
        .setColor(colors.blue)

        interaction.reply({embeds: [embed], components: [rowturbo, rowsuspension]})

    },
  };
  