const Event = require('@structures/framework/Event');
const cron = require('node-schedule');
const moment = require('moment');const { time } = require('discord.js');
 require('moment-timezone');

module.exports = class extends Event {
  constructor(client) {
    super(client, {
      enabled: true,
    });
  }

  async run(client) {
    console.log(`Logged in as ${client.user.tag}`);

    async function setupInit() {
      // Set the game as the "Watching for tags"
      client.user.setActivity(`the snow • /help`, { type: 3 });
    }

    setupInit();
    this.activityInterval = setInterval(setupInit, 90000);

    // Setup the API.
    // if(!client.shard || !client.shardId) {
    //   client.site = new (require("@structures/restapi/index.js"))(client);
    //   client.site.listen(client.config.restapi.port);
    // }
    
    // if(client.guilds.cache.has('783178035322159156')) client.guilds.cache.get('783178035322159156').commands.set(client.commands.map(m=>m.commandData))
    // client.application.commands.set(client.commands.map(m=>m.commandData));

    cron.scheduleJob('0 * * * *', async function() {
      let timeInZone = {};
      const christmasCountdowns = await client.database.find('countdowns', {"christmas.enabled": true});

      for (let countdown of christmasCountdowns) {
        if (timeInZone[countdown.christmas.timezone] && timeInZone[countdown.christmas.timezone] != '12:00 am') continue;
        
        let guild = client.guilds.cache.get(countdown.guildId);
        if (!guild) continue;
        let channel = guild.channels.cache.get(countdown.christmas.channel_id);
        if (!channel) continue;

        let zoneTime = moment.tz(countdown.christmas.timezone);
        if (!timeInZone[countdown.christmas.timezone]) timeInZone[countdown.christmas.timezone] = zoneTime.format('hh:mm a');
        if (timeInZone[countdown.christmas.timezone] != '12:00 am') continue;

        let christmas = moment.tz([zoneTime.year(),11,25,0,0,0], countdown.christmas.timezone);
        let diffChrist = christmas.diff(zoneTime, 'days');
        if (diffChrist <= 0) {
          await client.database.updateOne('countdowns', {guildId: countdown.guildId}, {$set: {"christmas.enabled": false}});
          channel.send(`🎄 **Christmas** ${diffChrist ? : 'is **TODAY**': `was **${diffChrist}** days ago`}! Disabling countdown, enable it again next year! (You can re-start it as early as the first of January)`);
          continue;
        }

        channel.send(`🎄 **Christmas** is **${diffChrist}** day${diffChrist==1 ? '' : 's'} away!`);
      }

      const newYearsCountdowns = await client.database.find('countdowns', {"new_years.enabled": true});
      for (let countdown of newYearsCountdowns) {
        if (timeInZone[countdown.new_years.timezone] && timeInZone[countdown.new_years.timezone] != '12:00 am') continue;
        
        let guild = client.guilds.cache.get(countdown.guildId);
        if (!guild) continue;
        let channel = guild.channels.cache.get(countdown.new_years.channel_id);
        if (!channel) continue;

        let zoneTime = moment.tz(countdown.new_years.timezone);
        if (!timeInZone[countdown.new_years.timezone]) timeInZone[countdown.new_years.timezone] = zoneTime.format('hh:mm a');
        if (timeInZone[countdown.new_years.timezone] != '12:00 am') continue;

        let newYears = moment.tz([zoneTime.year()+1,0,1,0,0,0], countdown.new_years.timezone);
        let diffYears = newYears.diff(zoneTime, 'days');
        if (diffYears <= 0) {
          await client.database.updateOne('countdowns', {guildId: countdown.guildId}, {$set: {"new_years.enabled": false}});
          channel.send(`🎉 **New Years** ${diffYears ? : 'is **TODAY**': `was **${diffYears}** days ago`}! Disabling countdown, enable it again next year! (You can re-start it as early as now)`);
          continue;
        }

        channel.send(`🎉 **New Years** is **${diffYears}** day${diffChrist==1 ? '' : 's'} away!`);
      }
    });
  }
}
