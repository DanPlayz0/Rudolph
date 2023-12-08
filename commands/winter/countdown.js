// fireplace with numbers till christmas/new years (depending on what was setup)
const Command = require('@structures/framework/Command');
const moment = require('moment'); require('moment-timezone');
module.exports = class extends Command {
  constructor(client) {
    super(client, {
      enabled: true,
      description: 'Create a countdown to a winter event.',
      options: [
        {
          type: 1,
          name: 'view',
          description: 'View the current countdowns.',
        },
        {
          type: 2,
          name: 'christmas',
          description: 'Set a channel to countdown the days till christmas.',
          options: [
            {
              type: 1,
              name: 'start',
              description: 'The channel to start the countdown in.',
              options: [
                {
                  type: 7,
                  name: 'channel',
                  description: 'The channel to send the countdown to.',
                  required: true,
                  channel_types: [0, 5],
                },
                {
                  type: 3,
                  name: 'timezone',
                  description: 'The timezone to countdown in.',
                  required: true,
                  autocomplete: true,
                }
              ]
            },
            {
              type: 1,
              name: 'stop',
              description: 'Stop the christmas countdown.',
            }
          ]
        },
        {
          type: 2,
          name: 'new-years',
          description: 'Set a channel to countdown the days till new years.',
          options: [
            {
              type: 1,
              name: 'start',
              description: 'The channel to start the countdown in.',
              options: [
                {
                  type: 7,
                  name: 'channel',
                  description: 'The channel to send the countdown to.',
                  required: true,
                  channel_types: [0, 5],
                },
                {
                  type: 3,
                  name: 'timezone',
                  description: 'The timezone to countdown in.',
                  required: true,
                  autocomplete: true,
                }
              ]
            },
            {
              type: 1,
              name: 'stop',
              description: 'Stop the new years countdown.',
            }
          ]
        },
      ],
      category: "Winter",
    })
  }

  async run(ctx) {
    let guildSettings = await ctx.database.findOne('countdowns', { guildId: ctx.guild.id });
    if(!guildSettings) {
      if (ctx.args._subcommand == 'view') return ctx.sendMsg('There are no countdowns setup for this server.');
      guildSettings = {
        guildId: ctx.guild.id, 
        new_years: { enabled: false, channel_id: null, timezone: null }, 
        christmas: { enabled: false, channel_id: null, timezone: null } 
      };
      await ctx.database.insertOne('countdowns', guildSettings);
    }

    switch (ctx.args._group || ctx.args._subcommand) {
      case 'view': return this.view(ctx, guildSettings);
      case 'christmas': {
        switch (ctx.args._subcommand) {
          case 'start': return this.christmasStart(ctx, guildSettings);
          case 'stop': return this.christmasStop(ctx, guildSettings);
          default: break;
        }
      }
      case 'new-years': {
        switch (ctx.args._subcommand) {
          case 'start': return this.newYearsStart(ctx, guildSettings);
          case 'stop': return this.newYearsStop(ctx, guildSettings);
          default: break;
        }
      }
      default: ctx.interaction.editReply({ content: 'Well, it seems like the sub-command has not been programmed in.' })
    }
  }

  async view(ctx, guildSettings) {
    let christmasString = 'Disabled';
    if (guildSettings.christmas.enabled) christmasString = `Channel: <#${guildSettings.christmas.channel_id}>\nTimezone: ${guildSettings.christmas.timezone} (<t:${getMidnightUnixSecFloor(guildSettings.christmas.timezone)}:R>)`;

    let newYearsString = 'Disabled';
    if (guildSettings.new_years.enabled) newYearsString = `Channel: <#${guildSettings.new_years.channel_id}>\nTimezone: ${guildSettings.new_years.timezone} (<t:${getMidnightUnixSecFloor(guildSettings.new_years.timezone)}:R>)`;

    const embed = new ctx.EmbedBuilder()
      .setTitle('Countdowns')
      .setDescription('Here are the countdowns for this server.')
      .setColor("#88C9F9")
      .setFields([
        {
          name: 'Christmas',
          value: christmasString,
          inline: false
        },
        {
          name: 'New Years',
          value: newYearsString,
          inline: false
        },
      ])
      .setTimestamp();

    ctx.sendMsg({ embeds: [embed] });
    return;
  }

  async christmasStart(ctx, guildSettings) {
    if (guildSettings.christmas.enabled) {
      sendEnabledEmbed(ctx, 'christmas', guildSettings.christmas.channel_id, guildSettings.christmas.timezone);
      return;
    }

    let channel = ctx.args.getChannel('channel');
    if (!channel) return ctx.sendMsg('You must provide a channel to send the countdown to.');
    let timezone = ctx.args.getString('timezone');
    if (!timezone) return ctx.sendMsg('You must provide a timezone to countdown in.');

    if (!moment.tz.zone(timezone)) return ctx.sendMsg('You must provide a valid timezone to countdown in.');
    const canSend = await channel.send(`The christmas countdown has been enabled. The countdown will start <t:${getMidnightUnixSecFloor(timezone)}:R>. If you wish to change the timezone, please stop the countdown and start it again with the new timezone.`).catch(err => null);
    if (!canSend) return ctx.sendMsg('I am missing permissions in that channel.');

    await ctx.database.updateOne('countdowns', { guildId: ctx.guild.id }, { $set: { christmas: { enabled: true, channel_id: channel.id, timezone: timezone } } });
    return sendEnabledEmbed(ctx, 'christmas', channel.id, timezone, false);
  }

  async christmasStop(ctx, guildSettings) {
    if(!guildSettings.christmas.enabled) return ctx.sendMsg('The christmas countdown is already disabled.');
    await ctx.database.updateOne('countdowns', { guildId: ctx.guild.id }, { $set: { christmas: { enabled: false, channel_id: null, timezone: null } } });
    return ctx.sendMsg(`The christmas countdown has been disabled.`);
  }

  async newYearsStart(ctx, guildSettings) {
    if (guildSettings.new_years.enabled) {
      sendEnabledEmbed(ctx, 'new years', guildSettings.new_years.channel_id, guildSettings.new_years.timezone);
      return;
    }

    let channel = ctx.args.getChannel('channel');
    if (!channel) return ctx.sendMsg('You must provide a channel to send the countdown to.');
    let timezone = ctx.args.getString('timezone');
    if (!timezone) return ctx.sendMsg('You must provide a timezone to countdown in.');

    if (!moment.tz.zone(timezone)) return ctx.sendMsg('You must provide a valid timezone to countdown in.');
    const canSend = await channel.send(`The new years countdown has been enabled. The countdown will start <t:${getMidnightUnixSecFloor(timezone)}:R>. If you wish to change the timezone, please stop the countdown and start it again with the new timezone.`).catch(err => null);
    if (!canSend) return ctx.sendMsg('I am missing permissions in that channel.');
    
    await ctx.database.updateOne('countdowns', { guildId: ctx.guild.id }, { $set: { new_years: { enabled: true, channel_id: channel.id, timezone: timezone } } });
    return sendEnabledEmbed(ctx, 'new years', channel.id, timezone, false);
  }

  async newYearsStop(ctx, guildSettings) {
    if(!guildSettings.new_years.enabled) return ctx.sendMsg('The new years countdown is already disabled.');
    await ctx.database.updateOne('countdowns', { guildId: ctx.guild.id }, { $set: { new_years: { enabled: false, channel_id: null, timezone: null } } });
    return ctx.sendMsg(`The new years countdown has been disabled.`);
  }

  runAutocomplete(ctx) {
    const focused = ctx.args.getFocused(true);
    if (focused.name == "timezone") {
      const zones = moment.tz.names();
      if (!focused.value) return [
        'America/New_York',    'America/Los_Angeles',
        'Europe/London',       'Europe/Paris',
        'Asia/Tokyo',          'Asia/Dubai',
        'Australia/Sydney',    'America/Chicago',
        'America/Toronto',     'Europe/Berlin',
        'Asia/Shanghai',       'Asia/Singapore',
        'Australia/Melbourne', 'America/Mexico_City',
        'America/Sao_Paulo',   'Europe/Madrid',
        'Asia/Hong_Kong',      'Europe/Rome',
        'Africa/Johannesburg', 'America/Buenos_Aires',
        'Asia/Kolkata',        'Asia/Istanbul',
        'Pacific/Auckland',    'Europe/Amsterdam',
        'America/Denver'
      ].map((zone) => ({ name: zone, value: zone })).slice(0,25);
      const results = zones.filter((zone) => zone.toLowerCase().includes(focused.value.toLowerCase())).slice(0,25);
      return results.map((zone) => ({ name: zone, value: zone })).slice(0,25) || [];
    }
  }
}

const getMidnightUnixSecFloor = (timezone) => {
  if (!timezone) return null;
  if (!moment.tz.zone(timezone)) return null;
  const midnight = moment.tz(timezone).startOf('day').add(1, 'day');
  const dateMidnight = new Date(midnight.toISOString(true));
  return Math.floor(dateMidnight.getTime()/1000);
}


const sendEnabledEmbed = (ctx, type, channel_id, timezone, error = true) => {
  const embed = new ctx.EmbedBuilder()
    .setTitle(`${type.toProperCase()} Countdown`)
    .setDescription(error ? `Try stopping the countdown prior to changing values. The current configuration is below.` : `The countdown has been enabled. The configuration you've set is below`)
    .setFields([
      {
        name: 'Channel',
        value: `<#${channel_id}>`,
        inline: true
      },
      {
        name: 'Timezone',
        value: timezone,
        inline: true
      },
      {
        name: 'Announcement Time',
        value: '12:00 AM (<t:'+getMidnightUnixSecFloor(timezone)+':R>)',
        inline: true
      },
    ])
    .setColor(error ? "#FF5555" : "#88C9F9")
    .setTimestamp();
  return ctx.sendMsg({ embeds: [embed] });
}