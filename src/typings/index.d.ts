import { Client as ClusterClient } from "discord-hybrid-sharding";
import {
  CommandInteraction,
  Collection,
  MessageEmbed,
  MessageButton,
  MessageActionRow,
  ColorResolvable,
  ContextMenuInteraction,
  AppicationCommandOptionType,
} from "discord.js";
import { Client } from "discord.js";

export interface EventRun {
  (client: Client, ...args: any[]): void;
}

export interface Config {
  token: string;
  db_host: string;
  db_user: string;
  db_password: string;
  db_database: string;
  db_port: number;
  bitlyToken: string;
}

// db = database; DC = Disabled Commands; comming soon...
// export interface dbDC {
//     guildID: string;
//     disabledCMDS: Command["name"][];
// }

export interface Event {
  name: string;
  run: EventRun;
}

export interface App {
  name: string;
  type: AppicationCommandOptionType;
  run: AppRun;
}

export interface AppRun {
  (
    interaction: ContextMenuInteraction,
    client: Client,
    f: CommandFunctions
  ): void;
}

type CommandCategory =
  | "Информация"
  | "Развлечения"
  | "Модерация"
  | "Социалные"
  | "Утилиты";

export interface Command {
  name: string;
  category: CommandCategory;
  emoji: string;
  description: string;
  options: BaseApplicationCommandOptionsData[];
  disabled?: boolean;
  run: CommandRun;
}

export interface CommandFunctions {
  aembed: (
    title: string,
    description: string,
    color: ColorResolvable,
    imgif?: string
  ) => MessageEmbed;
  embed: typeof MessageEmbed;
  colors: {
    default: ColorResolvable;
    error: ColorResolvable;
  };
  parseRus: (input: string) => Promise<string>;
  urlRegex: RegExp;
  MessageButton: typeof MessageButton;
  MessageActionRow: typeof MessageActionRow;
  handleError: (interaction: CommandInteraction, err: Error, colors: CommandFunctions["colors"]) => void;
  parseTime: (input: string, outputType?: "ms" | "s" | "m" | "h" | "d") => number;
}

export interface CommandRun {
  (interaction: CommandInteraction, client: Client, f: CommandFunctions): void;
}

interface Ans {
  text: string;
  correct: boolean;
}

interface QuizData {
  question: string;
  answers: Ans[];
  img?: string; 
}

interface QuizDetails extends QuizData {
  name: string;
  description: string;
  img?: string;
}

declare module "discord.js" {
  interface Client {
    cluster: ClusterClient;
    commands: Collection<string, Command>;
    events: Collection<string, Event>;
    apps: Collection<string, App>;
  }
}
