// Импортируем мэнеджер для создания кластеров
import { Manager } from "discord-hybrid-sharding";
import config from "./config";
import axios from "axios";

// Устанавливаем эвент с помощью которого был запущен бот (dev, production и т.д.)
process.env.NODE_ENV = process.env.npm_lifecycle_event;

// process.cwd() = process current working directory (текущая папка рабочего процесса)
// Можно также использовать __dirname, но typescript жалуется на него
const manager: Manager = new Manager(process.cwd() + "/dist/index.js", {
  // Важно! Не /src/index.ts а /dist/index.js
  totalShards: "auto",
  totalClusters: "auto",
  shardsPerClusters: 2,
  mode: "process",
  token: config.token,
  respawn: true,
});

manager.on("clusterCreate", (cluster) =>
  console.log(`[cluster.ts] Запущен кластер ${cluster.id}`)
);

// Запускаем мэнеджер кластеров
manager
  .spawn({ timeout: -1 })
  .then(() => {
    if (process.env.NODE_ENV != "dev")
      setTimeout(() => {
        monitoringSend();
      }, 2000);
  })
  .catch((err) =>
    console.log(
      `[cluster.ts] Ошибка запуска мэнеджера кластеров ${err.message}`
    )
  );

let monitoringSend = () => {
  manager
    .fetchClientValues("guilds.cache.size")
    .then(async (results) => {
      const totalServers = results.reduce(
        (acc, guildCount) => acc + guildCount,
        0
      );
      manager
        .broadcastEval((client) =>
          client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)
        )
        .then(async (results) => {
          const totalUsers = results.reduce(
            (acc, userCount) => acc + userCount,
            0
          );

          manager.fetchClientValues("user.id").then((r) => {
            // r[0] = айди бота
            axios
              .post(
                `https://api.server-discord.com/v2/bots/${r[0]}/stats`,
                {
                  servers: totalServers,
                  shards: manager.totalShards,
                },
                {
                  headers: {
                    Authorization: "SDC " + config.sdcAPI,
                  },
                }
              )
              .then((res) => {
                if (res.data.error)
                  return console.log(
                    `[cluster.ts] Ошибка отправки статистики на мониторинг (Ошибка сервера (SDC)) ${res.data.error.message}`
                  );
                console.log(
                  "[cluster.ts] Статистика отправлена на мониторинг (SDC)"
                );
              })
              .catch(() => {
                console.log(
                  "[cluster.ts] Ошибка отправки статистики на мониторинг (Ошибка подключения (SDC))"
                );
              });
          });
          axios
            .post(
              `https://api.boticord.top/v1/stats`,
              {
                servers: totalServers,
                users: totalUsers,
                shards: manager.totalShards,
              },
              {
                headers: {
                  Authorization: config.boticord,
                },
              }
            )
            .then((res) => {
              if (res.data.error) {
                console.log(
                  `[cluster.ts] Ошибка отправки статистики на мониторинг (Ошибка сервера (BotiCord)) ${res.data.error}`
                );
              } else {
                console.log("[cluster.ts] Статистика отправлена на мониторинг (BotiCord)");
              }
            })
            .catch(() => {
              console.log(
                "[cluster.ts] Ошибка отправки статистики на мониторинг (Ошибка подключения (BotiCord))"
              );
            });
        });
    })
    .catch((err) => {
      console.error(`[cluster.ts] Ошибка отправки статистики на мониторинг ${err.message}`);
    });
};

if (process.env.NODE_ENV != "dev")
  setInterval(() => {
    monitoringSend();
  }, 300000);

process.stdin.resume();
