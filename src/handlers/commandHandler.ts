// Импортиуем дискорд штучки
import {
  Client,
  EmbedBuilder,
  Guild,
  ButtonStyle,
  ButtonBuilder,
  ActionRowBuilder,
} from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
// Импортируем конфиг
import config from "../config";
import aembed from "../utils/embedBuilder";
import { parseRus } from "../utils/translate";
import { Command, CommandFunctions } from "../typings";
import handleError from "../utils/handleError";
import { parseTime } from "../utils/parseTime";
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
  embed: EmbedBuilder,
  colors: {
    default: "#7289DA",
    error: "#F04747",
  },
  // @ts-ignore
  parseRus: parseRus,
  urlRegex:
    /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/,
  ButtonBuilder: ButtonBuilder,
  ActionRowBuilder: ActionRowBuilder,
  handleError: handleError,
  parseTime: parseTime,
  ButtonStyle: ButtonStyle,
};
