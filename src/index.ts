import { data, Client as ClusterClient } from "discord-hybrid-sharding";
import { Client, Collection } from "discord.js";
import config from "./config";
import def, { getConnection } from './db/init'
import runEventHandler from "./handlers/eventHandler";
import discordModals from "discord-modals";
// @ts-ignore
let db = def

// Инитилизируем клиента
const client = new Client({
  shards: data.SHARD_LIST,
  shardCount: data.TOTAL_SHARDS,
  intents: ["GUILDS", "GUILD_MEMBERS"], // Можно также использовать [32767] (Все)
});

discordModals(client); // Добавляем модалки

// Создаем коллекциий для клиента
client.cluster = new ClusterClient(client);
client.commands = new Collection();
client.apps = new Collection();
client.events = new Collection();

// Запуск эвент хандлера, обязательно чтобы было после инитилизаций киента и его коллекций!
runEventHandler(client);

client.login(config.token);

let exit = () => client.destroy(); // Останавливаем клиента

process.on("SIGINT", () => exit()); // SIGINT = Ctrl+C/Ctrl+D
process.on("SIGTERM", () => exit()); // SIGTERM = docker stop

// Обработчик ошибок

let handleError = (err: Error) => {
  (err.message == "Can't add new command when connection is in closed state" ? db = getConnection() : console.log(err.message));
}

process.on("uncaughtException", (err) => handleError(err));
process.on("unhandledRejection", (err) => handleError(<Error>err));
