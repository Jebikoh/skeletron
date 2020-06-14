import * as Discord from 'discord.js';

export default class Command {
  name: string;
  description: string;
  aliases: string[] | undefined;
  usage: string;
  guildOnly: boolean;
  adminRequired: boolean;
  argsRequired: boolean;
  cooldown: number;
  execute: (message: Discord.Message, args?: string[]) => void;
  constructor(props: {
    name: string;
    description: string;
    aliases: string[] | undefined;
    usage: string;
    guildOnly: boolean;
    adminReq: boolean;
    argsRequired: boolean;
    cooldown: number;
    execute: (message: Discord.Message, args?: string[]) => void;
  }) {
    this.name = props.name;
    this.description = props.description;
    this.aliases = props.aliases;
    this.usage = props.usage;
    this.guildOnly = props.guildOnly;
    this.adminRequired = props.adminReq;
    this.execute = props.execute;
    this.argsRequired = props.argsRequired;
    this.cooldown = props.cooldown;
  }
}
