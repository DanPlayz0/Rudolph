const Command = require('@structures/framework/Command');
const Canvas = require('canvas');
const difficulties = {
  easy: {
    choices: 3,
    minMax: [1, 3],
    time: 120000,
    attempts: 15
  },
  normal: {
    choices: 5,
    minMax: [3, 5],
    time: 120000,
    attempts: 12
  },
  hard: {
    choices: 7,
    minMax: [3, 5],
    time: 120000,
    attempts: 8
  },
  expert: {
    choices: 10,
    minMax: [5, 7],
    time: 120000,
    attempts: 5
  }
};

const colors = {
  trim: "#31A457",
  trim_dropshadow: "#288B4A",
  trim_stripes: "#FFFFFF",
  lock_bg: "#B2BDC3",
  code_input: "#3848A8",
  code_bg: "#2E75B5",
  button: "#6DC2F1",
  button_dropshadow: "#2D75B5",
  wall_bg: "#B2BDC3"
};

const code_values = {
  "candy_cane": {
    image: "https://discord.mx/uaVpGUUWkk.png",
    emoji: { name: 'candy_cane', id: '1177540294233829427' },
    hints: {
      easy: ["A sweet, curved treat with red and white stripes."],
      normal: ["A peppermint-flavored stick with a hook at the top."],
      hard: ["A classic holiday confection."],
      expert: ["Seasonal sweetness, a staple in holiday treats."],
    }
  },
  "tree": {
    image: "https://discord.mx/dnC6K4NPqK.png",
    emoji: { name: 'tree', id: '1177540296381317141' },
    hints: {
      easy: ["Tall and green, it's a centerpiece for holiday festivities."],
      normal: ["A symbol of the season adorned with lights and ornaments."],
      hard: ["Traditionally evergreen, this emoji embodies the spirit of resilience in winter's embrace."],
      expert: ["Adorned with baubles and lights, spreading cheer and warmth in its branches."],
    }
  },
  "bauble": {
    image: "https://discord.mx/RbvUEY4hgB.png",
    emoji: { name: 'bauble', id: '1177540297383755857' },
    hints: {
      easy: ["A small, spherical ornament that often decorates trees."],
      normal: ["Reflective and colorful, adds a touch of sparkle to holiday decor."],
      hard: ["Glistening and round"],
      expert: ["Adorn trees in an array of hues."],
    }
  },
  "gingerman": {
    image: "https://discord.mx/OLfFjcsaOO.png",
    emoji: { name: 'gingerman', id: '1177540295810879518' },
    hints: {
      easy: ["A cookie shaped like a person, often decorated with icing."],
      normal: ["A baked treat with raisin eyes and candy buttons."],
      hard: ["Baked to a golden hue."],
      expert: ["Edible canvas for icing creativity."],
    }
  },
  "snowflake": {
    image: "https://discord.mx/CwhlyjmR8z.png",
    emoji: { name: 'snowflake', id: '1177540302874091540' },
    hints: {
      easy: ["A delicate ice crystal that falls from the sky."],
      normal: ["It's a unique, six-sided creation of nature."],
      hard: ["Intricately designed, each one is a frozen work of art."],
      expert: ["Hexagonal crystals drift gently from above"],
    }
  },
  "snowman": {
    image: "https://discord.mx/HVaeIPDM0o.png",
    emoji: { name: 'snowman', id: '1177540297975148566' },
    hints: {
      easy: ["A jolly figure made of snow, with a carrot for a nose."],
      normal: ["Three snowballs stacked with a top hat and a scarf."],
      hard: ["Frosty's kin, assembled from snow, adorned with winter garb."],
      expert: ["Crafted with a carrot nose and coal eyes."],
    }
  },
  "stocking": {
    image: "https://discord.mx/5QI25ShzL0.png",
    emoji: { name: 'stocking', id: '1177540300458180658' },
    hints: {
      easy: ["Hung by the fireplace, often filled with tiny treats."],
      normal: ["Hung with care, it holds small treasures, a holiday's secret stash."],
      hard: ["It's a traditional Christmas decoration filled with surprises."],
      expert: ["It's a festive container, often bulging with surprises, dangling from the mantelpiece."],
    }
  },
  "gift": {
    image: "https://discord.mx/29qoKemLPg.png",
    emoji: { name: 'gift', id: '1177540304467935314' },
    hints: {
      easy: ["A wrapped present often given during celebrations."],
      normal: ["Often found under a christmas tree"],
      hard: ["Wrapped in colorful paper, it holds the joy of surprises."],
      expert: ["During Black Friday, these are snagged at slashed prices, perfect for others."],
    }
  },
  "mitten": {
    image: "https://discord.mx/Pdnq2QPwJQ.png",
    emoji: { name: 'mitten', id: '1177540298851749929' },
    hints: {
      easy: ["A hand-covering for warmth."],
      normal: ["Keeps hands warm and snug in chilly weather."],
      hard: ["Winter comfort and coziness."],
      expert: ["Symbolizes protection against the cold with a cozy embrace."],
    }
  },
  "wreath": {
    image: "https://discord.mx/PzVv5R8F2F.png",
    emoji: { name: 'wreath', id: '1177540301460611083' },
    hints: {
      easy: ["A circular decoration often hung on doors."],
      normal: ["Made of evergreen branches, it signifies unity and eternity."],
      hard: ["A traditional ornament embodying the cyclical nature of seasons."],
      expert: ["Symbolizes welcome and festive spirit."],
    }
  },
  "santa_hat": {
    image: "https://discord.mx/h2XxBesoEA.png",
    emoji: { name: 'santa_hat', id: '1177540305176772678' },
    hints: {
      easy: ["A red hat associated with a festive figure."],
      normal: ["Something red and has a triangular shape."],
      hard: ["Often worn by a certain jolly gift-giver."],
      expert: ["A crimson headpiece."],
    }
  },
  "bell": {
    image: "https://discord.mx/HIOqcDtmWP.png",
    emoji: { name: 'bell', id: '1177540306137268265' },
    hints: {
      easy: ["It makes a ringing sound when you shake it."],
      normal: ["A metallic object that produces chimes when struck."],
      hard: ["A hollow metallic sphere."],
      expert: ["Resonates with a cheerful sound."],
    }
  },
};

(async ()=>{
  for (let item of Object.keys(code_values)) {
    const image = code_values[item].image;
    if(!image) throw new Error("Missing image for code value!");
    code_values[item].image = await Canvas.loadImage(image);
  }
})()

const generateComponents = (emojis, rowSize = 5) => {
  if(emojis.length > Math.min(5*rowSize, 25)) throw new Error("Too many emojis!");
  const row = (ri) => Math.ceil(emojis.length / rowSize) === 1 ? emojis.length 
    : (Math.ceil(emojis.length / rowSize) === ri + 1) ? emojis.length - (Math.ceil(emojis.length / rowSize) - 1) * rowSize : rowSize;

  let itemId = -1;
  return Array.from({ length: Math.ceil(emojis.length / rowSize) }, (_, ri) => ({
    type: 1,
    components: Array.from({ length: row(ri) }, (_, i) => (itemId++, { type: 2, style: 2, emoji: { name: emojis[itemId].name, id: emojis[itemId].id }, customId: `input_${emojis[itemId].name}` }))
  }))
}

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pickRand = (arr) => arr[Math.floor(Math.random() * arr.length)];

const getHint = (code, difficulty) => {
  if (!code_values.hasOwnProperty(code)) return `ERROR: It's the \`${code}\``;
  if (!code_values[code].hints.hasOwnProperty(difficulty)) return `Difficulty Error: Choose \`${code}\``;

  const hint = pickRand(code_values[code].hints[difficulty]);
  return hint;
}

const genCodeImage = (code, currentCode) => {
  const codeCircleRadius = 15;
  const marginTB = 20;
  const marginLR = 20;

  const canvas = Canvas.createCanvas(code.length*(codeCircleRadius*2)+code.length*(marginLR*2), codeCircleRadius*2+marginTB*2);
  const context = canvas.getContext("2d");

  // Draw code backgrond
  context.fillStyle = colors.code_bg;
  context.fillRect(0, 0, canvas.width, 70);

  // Draw code input circles
  context.fillStyle = colors.code_input;
  for (let i = 0; i < code.length; i++) {
    if (i < currentCode.length && typeof currentCode[i] == 'string') {
      context.drawImage(code_values[currentCode[i]].image, marginLR+codeCircleRadius + i * ((marginLR*2) + codeCircleRadius * 2) - codeCircleRadius, marginTB+codeCircleRadius - codeCircleRadius, codeCircleRadius * 2, codeCircleRadius * 2);
      continue;
    }
    const x = marginLR+codeCircleRadius + i * ((marginLR*2) + codeCircleRadius * 2);
    const y = marginTB+codeCircleRadius;
    context.beginPath();
    context.arc(x, y, codeCircleRadius, 0, Math.PI * 2);
    context.fill();
    context.closePath();
  }

  return canvas.toBuffer();
}

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      enabled: true,
      description: 'Guess the code to the workshop!',
      options: [
        {
          name: "difficulty",
          description: "The difficulty of the code.",
          type: 3,
          required: true,
          choices: [
            { name: "Easy", value: "easy" },
            { name: "Normal", value: "normal" },
            { name: "Hard", value: "hard" },
            { name: "Expert", value: "expert" }
          ],
        },
      ],
      category: "Games",
    })
  }

  async run(ctx) {
    const difficulty = ctx.interaction.options.getString("difficulty") || "normal";
    const gameSettings = difficulties[difficulty];

    let codeLength = randInt(...gameSettings.minMax);
    if (codeLength > 25) codeLength = 25;
    if (codeLength < 3) codeLength = 3;
    const code = Array.from({ length: codeLength }, () => pickRand(Object.keys(code_values)));

    const embed = new ctx.EmbedBuilder()
      .setTitle(":lock: Crack the Code")
      .setColor("#88C9F9")
      .setDescription("What's the combination to the workshop?\n\nHints:\n"+code.map((x,i)=> `${i+1}. ${getHint(x, difficulty)}`).join("\n"))
      .setImage(`attachment://crack-the-code.png`)
      .setThumbnail("https://discord.mx/buk4GFvw4A.png")
      .setFooter({text: `You only have ${gameSettings.time/1000/60} minutes to crack it.` });

    let components = generateComponents(Object.values(code_values).map(x=>x.emoji), 3);
    components.push({ type: 1, components: [] });
    components[components.length-1].components.push({ type: 2, style: 1, label: "⌫", customId: `action_backspace` });
    components[components.length-1].components.push({ type: 2, style: 4, label: "Clear", customId: `action_clear` });

    const msg = await ctx.sendMsg({
      embeds: [embed],
      files: [{attachment: genCodeImage(code, []), name: "crack-the-code.png"}],
      components,
    });
    
    const timeLeft = Date.now() + 120000;
    const collector = msg.createMessageComponentCollector({
      filter: (inter) =>
        inter.user.id === ctx.interaction.user.id &&
        (inter.customId.startsWith("action_") || inter.customId.startsWith("input_")),
      time: 120_000,
    });
    let triesLeft = gameSettings.attempts;

    collector.on("end", (_, reason) => {
      let embed2 = new ctx.EmbedBuilder()
        .setTitle("Yikes")
        .setColor("Red")
        .setDescription(`You ran out of time.\n\nWant to play again? Run the command again!`);
      if (reason === "fail")
        embed2 = new ctx.EmbedBuilder()
          .setTitle("Yikes")
          .setColor("Red")
          .setDescription(`You ran out of attempts. The correct code was ${code.map((x) => `<:${code_values[x].emoji.name}:${code_values[x].emoji.id}>`).join(" ")}.\n\nWant to play again? Run the command again!`);
      else if (reason === "success")
        embed2 = new ctx.EmbedBuilder()
          .setTitle("Nice job")
          .setColor("Green")
          .setDescription(`You successfully cracked the code with ${triesLeft} attempt${triesLeft == 1 ? "" : "s"} left`);

      msg.edit({ embeds: [embed, embed2], components: [], });
    });

    let guessed = [];
    let lastInteraction = Date.now();
    collector.on("collect", (interaction) => {
      lastInteraction = Date.now();
      if (Date.now() - lastInteraction > 3000) return interaction.reply({ content: "You're going too fast! Slow down.", ephemeral: true });
      if (interaction.customId.startsWith("action_")) {
        if (interaction.customId === "action_backspace") {
          if (guessed.length > 0) guessed.pop();
        } else if (interaction.customId === "action_clear") {
          guessed = [];
        }

        interaction.deferUpdate();
        msg.edit({
          files: [{attachment: genCodeImage(code, guessed), name: "crack-the-code.png"}],
        });
        return;
      }

      const id = interaction.customId.split("_").slice(1).join("_");
      guessed.push(id);

      if (guessed.length >= codeLength) {
        let correct = true;
        for (let i = 0; i < codeLength; i++) {
          if (guessed[i] !== code[i]) {
            correct = false;
            break;
          }
        }

        if (correct) {
          interaction.deferUpdate();
          msg.edit({ files: [{attachment: genCodeImage(code, guessed), name: "crack-the-code.png"}] });
          collector.stop("success");
        } else {
          triesLeft--;
          if (triesLeft > 0) {
            guessed = [];
            msg.edit({ files: [{attachment: genCodeImage(code, guessed), name: "crack-the-code.png"}] });
            interaction.reply({
              embeds: [
                new ctx.EmbedBuilder()
                  .setTitle("Try Again")
                  .setColor("Orange")
                  .setDescription(`You still have ${triesLeft} attempts and time ends <t:${Math.floor((Date.now()+(timeLeft-Date.now()))/1000)}:R>, to guess the correct one.`),
              ],
              ephemeral: true,
            });
          } else {
            interaction.deferUpdate();
            collector.stop("fail");
          }
        }
        return;
      }

      interaction.deferUpdate();
      msg.edit({
        files: [{attachment: genCodeImage(code, guessed), name: "crack-the-code.png"}],
      });
    });
  }
}