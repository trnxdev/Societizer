import { Command } from "../typings/";

export let command: Command = {
  name: "coinflip",
  category: "Развлечения",
  description: "Подбросить монетку",
  emoji: "🪙",
  options: [
    {
      name: "аноимно",
      description: "подбросить для себя",
      type: 5,
      required: false,
    },
  ],
  run: async (interaction, _client, f) => {
    return interaction.reply({
      embeds: [
        f.aembed(
          "🪙 | Орёл или решка",
          `Вам выпала ${Math.floor(Math.random() * 2) == 1 ? "Орёл" : "Решка"}`,
          f.colors.default
        ),
      ],
      ephemeral: interaction.options.getBoolean("аноимно", false) || false,
    });
  },
};
