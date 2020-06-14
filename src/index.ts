import * as Discord from 'discord.js';
import {prefix, token, deleteTimer} from '../config.json';
import {deleteMessage} from './utils';
import Command from './Command';
import SkeletronClient from './SkeletronClient';

const client = new SkeletronClient({});

const cooldowns: Discord.Collection<
  string,
  Discord.Collection<string, number>
> = new Discord.Collection();

client.on('ready', () => {
  console.log('Client is ready!');
});

client.on('message', message => {
  if (message.author.bot) return;

  let commandType: string | undefined;

  for (const prefixes of client.prefixes) {
    if (message.content.startsWith(prefixes[1].get('name') + prefix)) {
      commandType = prefixes[1].get('name') as string;
    }
  }

  if (typeof commandType === 'undefined') return;

  const args: string[] = message.content
    .slice(commandType.length + prefix.length)
    .split(/ +/);

  const _commandName: string | undefined = args.shift();
  if (!_commandName) return;
  const commandName: string = _commandName.toLowerCase();

  const possibleCommands:
    | Discord.Collection<string, string | Command>
    | undefined = client.prefixes.get(commandType);
  if (typeof possibleCommands === 'undefined') return;

  const command = (possibleCommands.get(commandName) ||
    possibleCommands.find((cmd: string | Command) => {
      if (typeof cmd === 'string') return false;
      if (cmd.aliases && cmd.aliases.includes(commandName)) return true;
      else return false;
    })) as Command;

  if (command === null) return;

  if (command.guildOnly && message.channel.type !== 'text') {
    return message.reply('Sorry, you can only use that command on servers!');
  }

  if (
    command.adminRequired &&
    !(message.member === null) &&
    !message.member.hasPermission('ADMINISTRATOR')
  ) {
    return message.reply("You don't have adequate permissions!");
  }

  if (command.argsRequired && !args.length) {
    let reply = `You didn't provide the necessary arguments, ${message.author}!`;

    if (command.usage) {
      reply += `\nThe proper usage would be: \`${commandType}${prefix}${command.name} ${command.usage}\``;
    }

    return message.channel.send(reply);
  }

  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Discord.Collection());
  }

  const now = Date.now();
  const timestamps:
    | Discord.Collection<string, number>
    | undefined = cooldowns.get(command.name);

  const cooldownAmount = command.cooldown * 1000;

  if (!(typeof timestamps === 'undefined')) {
    if (!timestamps.has(message.author.id)) {
      timestamps.set(message.author.id, now);
      setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    } else {
      const userCooldown: number | undefined = timestamps.get(
        message.author.id
      );

      if (typeof userCooldown === 'number') {
        const expirationTime = userCooldown + cooldownAmount;
        if (now < expirationTime) {
          const timeLeft = (expirationTime - now) / 1000;
          return message.reply(
            `Please wait ${timeLeft.toFixed(1)} before trying again`
          );
        }
      }

      timestamps.set(message.author.id, now);
      setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
    }
  }

  try {
    command.execute(message, args);
    return;
  } catch (error) {
    console.error(error);
    message
      .reply(
        'Sorry, something went wrong! If the issue persists, please contact a developer.'
      )
      .then((msg: Discord.Message | Discord.Message[]) => {
        if (message.channel.type !== 'dm') {
          deleteMessage(msg);
        }
      });
    message.delete({timeout: deleteTimer}).then(msg => {
      if (message.channel.type !== 'dm') {
        msg.delete({timeout: deleteTimer});
      }
    });
    return;
  }
});

client.login(token);
process.on('unhandledRejection', console.error);
