import { App } from "../typings/";

export let app: App = {
  name: "Аватарка Автора",
  type: 3,
  run: async (interaction, _client, f) => {
    let user = await (await interaction.channel?.messages.fetch(
      interaction.targetId
    ))!.author;

    interaction.reply({
      embeds: [
        f.aembed(
          `🖼️ | Аватарка ${user?.bot ? "бота" : "пользователя"} ${user.tag}`,
          `[Нажмите на текст чтобы посмотреть аватарку](${user.displayAvatarURL(
            {
              dynamic: true,
              size: 2048,
            }
          )})`,
          f.colors.default,
          user.displayAvatarURL()
        ),
      ],
      ephemeral: true,
    });
  },
};
