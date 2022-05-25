import { App } from "../typings/";
import * as figlet from "figlet";

export let app: App = {
  name: "Фиглет",
  type: 3,
  run: async (interaction, _client, f) => {
    let text = await (await interaction.channel?.messages.fetch(
      interaction.targetId
    ))!.content;

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
