import * as Path from "https://deno.land/std@0.84.0/path/mod.ts";
import { eventHandlers, EventHandlers, Message } from "https://deno.land/x/discordeno@10.3.0/mod.ts";

const decode = TextDecoder.prototype.decode.bind(new TextDecoder("utf-8"));
const encode = TextEncoder.prototype.encode.bind(new TextEncoder());

export interface CommanderOptions {
  root: string,
  eventHandlers?: EventHandlers,
  prefix: string,
};

export interface CommandInfo {
  name: string
};

export class Command {
  commandName: string;
  commandInfo: CommandInfo;

  constructor(info?: CommandInfo) {
    this.commandInfo = info ?? { name: this.constructor.name.toLowerCase() };
    this.commandName = this.commandInfo.name;
  }

  run(msg: Message, args: string[]) {}
};

export class CommandList {
  commands: Command[];

  constructor(commands: Command[] = []) {
    this.commands = commands;
  }

  getCommandByName(command: string): Command | void {
    for (const cmd of this.commands) {
      if (cmd.commandName === command) return cmd;
    }
  }
  getCommandByIndex(command: number): Command {
    return this.commands[command];
  }

  run(command: number, msg: Message, args: string[]): void;
  run(command: string, msg: Message, args: string[]): void;
  run(command: string | number, msg: Message, args: string[]): void {
    let cmd;
    if (typeof command === "string") {
      cmd = this.getCommandByName(command);
    } else if (typeof command === "number") {
      cmd = this.getCommandByIndex(command);
    }

    if (!cmd) return;

    cmd.run(msg, args);
  }

  push(command: Command) {
    this.commands.push(command);
  }
};

export default class Commander {
  commandpath: string;
  options: CommanderOptions;
  commandList: CommandList;
  
  constructor(path: string = "./commands", options: CommanderOptions = { root: ".", prefix: "rl!" }) {
    this.commandpath = Path.join(options.root, path);
    this.options = options;
    this.commandList = new CommandList();
  }

  updateOptions(options: CommanderOptions) {
    this.options = options;
  }

  setPrefix(prefix: string) {
    this.options.prefix = prefix;
  }

  setOverides(evh: EventHandlers) {
    this.options.eventHandlers = evh;
  }

  handleMessage(message: Message) {
    const content = message.content.replace(this.options.prefix, "").trim();

    if (!message.content.startsWith(this.options.prefix)) return;

    const args = content.split(" ");
    const cmd: string = (args.shift() as string).toLowerCase();

    this.commandList.run(cmd, message, args);
  }

  async loadCommands() {
    for await (const dirEntry of Deno.readDir(this.commandpath)) {
      if (dirEntry.isFile) {
        const path = Path.toFileUrl(Path.resolve(this.commandpath, dirEntry.name)).href;
        const module = await import(path);
        const cmd = module?.default;

        this.commandList.push(new (cmd as any)());
      }
    }
  }

  attach(): EventHandlers {
    this.loadCommands();
    return Object.assign({
      messageCreate: this.handleMessage.bind(this)
    } as EventHandlers, this.options?.eventHandlers ?? {});
  }
};