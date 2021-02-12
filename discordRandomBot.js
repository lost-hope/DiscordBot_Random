const fs = require('fs');
const Discord = require('discord.js');
const moment = require('moment');
const {
  prefix,
  token
} = require('./config.json');
const client = new Discord.Client();

client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./cmds').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./cmds/${file}`);
  client.commands.set(command.name, command);
}

const log = message => {
  console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] ${message}`);
};

client.once('ready', () => {
  console.log('Ready!');
});

client.on('message', message => {

  if (message.author.bot) {

  } else {
    if (message.content.startsWith(prefix)) {
      const commandBody = message.content.slice(prefix.length);
      const args = commandBody.split(' ');
      const commandName = args.shift().toLowerCase();
      const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
      if (!command) {
        message.channel.send(`Unkown Command. Type ${prefix}help to see all available command.`)
        log(`unkown command: ${message}`);
      }
      try {
        command.execute(message, args);
      } catch (error) {
        console.error(error);
        log(`Error while excecuting Command §${commandName}`);
      }
    }else {
      log(`Something else: ${message}`);
    }

  }
});

client.login(token);
