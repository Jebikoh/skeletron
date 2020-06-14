import * as fs from 'fs';
import * as Discord from 'discord.js';
import Command from './Command';
import commandConfig from '../commandConfig.json';

export const commandCfg: {
  [index: string]: {
    prefix: string;
    group: string;
  };
} = commandConfig;

export default class SkeletronClient extends Discord.Client {
  prefixes: Discord.Collection<
    string,
    Discord.Collection<string, string | Command>
  >;
  constructor(props: Discord.ClientOptions) {
    super(props);
    this.prefixes = new Discord.Collection();
    const commandFolders: string[] = fs.readdirSync('./src/commands');

    for (const folder of commandFolders) {
      const commands: Discord.Collection<
        string,
        string | Command
      > = new Discord.Collection();
      const commandFiles: string[] = fs
        .readdirSync(`./src/commands/${folder}`)
        .filter(file => file.endsWith('.ts'));
      for (const file of commandFiles) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const command: Command = require(`./commands/${folder}/${file}`);
        commands.set(command.name, command);
      }
      this.prefixes.set(commandCfg[folder].prefix, commands);
      commands.set('name', commandCfg[folder].prefix);
    }
  }
}
