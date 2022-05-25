import { Command } from "../typings/";

import create from "../advcmds/quiz/create";
import config from "../advcmds/quiz/config";
import list from "../advcmds/quiz/list";
import play from "../advcmds/quiz/play";
import info from "../advcmds/quiz/info";

export let command: Command = {
  name: "quiz",
  emoji: "❓",
  description: "Викторина",
  category: "Социалные",
  options: [
    {
      name: "info",
      description: "Информация о викторине",
      type: 1,
      options: [
        {
          name: "айди",
          description: "Идентификатор викторины",
          type: 4,
          required: true,
        },
      ],
    },
    {
      name: "create",
      description: "Создать викторину",
      type: 1,
      options: [],
    },
    {
      name: "config",
      description: "Настройки викторины",
      type: 1,
      options: [
        {
          name: "айди",
          description: "Идентификатор викторины",
          type: 4,
          required: true,
        },
      ],
    },
    {
      name: "play",
      description: "Играть в викторину",
      type: 1,
      options: [
        {
          name: "айди",
          description: "Айди викторины",
          type: 4,
          required: true,
        },
      ],
    },
    {
      name: "list",
      description: "Список викторин",
      type: 1,
      options: [
        {
          name: "пользователь",
          description: "Пользователь о котором вы хотите узнать викторины",
          type: 6,
          required: false,
          autocomplete: false,
        },
      ],
    },
  ],
  run: async (interaction, client, f) => {
    switch (interaction.options.getSubcommand()) {
      case "create":
        return create(interaction, f);
        break;
      case "config":
        return config(interaction, client, f);
        break;
      case "list":
        return list(interaction, f);
        break;
      case "play":
        return play(interaction, client, f);
        break;
      case "info":
        return info(interaction, client, f);
        break;
      default:
        return interaction.reply({
          embeds: [
            f.aembed(
              "ошибка",
              "Неверное использование команды",
              f.colors.error
            ),
          ],
          ephemeral: true,
        });
        break;
    }
  },
};
