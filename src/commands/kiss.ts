import { Command } from "../typings/";

export let command: Command = {
  name: "kiss",
  emoji: "💋",
  category: "Развлечения",
  description: "Поцеловать пользователя.",
  options: [
    {
      name: "пользователь",
      description: "Пользователь, которого вы хотите поцеловать.",
      required: true,
      type: 6,
    },
  ],
  run: async (interaction, client, f) => {
    let user = interaction.options.getUser("пользователь");

    if (user!.id == client.user!.id)
      return interaction.reply({
        embeds: [
          f.aembed(
            `💋 | Поцелуй`,
            `Спасибо что хотите поцеловать меня, но я не могу это сделать, если меня спалят... то мне пиз-`,
            f.colors.error
          ),
        ],
        ephemeral: true,
      });

    if (user!.id == interaction.user!.id)
      return interaction.reply({
        embeds: [
          f.aembed(`💋 | Поцелуй`, `Себя поцеловать, ну...`, f.colors.error),
        ],
        ephemeral: true,
      });

    return interaction.reply({
      embeds: [
        f.aembed(
          `💋 | Поцелуй ${user!.bot || user!.system ? "... бота? Ок..." : ""}`,
          `<@${interaction.user.id}> поцеловал ${
            user!.bot || user!.system ? "**бота**" : `пользователя`
          } <@${user!.id}>`,
          f.colors.default
        ),
      ],
    });
  },
};
