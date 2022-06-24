import { Command } from "../typings/";
import wiki from "wikipedia";

wiki.setLang("ru");

export let command: Command = {
  name: "wiki",
  emoji: "🔍",
  category: "Информация",
  description: "Искать информацию о данных которая есть на wikipedia.org",
  options: [
    {
      name: "запрос",
      description: "Запрос который вы хотите посмотреть",
      type: 3,
      required: true,
    },
  ],
  run: async (interaction, client, f) => {
    let query = interaction.options.getString("запрос", true);
    wiki
      .page(query)
      .then(async (result) => {
        let summary = await result.summary();

        return interaction.reply({
          embeds: [
            new f.embed()
              .setTitle(`🔍 | Ваш запрос wikipedia: ${query}`)
              .setURL(result.canonicalurl)
              .setDescription(summary.description)
              .setColor(f.colors.default)
              .setThumbnail(summary.originalimage.source)
              .setFooter({
                text: `Источник: wikipedia.org: ${summary.titles.display}`,
                iconURL: client.user!.displayAvatarURL(),
              })
              .setColor(f.colors.default)
              .setTimestamp(),
          ],
          ephemeral: true,
        });
      })
      .catch(() => {
        return interaction.reply({
          embeds: [
            f.aembed(
              `ошибка`,
              `Не удалось найти ваш запрос "${query}" в википедии`,
              f.colors.error
            ),
          ],
          ephemeral: true,
        });
      });
  },
};
