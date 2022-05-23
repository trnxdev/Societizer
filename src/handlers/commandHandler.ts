// Импортиуем дискорд штучки
import {
  Client,
  Guild,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
} from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
// Импортируем конфиг
import config from "../config";
import aembed from "../utils/embedBuilder";
import { parseRus } from "../utils/translate";
import { Command, CommandFunctions } from "../typings";
import handleError from '../utils/handleError';

// Создём рест клиент
const rest = new REST({ version: "10" }).setToken(config.token);

// Экспортируем хандлер для отправки команд
export default (client: Client, cmds: Command[]) => {
  client.guilds.cache.forEach((g) => {
    setTimeout(() => {
      ThisSync(client, g, cmds);
    }, 0);
  });
};

// Экспортируем функцию ThisSync для отправки команд
export let ThisSync = (client: Client, g: Guild, cmds: Command[]) => {
  return rest.put(Routes.applicationGuildCommands(client.user!.id, g.id), {
    body: cmds,
  });
};

export let fA: CommandFunctions = {
  aembed: aembed, // Фунцкия чтобы не создавать каждый раз новый эмбед
  embed: MessageEmbed,
  colors: {
    default: "#7289DA",
    error: "#F04747",
  },
  // @ts-ignore
  parseRus: parseRus,
  urlRegex:
    /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi,
  MessageButton: MessageButton,
  MessageActionRow: MessageActionRow,
  handleError: handleError
};
