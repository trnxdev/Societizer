import { Command } from "../typings/";
import { BitlyClient } from "bitly";
import config from "../config";
// @ts-ignore
import TinyURL from "tinyurl";

const bitly = new BitlyClient(config.bitlyToken);

export let command: Command = {
  name: "shortlink",
  emoji: "🔗",
  description: "Преобразует ссылку в короткую",
  options: [
    {
      name: "ссылка",
      description: "Ссылка которую вы хотите преобразовать",
      required: true,
      type: 3,
    },
    {
      name: "сервис",
      description:
        "Сервис который вы хотите использовать для преобразования ссылки",
      type: 3,
      choices: [
        {
          name: "bitly",
          value: "bitly",
        },
        {
          name: "TinyURL",
          value: "tinyurl",
        },
      ],
      required: true,
    },
  ],
  category: "Утилиты",
  run: async (interaction, client, f) => {
    let url = interaction.options.getString("ссылка", true);
    let service = interaction.options.getString("сервис", true);

    if (!f.urlRegex.test(url))
      return interaction.reply({
        embeds: [f.aembed(`Ошибка`, `Неверный формат ссылки`, f.colors.error)],
        ephemeral: true,
      });

    let result =
      service == "bitly"
        ? (await bitly.shorten(url)).link
        : await TinyURL.shorten(url);

    return interaction.reply({
      embeds: [
        new f.embed()
          .setTitle(`🔗 | Ссылка`)
          .setColor(f.colors.default)
          .setDescription(
            `Выша ссылка была успешно преобразована: ${url} => ${result}`
          )
          .setTimestamp()
          .setFooter({
            text: `API: ${
              service == "bitly"
                ? "bitly (bit.ly, npmjs.com/bitly)"
                : "TinyURL (tinyurl.com, npmjs.com/tinyurl)"
            }`,
            iconURL: client.user!.displayAvatarURL(),
          }),
      ],
      ephemeral: true,
    });
  },
};
