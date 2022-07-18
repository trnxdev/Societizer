import { Command } from "../typings/";

export let command: Command = {
  name: "avatar",
  emoji: "🖼️",
  category: "Информация",
  description: "Получи аватарку пользователя!",
  options: [
    {
      name: "пользователь",
      description: "Имя пользователя",
      type: 6,
      required: false,
      autocomplete: false,
    },
  ],
  run: (interaction, _client, f) => {
    let user =
      interaction.options.getUser("пользователь", false) || interaction.user;

    interaction.reply({
      embeds: [
        f.aembed(
          `🖼️ | Аватарка ${
            user?.bot || user?.system ? "бота" : "пользователя"
          } ${user.tag}`,
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
