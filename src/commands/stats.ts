import { Command } from "../typings/";
import { version } from "discord.js";
import moment from "moment";
import "moment-duration-format";
// @ts-expect-error
import cpuStat from "cpu-stat";
import { data as ClusterData } from "discord-hybrid-sharding";

export let command: Command = {
  name: "stats",
  description: "Отправляет информацию о боте",
  category: "Информация",
  options: [],
  emoji: "🤖",
  run: async (interaction, client, f) => {
    let botuptime: string = moment
      .duration(
        <any>await client.cluster.evalOnManager("process.uptime()"),
        "seconds"
      )
      .format(" D[ Д], H[ Ч], m[ М]");

    let guilds = 0;

    await client.cluster
      .broadcastEval(`this.guilds.cache.size`)
      .then(
        (results) => (guilds = results.reduce((prev, val) => prev + val, 0))
      );

    cpuStat.usagePercent((_e: unknown, percent: number, _seconds: unknown) => {
      interaction.reply({
        embeds: [
          new f.embed()
            .setTitle(`📦 | Статистика бота`)
            .addFields([
              {
                name: `Исп. ОЗУ`,
                value: `${Math.round(
                  process.memoryUsage().heapUsed / 1024 / 1024
                )} МБ`,
                inline: true,
              },
              {
                name: `Исп. Процессора`,
                value: `${percent.toFixed(2)}%`,
                inline: true,
              },
              { name: `Время работы`, value: botuptime, inline: true },
              { name: `ОС`, value: "Linux: Ubuntu", inline: true },
              { name: `Хост`, value: "Сервер моего друга", inline: true },
              {
                name: `Запущен с помощью`,
                value: "[Docker](https://docker.com/)",
                inline: true,
              },
              {
                name: `ЯП`,
                value: `[Node.js ${process.version}](https://nodejs.org/)`,
                inline: true,
              },
              {
                name: `Библиотека`,
                value: `[discord.js v${version}](https://discord.js.org/)`,
                inline: true,
              },
              {
                name: `API Кластеризаций`,
                value:
                  "[discord-hybrid-sharding](https://npmjs.com/package/discord-hybrid-sharding)",
                inline: true,
              },
              {
                name: `Кластеров`,
                value: String(ClusterData.TOTAL_SHARDS),
                inline: true,
              },
              { name: `Серверов`, value: String(guilds), inline: true },
            ])
            .setColor(f.colors.default)
            .setFooter({
              text: `С любовью Tiratira#1111`,
              iconURL: client.user!.displayAvatarURL(),
            })
            .setTimestamp(),
        ],
      });
    });
  },
};
