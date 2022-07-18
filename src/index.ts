import { data, Client as ClusterClient } from "discord-hybrid-sharding";
import { Client, Collection } from "discord.js";
import config from "./config";
import runEventHandler from "./handlers/eventHandler";

// Инитилизируем клиента
const client = new Client({
  shards: data.SHARD_LIST,
  shardCount: data.TOTAL_SHARDS,
  intents: ["Guilds"], // Можно также использовать [32767] (Все)
});

// Создаем коллекциий для клиента
client.cluster = new ClusterClient(client);
client.commands = new Collection();
client.apps = new Collection();
client.events = new Collection();

// Запуск эвент хандлера, обязательно чтобы было после инитилизаций киента и его коллекций!
runEventHandler(client);

client.login(config.token);
