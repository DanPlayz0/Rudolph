const Command = require('@structures/framework/Command');
const { createCanvas, loadImage, registerFont } = require("canvas");
const { join } = require("path");

registerFont(join(process.cwd(), "assets", "fonts", "GreatVibes-Regular.ttf"), {
  family: "GreatVibes"
});

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      enabled: true,
      description: 'Generate a custom greeting card.',
      options: [
        {
          name: "text",
          description: "The text you wish to add to the card",
          type: 3,
          required: true,
        },
        {
          name: "to",
          description: "Who is greeting card going to?",
          type: 6,
          required: true,
        },
        {
          name: "top-image-url",
          description: "This image will be the image at the top",
          type: 3,
          required: false,
        },
      ],
      category: "Decorate",
    })
  }

  async run(ctx) {
    try {
      const text = ctx.args.getString("text");
      const topImage = ctx.args.getString("top-image-url");
      const to = ctx.args.getUser("to");
      let loadedTopImg = null;
      if (topImage) loadedTopImg = await loadImage(topImage);
      const bgImg = await loadImage("https://discord.mx/B832gFQyCv.jpg");
      const bgOverlayImg = await loadImage("https://discord.mx/G5e7cnevOT.png");

      const canvas = createCanvas(bgImg.width, bgImg.height);
      const context = canvas.getContext("2d");

      context.drawImage(bgImg, 0, 0);

      context.fillStyle = "black";
      context.font = "90px GreatVibes";

      context.fillText(`To: ${to.username}`, 270, 200);
      context.fillText(`From: ${ctx.member.user.username}`, 260, 300);

      const lines = await this.wrapText(context, text, 920);

      context.fillStyle = "black";
      context.font = "110px GreatVibes";
      context.fillText(lines ? lines.join("\n") : " ", 270, 500);

      context.drawImage(bgOverlayImg, 0, 0);
      if(loadedTopImg) context.drawImage(loadedToImg, 1120, 100, 250, 250);

      ctx.sendMsg({
        files: [
          {
            name: "greeting-card.png",
            attachment: canvas.toBuffer(),
          },
        ],
      });
    } catch (err) {
      console.error("Greeting card", err);
      return ctx.sendMsg("Invalid image.");
    }
  }

  async wrapText(ctx, text, maxWidth) {
    return new Promise((resolve) => {
      if (ctx.measureText(text).width < maxWidth) return resolve([text]);
      if (ctx.measureText("W").width > maxWidth) return resolve(null);
      const words = text.split(" ");
      const lines = [];
      let line = "";
      while (words.length > 0) {
        let split = false;
        while (ctx.measureText(words[0]).width >= maxWidth) {
          const temp = words[0];
          words[0] = temp.slice(0, -1);
          if (split) {
            words[1] = `${temp.slice(-1)}${words[1]}`;
          } else {
            split = true;
            words.splice(1, 0, temp.slice(-1));
          }
        }
        if (ctx.measureText(`${line}${words[0]}`).width < maxWidth) {
          line += `${words.shift()} `;
        } else {
          lines.push(line.trim());
          line = "";
        }
        if (words.length === 0) lines.push(line.trim());
      }
      return resolve(lines);
    });
  }
}