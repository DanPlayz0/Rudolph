const Command = require('@structures/framework/Command');
const Canvas = require('canvas');

const cookieTypes = {
  "chocolate-chip": {
    name: "Chocolate Chip",
    emoji: { id: "1182159607376912394", name: "cookie_mixed" },
    startColor: { r: 246, g: 159, b: 106 },
    topping: {
      type: "circle",
      color: { r: 152, g: 90, b: 67 },
    }
  },
}

let cookieMasks = {
  "star": "https://discord.mx/K9LUgGFxys.png",
  "gingerbread_man": "https://discord.mx/okqoWXUbqC.png",
  "candy_cane": "https://discord.mx/ioucGpKJCP.png",
  "snowflake": "https://discord.mx/3bhPch1huS.png",
};

(async () => {
  for (let [name, url] of Object.entries(cookieMasks)) {
    cookieMasks[name] = await Canvas.loadImage(url);
  }
})();


const generateCanvas = (color, chipColor, chips = []) => {
  const canvas = Canvas.createCanvas(500,500), context = canvas.getContext('2d');
  const [centerX, centerY] = [canvas.width / 2, canvas.height / 2];
  const radius = centerX * 0.9;
  const numberOfChips = 20;
  const chipRadius = radius / numberOfChips * 0.8;

  context.beginPath();
  context.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  context.fillStyle = color;
  context.fill();
  context.closePath();

  function isOverlap(x, y) {
    for (let i = 0; i < chips.length; i++) {
      const dx = chips[i].x - x;
      const dy = chips[i].y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < chipRadius * 2) return true;
    }
    return false;
  }

  if (chips.length == 0) {
    let chipsDrawn = 0;
    while (chipsDrawn < numberOfChips) {
      const angle = Math.random() * Math.PI * 2;
      const distanceFromCenter = Math.random() * radius;
      const chipX = centerX + Math.cos(angle) * distanceFromCenter;
      const chipY = centerY + Math.sin(angle) * distanceFromCenter;

      if (!isOverlap(chipX, chipY)) {
        context.save();
        context.beginPath();
        context.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        context.clip();

        context.beginPath();
        context.arc(chipX, chipY, chipRadius, 0, 2 * Math.PI);
        context.fillStyle = chipColor;
        context.fill();
        context.closePath();

        context.restore();

        chips.push({ x: chipX, y: chipY });
        chipsDrawn++;
      }
    }
  }

  for (let i = 0; i < chips.length; i++) {
    context.save();
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    context.clip();

    context.beginPath();
    context.arc(chips[i].x, chips[i].y, chipRadius, 0, 2 * Math.PI);
    context.fillStyle = chipColor;
    context.fill();
    context.closePath();

    context.restore();
  }

  return {canvas, context};
}

function createCookieShape({ canvas, context }, shape) {
  const c2 = Canvas.createCanvas(canvas.width, canvas.height);
  const ctx2 = c2.getContext('2d');

  const mask = cookieMasks[shape];
  if (!mask) throw new Error('Invalid cookie shape');

  ctx2.drawImage(mask, 0, 0, canvas.width, canvas.height);
  ctx2.globalCompositeOperation = 'source-in';
  ctx2.drawImage(canvas, 0, 0);

  ctx2.globalCompositeOperation = 'source-over';

  return {canvas: c2, context:ctx2};
}

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      enabled: true,
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
      toppings: []
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

    let genned, canvas;
    let regenerate = (resetToppings = false) => null;

    collector.on("collect", async (interaction) => {
      const splitId = interaction.customId.split("_").slice(1);
      const action = splitId[0];
      const type = splitId.slice(1).join("_");
      interaction.deferUpdate();
      collector.resetTimer();

      if (action == "select") {
        gameData.type = type;
        if(cookieTypes[type].topping.type) {
          regenerate = (resetToppings = false) => {
            if (resetToppings) gameData.toppings = [];
            genned = generateCanvas(`rgb(${cookieTypes[gameData.type].startColor.r}, ${cookieTypes[gameData.type].startColor.g}, ${cookieTypes[gameData.type].startColor.b})`, `rgb(${cookieTypes[gameData.type].topping.color.r}, ${cookieTypes[gameData.type].topping.color.g}, ${cookieTypes[gameData.type].topping.color.b})`, gameData.toppings);
            canvas = genned.canvas.toBuffer();
            return canvas;
          };
          regenerate(false);
        }

        await msg.edit({
          embeds: [new ctx.EmbedBuilder()
            .setTitle("Cookie Maker")
            .setDescription("Please click the button below to mix the dough.")
            .setImage('attachment://cookie.png')
            .setColor('#88C9F9')],
          files: [{ attachment: canvas || "https://discord.mx/hcvOiDRmYc.jpg", name: "cookie.png" }],
          components: [{ type:1, components: [ { type:2, style:3, label: "Mix", custom_id: "cookiemaker_mix" } ] }] 
        });
      } else if (action == "mix") {
        gameData.mixed++;
        if (gameData.mixed == 3) {
          await msg.edit({
            embeds: [new ctx.EmbedBuilder()
              .setTitle("Cookie Maker")
              .setDescription("Please click the button below to put the dough down.")
              .setImage('attachment://cookie.png')
              .setColor('#88C9F9')],
            files: [{ attachment: canvas || "https://discord.mx/hcvOiDRmYc.jpg", name: "cookie.png" }],
            components: [{ type:1, components: Object.keys(cookieMasks).map(m => ({ type:2, style:1, label: m.split('_').join(' ').toProperCase(), custom_id: `cookiemaker_shape_${m}` }))}] 
          });
        } else {
          regenerate(true);
          await msg.edit({
            embeds: [new ctx.EmbedBuilder()
              .setTitle("Cookie Maker")
              .setDescription("Please click the button below to mix the dough.")
              .setImage('attachment://cookie.png')
              .setColor('#88C9F9')],
            files: [{ attachment: canvas || "https://discord.mx/hcvOiDRmYc.jpg", name: "cookie.png" }],
            components: [{ type:1, components: [ { type:2, style:3, label: `Mix (${3-gameData.mixed} times)`, custom_id: "cookiemaker_mix" } ] }] 
          });
        }
      } else if (action == "shape") {
        gameData.shape = type;
        regenerate = (resetToppings = false) => {
          if (resetToppings) gameData.toppings = [];
          genned = generateCanvas(`rgb(${cookieTypes[gameData.type].startColor.r}, ${cookieTypes[gameData.type].startColor.g}, ${cookieTypes[gameData.type].startColor.b})`, `rgb(${cookieTypes[gameData.type].topping.color.r}, ${cookieTypes[gameData.type].topping.color.g}, ${cookieTypes[gameData.type].topping.color.b})`, gameData.toppings);
          genned = createCookieShape(genned, gameData.shape);
          canvas = genned.canvas.toBuffer();
          return canvas;
        };
        regenerate(false);

        await msg.edit({
          embeds: [new ctx.EmbedBuilder()
            .setTitle("Cookie Maker")
            .setDescription("Put it in the oven!.")
            .setImage('attachment://cookie.png')
            .setColor('#88C9F9')],
          files: [{ attachment: canvas || "https://discord.mx/hcvOiDRmYc.jpg", name: "cookie.png" }],
          components: [
            {
              type: 1,
              components: [
                {
                  type: 2,
                  style: 1,
                  label: "Put inside oven",
                  custom_id: "cookiemaker_oven-in",
                }
              ],
            }
          ]
        });
      } else if (action == "oven-in") {
        gameData.bake = Date.now();
        await msg.edit({
          embeds: [new ctx.EmbedBuilder()
            .setTitle("Cookie Maker")
            .setDescription("Pull it out when you think it's good.\n(You won't see the image update until you pull it out)")
            .setImage('attachment://cookie.png')
            .setColor('#88C9F9')],
          files: [{ attachment: canvas || "https://discord.mx/hcvOiDRmYc.jpg", name: "cookie.png" }],
          components: [
            {
              type: 1,
              components: [
                {
                  type: 2,
                  style: 1,
                  label: "Take out of oven",
                  custom_id: "cookiemaker_oven-out",
                }
              ],
            }
          ]
        });
      } else if (action == "oven-out") collector.stop();
    });
    
    collector.on("end", async (collected) => {
      if (gameData.type == null) return msg.edit({ embeds: [new ctx.EmbedBuilder().setTitle("Cookie Maker").setDescription("You ran out of time to select a cookie type!").setColor('#88C9F9')] });
      if (gameData.mixed == null) return msg.edit({ embeds: [new ctx.EmbedBuilder().setTitle("Cookie Maker").setDescription("You ran out of time to mix the dough!").setColor('#88C9F9')] });
      if (gameData.shape == null) return msg.edit({ embeds: [new ctx.EmbedBuilder().setTitle("Cookie Maker").setDescription("You ran out of time to shape the dough!").setColor('#88C9F9')] });
      if (gameData.bake == null) return msg.edit({ embeds: [new ctx.EmbedBuilder().setTitle("Cookie Maker").setDescription("You ran out of time to bake the dough!").setColor('#88C9F9')] });

      const bakeTime = Date.now() - gameData.bake;
      const bakeTimePercentage = Math.min(bakeTime / 10000, 1);
      const darkenPercentage = 0.35; // percentage of how much to darken the cookie
      
      const darken = (r,g,b) => {
        return `rgb(${Math.floor(r * (1 - darkenPercentage * bakeTimePercentage))}, ${Math.floor(g * (1 - darkenPercentage * bakeTimePercentage))}, ${Math.floor(b * (1 - darkenPercentage * bakeTimePercentage))})`;
      }

      const color = darken(cookieTypes[gameData.type].startColor.r, cookieTypes[gameData.type].startColor.g, cookieTypes[gameData.type].startColor.b);
      const chipColor = darken(cookieTypes[gameData.type].topping.color.r, cookieTypes[gameData.type].topping.color.g, cookieTypes[gameData.type].topping.color.b)

      genned = generateCanvas(color, chipColor, gameData.toppings);
      genned = createCookieShape(genned, gameData.shape);
      canvas = genned.canvas.toBuffer();

      await msg.edit({
        embeds: [new ctx.EmbedBuilder()
          .setTitle("Cookie Maker")
          .setDescription("This is your finished cookie! It was baked for " + (bakeTime / 1000).toFixed(2) + " seconds. Only baked " + (bakeTimePercentage * 100).toFixed(2) + "% of the way")
          .setImage('attachment://cookie.png')
          .setColor('#88C9F9')],
        files: [{ attachment: canvas || "https://discord.mx/hcvOiDRmYc.jpg", name: "cookie.png" }],
        components: []
      });
    });
  } 
}