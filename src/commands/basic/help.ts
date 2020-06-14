import {prefix} from '../../../config.json';
import {commandCfg} from '../../SkeletronClient';
import {Message, MessageEmbed} from 'discord.js';
import * as fs from 'fs';

module.exports = {
  name: 'help',
  description: 'Lists all commands, or specific info for a command',
  aliases: ['commands'],
  usage: 'b?help {command}',
  cooldown: 0,
  guildOnly: false,
  adminReq: false,
  argsRequired: false,
  execute(message: Message, args: string[]) {
    const commands = new Map();
    const aliases = new Map();

    const embedInitial = new MessageEmbed()
      .setTitle('**List of Commands:**')
      .setDescription(
        `\nUse \`${commandCfg['basic'].prefix}${prefix}help [command name]\` to get info on a specific command.`
      )
      .setColor(0x00ae86)
      .setTimestamp();

    const commandFolders = fs.readdirSync('./src/commands/');
    for (const folder of commandFolders) {
      const commandList = [];
      const commandFiles = fs
        .readdirSync(`./src/commands/${folder}`)
        .filter(file => file.endsWith('.ts'));
      for (const file of commandFiles) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const command = require(`../${folder}/${file}`);
        commandList.push(command.name);
        command.name;
        if (!commands.has(command.name)) {
          commands.set(command.name, command);
          command.aliases.forEach((element: string) => {
            aliases.set(element, command);
          });
        }
      }
      const groupConfig = commandCfg[folder];
      const embedFieldBody = '`' + commandList.join('`, `') + '`';
      embedInitial.addField(
        groupConfig.group + ' (`' + groupConfig.prefix + prefix + '`)',
        embedFieldBody
      );
    }

    if (!args.length) {
      return message.author
        .send(embedInitial)
        .then(() => {
          if (message.channel.type === 'dm') return;
          message.reply("Help is in your DM's!");
        })
        .catch(error => {
          console.error(error);
          message.reply(
            "I can't seem like I can't DM you! Do you have DMs disabled?"
          );
        });
    }

    const name = args[0].toLowerCase();
    const command = commands.get(name) || aliases.get(name);

    if (!command) {
      return message.reply("Sorry, that's not a valid command");
    }

    const embed = new MessageEmbed()
      .setTitle(`**${command.name}**`)
      .setColor(0x00ae86)
      .setTimestamp();
    if (command.aliases) embed.addField('**Aliases:**', command.aliases);
    if (command.description)
      embed.addField('**Description:**', command.description);
    if (command.usage) embed.addField('**Usage:**', command.usage);
    if (command.cooldown) embed.addField('**Cooldown:**', command.cooldown);

    message.channel.send(embed);
    return;
  },
};
