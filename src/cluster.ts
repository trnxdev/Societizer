// Импортируем мэнеджер для создания кластеров
import { Manager } from "discord-hybrid-sharding";
import config from "./config";

// process.cwd() = process current working directory (текущая папка рабочего процесса)
// Можно также использовать __dirname, но typescript жалуется на него
const manager: Manager = new Manager(process.cwd() + "/dist/index.js", {
  // Важно! Не .ts а .js
  totalShards: "auto",
  shardsPerClusters: 2,
  mode: "process",
  token: config.token,
});

manager.on("clusterCreate", (cluster) =>
  console.log(`[cluster.ts] Запущен кластер ${cluster.id}`)
);

// Запускаем мэнеджер кластеров
manager.spawn({ timeout: -1 });
