import { Command } from "../typings/";
import { version } from "discord.js";
import moment from "moment";
import "moment-duration-format";
// @ts-expect-error
import cpuStat from "cpu-stat";
import { data as ClusterData } from 'discord-hybrid-sharding'

export let command: Command = {
  name: "stats",
  description: "Отправляет информацию о боте",
  category: "Информация",
  options: [],
  emoji: "🤖",
  run: async (interaction, client, f) => {
    let ram = Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + " MB";

    let botuptime: string = moment
      .duration(
        <any>await client.cluster.evalOnManager("process.uptime()"),
        "seconds"
      )
      .format(" D[ Д], H[ Ч], m[ М]");

    let guilds = "";
    
    await client.cluster.broadcastEval(`this.guilds.cache.size`).then(results => guilds = results.reduce((prev, val) => prev + val, 0));

    let hostOs = "[Raspbian GNU/Linux 11](https://www.raspberrypi.com/software/)";
    let host = "[Raspberry Pi 400](https://www.raspberrypi.com/products/raspberry-pi-400/)";
    let docker = "[Docker](https://www.docker.com/)";
    let node = `[Node.js ${process.version}](https://nodejs.org/)`;
    let api = `[discord.js v${version}](https://discord.js.org/)`;
    let clustering = "[discord-hybrid-sharding](https://npmjs.com/package/discord-hybrid-sharding)";

    cpuStat.usagePercent((_e: unknown, percent: number, _seconds: unknown) => {
      const embed = new f.embed()
        .setTitle(`📦 | Статистика бота`)
        .addField(`Исп. ОЗУ`, ram, true)
        .addField(`Исп. Процессора`, `${percent.toFixed(2)}%`, true)
        .addField(`Время работы`, `${botuptime}`, true)
        .addField(`ОС`, hostOs, true)
        .addField(`Хост`, host, true)
        .addField(`Запущен с помощью`, docker, true)
        .addField(`ЯП`, node, true)
        .addField(`Библиотека`, api, true)
        .addField(`API Кластеризаций`, clustering, true)
        .addField(`Кластеров`, String(ClusterData.TOTAL_SHARDS), true)
        .addField(`Серверов`, guilds, true)
        .setColor(f.colors.default)
        .setFooter({
          text: `С любовью Tiratira#6387`,
          iconURL: client.user!.displayAvatarURL(),
        })
        .setTimestamp();

      interaction.reply({ embeds: [embed] });
    });
  },
};
