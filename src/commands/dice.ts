import { Command } from "../typings";

export let command: Command = {
  name: "dice",
  emoji: "🎲",
  category: "Развлечения",
  description: "Брось кубик",
  options: [],
  run: async (interaction, _client, f) => {
    return interaction.reply({
      embeds: [
        f.aembed(
          `🎲 | Бросок кубика`,
          `Вам выпала цифра: ${Math.floor(Math.random() * 6) + 1}`,
          f.colors.default
        ),
      ],
    });
  },
};
