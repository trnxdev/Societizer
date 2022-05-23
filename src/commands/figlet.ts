import { Command } from "../typings";
import * as figlet from "figlet";

export let command: Command = {
  name: "figlet",
  description: "Показывает текст в фиглете",
  category: "Развлечения",
  emoji: "📋",
  options: [
    {
      name: "текст",
      description: "Текст для обработки",
      required: true,
      type: 3,
    },
  ],
  run: async (interaction, _client, f) => {
    let text = interaction.options.getString("текст", true);

    if (text.match(/[\u0400-\u04FF]/))
      return interaction.reply({
        embeds: [
          f.aembed(
            "ошибка",
            "Нельзя использовать кириллицу, мы работаем над исправлением этой ошибки.",
            f.colors.error
          ),
        ],
        ephemeral: true,
      });

    figlet.text(
      text,
      {
        font: "Standard",
        horizontalLayout: "default",
        verticalLayout: "default",
        width: 80,
        whitespaceBreak: true,
      },
      (err, data) => {
        if (err)
          return interaction.reply({
            embeds: [
              f.aembed(
                "ошибка",
                `Не удалось показать текст в фиглете, причина: ${err.message}`,
                f.colors.error
              ),
            ],
            ephemeral: true,
          });
        return interaction.reply({
          content: `\`\`\`${data}\`\`\``,
          ephemeral: true,
        });
      }
    );
  },
};
