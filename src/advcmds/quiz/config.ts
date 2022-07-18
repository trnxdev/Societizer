import {
  Client,
  ChatInputCommandInteraction,
  InteractionType,
  Message,
  ButtonStyle,
  ButtonBuilder,
} from "discord.js";
import db from "../../db/init";
import { CommandFunctions } from "../../typings";
import edit from "./config_edit";

export default async (
  interaction: ChatInputCommandInteraction,
  client: Client,
  f: CommandFunctions
) => {
  let id = interaction.options.get("айди", true);

  db.promise()
    .query(`SELECT * FROM quiz WHERE quizID = '${id}'`)
    .then(async (res: any) => {
      let data = res[0][0];

      if (data.author != interaction.user.id)
        return interaction.reply({
          embeds: [
            f.aembed(
              "ошибка",
              "Вы не можете управлять этой викториной, поскольку вы не владелец этой викторины",
              f.colors.error
            ),
          ],
          ephemeral: true,
        });

      if (!interaction.deferred)
        await interaction.deferReply({ ephemeral: true });

      const button = new f.ButtonBuilder()
        .setCustomId("toggle_quiz")
        .setLabel(`${data.closed == 0 ? "Выключить" : "Включить"} викторину`)
        .setStyle(ButtonStyle.Primary);

      const button2 = new f.ButtonBuilder()
        .setCustomId("delete_quiz")
        .setLabel("Удалить викторину")
        .setStyle(ButtonStyle.Danger);

      const button3 = new f.ButtonBuilder()
        .setCustomId("clear_data")
        .setLabel("Очистить данные")
        .setStyle(ButtonStyle.Primary);

      const button4 = new f.ButtonBuilder()
        .setCustomId("edit_quiz")
        .setLabel("Редактировать викторину")
        .setStyle(ButtonStyle.Primary);

      const button5 = new f.ButtonBuilder()
        .setCustomId("guild_only")
        .setLabel("Только на этом сервере")
        .setStyle(ButtonStyle.Primary);

      const row = new f.ActionRowBuilder<ButtonBuilder>().addComponents([
        button,
        button2,
        button3,
        button4,
        button5,
      ]);

      const message = (await interaction.editReply({
        embeds: [f.aembed("Выберите ваше действие", "", f.colors.default)],
        components: [row],
      })) as Message;

      const collector = message.createMessageComponentCollector();

      collector.on("collect", async (i) => {
        if (i.user.id != interaction.user.id) return;

        if (i.type === InteractionType.MessageComponent) {
          await i.deferUpdate();
          switch (i.customId) {
            case "toggle_quiz":
              db.promise()
                .query(
                  `UPDATE quiz SET closed = '${
                    data.closed == 0 ? 1 : 0
                  }' WHERE quizID = '${id}'`
                )
                .then(async () => {
                  return await i.editReply({
                    content: null,
                    embeds: [
                      f.aembed(
                        "Успешно",
                        `Квиз "${
                          JSON.parse(data.quizData)[0].name
                        }" был успешно ${
                          data.closed == 1 ? "выключен" : "включён"
                        }`,
                        f.colors.default
                      ),
                    ],
                    components: [],
                  });
                });
              break;
            case "delete_quiz":
              db.promise()
                .query(`DELETE FROM quiz WHERE quizID = '${id}'`)
                .then(async () => {
                  return await i.editReply({
                    content: null,
                    embeds: [
                      f.aembed(
                        "Успешно",
                        `Квиз "${
                          JSON.parse(data.quizData)[0].name
                        }" был успешно удалён`,
                        f.colors.default
                      ),
                    ],
                    components: [],
                  });
                });
              break;
            case "clear_data":
              db.promise()
                .query(`UPDATE quiz SET completed='0' WHERE quizID = '${id}'`)
                .then(async () => {
                  return await i.editReply({
                    content: null,
                    embeds: [
                      f.aembed(
                        "Успешно",
                        `Данные квиза "${
                          JSON.parse(data.quizData)[0].name
                        }" были успешно очищены`,
                        f.colors.default
                      ),
                    ],
                    components: [],
                  });
                });
              break;
            case "guild_only":
              if (data.guildOnly != interaction.guild!.id)
                db.promise()
                  .query(
                    `UPDATE quiz SET guildOnly = '${
                      interaction.guild!.id
                    }' WHERE quizID = '${id}'`
                  )
                  .then(async () => {
                    return await i.editReply({
                      content: null,
                      embeds: [
                        f.aembed(
                          "Успешно",
                          `Квиз "${
                            JSON.parse(data.quizData)[0].name
                          }" был успешно обновлён, и теперь работает только на этом сервере`,
                          f.colors.default
                        ),
                      ],
                      components: [],
                    });
                  });
              else
                db.promise()
                  .query(
                    `UPDATE quiz SET guildOnly = NULL WHERE quizID = '${id}'`
                  )
                  .then(async () => {
                    return await i.editReply({
                      content: null,
                      embeds: [
                        f.aembed(
                          "Успешно",
                          `Квиз "${
                            JSON.parse(data.quizData)[0].name
                          }" был успешно обновлён, и теперь работает везде`,
                          f.colors.default
                        ),
                      ],
                      components: [],
                    });
                  });
              break;
            case "edit_quiz":
              edit(interaction, f, client, res[0][0]);
              break;
          }
        }
      });
    });
};
