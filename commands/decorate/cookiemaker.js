
// /cookie-maker
// Sends a message embed with information about the Cookie Maker mini-game. (Adds a button to start)

// Mixing
  // Once started, the game will send a message embed with an image of cookie dough and a button to mix the dough. (Adds a button to mix)
  // After a certain amount of clicks to mix the dough, the game will send a message embed with an image of cookie dough and a button to shape the dough. (Adds a button to shape)

// Shaping
  // After clicking shape, the user will be prompted to choose a cookie shape.
  // After choosing a cookie shape, the game will send a message embed with an image of cookie dough and a button to bake the dough. (Adds a button to bake)

// Baking
  // After clicking bake, the user will be prompted to choose a baking time.
  // After choosing a baking time, the game will send a message embed with an image of cookies and a button to decorate the cookies. (Adds a button to decorate)

// Decorating
  // After clicking decorate, the user will be prompted to choose a decoration.
  // After choosing a decoration, the game will send a message embed with an image of cookies and a button to eat the cookies. (Adds a button to eat)

// Eating
  // After clicking eat, the game is over. The user will be prompted to play again or quit.

// Each cookie shape has a different baking time and different click amount.
const Command = require('@structures/framework/Command');

const cookieTypes = {
  "chocolate-chip": {
    name: "Chocolate Chip",
    emoji: { id: "1182159607376912394", name: "cookie_mixed" },
    images: {
      unmixed: "https://discord.mx/s6kUz2xTRD.png",
      mixed: "https://discord.mx/LLe7RVhWd3.png",
      baked: "https://discord.mx/AwFNvrut79.png",
    },
  },
}

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      enabled: false,
      description: 'Bake & decorate a cookie!',
      options: [],
      category: "Winter",
    })
  }

  async run(ctx) {
    let gameData = {
      type: null,
      mixed: 0,
      shape: null,
      bake: null,
      decorate: null,
    }

    const msg = await ctx.sendMsg({
      embeds: [new ctx.EmbedBuilder()
        .setTitle("Cookie Maker")
        .setDescription("Please select the type of cookie you would like to bake.")
        .setColor('#88C9F9')],
      components: [
        {
          type: 1,
          components: Object.entries(cookieTypes).map(([id,cookieObj]) => {
            return {
              type: 2,
              style: 1,
              label: cookieObj.name,
              custom_id: `cookiemaker_select_${id}`,
            }
          })
        }
      ]
    })

    const collector = msg.createMessageComponentCollector({
      filter: (inter) =>
        inter.user.id === ctx.interaction.user.id &&
        inter.customId.startsWith("cookiemaker_"),
      time: 120_000,
    });

    collector.on("collect", async (interaction) => {
      const [action, type] = interaction.customId.split("_").slice(1);
      interaction.deferUpdate();


      if (action == "select") {
        gameData.type = type;
        await msg.edit({
          embeds: [new ctx.EmbedBuilder()
            .setTitle("Cookie Maker")
            .setDescription("Please click the button below to mix the dough.")
            .setImage(cookieTypes[type].images.unmixed)
            .setColor('#88C9F9')],
          components: [{ type:1, components: [ { type:2, style:3, label: "Mix", custom_id: "cookiemaker_mix" } ] }] 
        });
      } else if (action == "mix") {
        gameData.mixed++;
        if (gameData.mixed == 3) {
          await msg.edit({
            embeds: [new ctx.EmbedBuilder()
              .setTitle("Cookie Maker")
              .setDescription("Please click the button below to put the dough down.")
              .setImage(cookieTypes[gameData.type].images.mixed)
              .setColor('#88C9F9')],
            components: [{ type:1, components: [ { type:2, style:3, label: "Bake", custom_id: "cookiemaker_bake_in" } ] }] 
          });
        } else {
          await msg.edit({
            embeds: [new ctx.EmbedBuilder()
              .setTitle("Cookie Maker")
              .setDescription("Please click the button below to mix the dough.")
              .setImage(cookieTypes[gameData.type].images.unmixed)
              .setColor('#88C9F9')],
            components: [{ type:1, components: [ { type:2, style:3, label: "Mix", custom_id: "cookiemaker_mix" } ] }] 
          });
        }
      } else if (action == "bake") {
      } else if (action == "shape") {
        gameData.shape = type;
        await msg.edit({
          embeds: [new ctx.EmbedBuilder()
            .setTitle("Cookie Maker")
            .setDescription("Please select the baking time.")
            .setImage(cookieTypes[gameData.type].images.mixed)
            .setColor('#88C9F9')],
          components: [
            {
              type: 1,
              components: [
                {
                  type: 2,
                  style: 1,
                  label: "Put inside oven",
                  custom_id: "cookiemaker_oven_in",
                }
              ],
            }
          ]
        });
      } else if (action == "bake") {
        // depending on time pulled out from time 

        gameData.bake = type;
        await msg.edit({
          embeds: [new ctx.EmbedBuilder()
            .setTitle("Cookie Maker")
            .setDescription("Please select the decoration.")
            .setImage(cookieTypes[gameData.type].images.mixed)
            .setColor('#88C9F9')],
          components: [
            {
              type: 1,
              components: [
                {
                  type: 2,
                  style: 1,
                  label: "Sprinkles",
                  custom_id: "cookiemaker_decorate_sprinkles",
                },
                {
                  type: 2,
                  style: 1,
                  label: "Icing",
                  custom_id: "cookiemaker_decorate_icing",
                },
                {
                  type: 2,
                  style: 1,
                  label: "Chocolate",
                  custom_id: "cookiemaker_decorate_chocolate",
                },
                {
                  type: 2,
                  style: 1,
                  label: "Candy",
                  custom_id: "cookiemaker_decorate_candy",
                },
              ],
            }
          ]
        });
      }
    });
    
    collector.on("end", (collected) => {
      if (collected.size) return;
      msg.edit({
        components: []
      })
    });
  } 
}