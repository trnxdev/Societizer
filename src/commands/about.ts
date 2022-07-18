import { Command } from "../typings/";
import { version as dVersion } from "discord.js";
export let command: Command = {
  name: "about",
  emoji: "ℹ️",
  category: "Информация",
  description: "Информация о боте + сообщение создателя",
  options: [],
  run: async (interaction, client, f) => {
    return interaction.reply({
      embeds: [
        new f.embed()
          .setTitle("ℹ️ | Информация о боте")
          .addFields([
            { name: "Версия discord.js", value: `v${dVersion}`, inline: true },
            { name: "Версия MariaDB", value: "10.0.28", inline: true },
            { name: "Версия Node.js", value: process.version, inline: true },
            { name: "ЯП", value: "TypeScript, JavaScript, SQL", inline: true },
            {
              name: "Хоститься на",
              value: "Сервере моего Друга",
              inline: true,
            },
            { name: "Хоститься с помощью", value: "Docker", inline: true },
            { name: "Создатель", value: "Tiratira#1111", inline: true },
            {
              name: "Репозиторий",
              value: "[GitHub](https://github.com/TiranexDev/Societizer)",
              inline: true,
            },
            {
              name: "Сообщение от создателя",
              value:
                "Спасибо вам за использование бота, если вы нашли ошибку или опечатку, пожалуйста, напишите мне в личные сообщения, я потратил очень много время на данного бота, надеюсь с этим ботом у вас будут только хорошие воспоминания.",
              inline: true,
            },
          ])
          .setColor(f.colors.default)
          .setTimestamp()
          .setFooter({
            text: `Спасибо вам за использование данного бота ❤️`,
            iconURL: client.user!.displayAvatarURL(),
          }),
      ],
    });
  },
};
