const Event = require('@structures/framework/Event');

module.exports = class extends Event {
  constructor(client) {
    super(client, {
      name: 'guildDelete',
      enabled: true,
    });
  }

  async run(client, guild) {
    if(!guild.available) return;
  
    const db = await client.database.findOne('guilds', { id: guild.id });
    if (db) await client.database.updateOne('guilds', {id: guild.id}, {$set:{botInServer: true, discord: { name: guild.name, icon: guild.icon }}});
    else await client.database.insertOne('guilds', { id: guild.id, botInServer: true, discord: { name: guild.name, icon: guild.icon } });
  }
};