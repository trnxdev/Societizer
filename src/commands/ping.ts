// Импортируем типизацию
import { Command } from "../typings/";

export let command: Command = {
  name: "ping",
  emoji: "🏓",
  description: "Тестовое сообщение + пинг бота",
  category: "Информация",
  options: [],
  run: async (interaction, client, f) => {
    return interaction.reply({
      embeds: [
        f.aembed(
          "🏓 | Понг!",
          `Пинг бота составляет ${client.ws.ping}`,
          f.colors.default
        ),
      ],
    });
  },
};
