import { Command } from "../typings/";
import {
  ActionRowBuilder,
  ButtonBuilder,
  GuildMember,
  Message,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import db from "../db/init";

export let command: Command = {
  name: "config",
  description: "Изменить настройки сервера",
  category: "Утилиты",
  emoji: "🔧",
  options: [],
  run: async (interaction, _client, f) => {
    db.promise()
      .query(
        `SELECT * FROM guildconfig WHERE guildID='${interaction.guild!.id}'`
      )
      .then(async (r: any) => {
        let data = r[0][0];

        if (!(<GuildMember>interaction.member).permissions.has("Administrator"))
          return interaction.reply({
            embeds: [
              f.aembed(
                "Ошибка",
                "У вас нет прав для изменения настроек бота для этого сервера",
                f.colors.error
              ),
            ],
          });

        if (!interaction.deferred)
          await interaction.deferReply({ ephemeral: true });

        let buttonSuggestions = new f.ButtonBuilder()
          .setLabel("Предложения (/suggest)")
          .setStyle(f.ButtonStyle.Primary)
          .setCustomId("suggestions.bot");

        let row = new f.ActionRowBuilder().addComponents(buttonSuggestions);

        let m = (await interaction.editReply({
          embeds: [
            f.aembed(
              "Настройки сервера",
              `Настройки сервера "${
                interaction.guild!.name
              }", выберите категорию.`,
              f.colors.default
            ),
          ],
          components: [row],
        })) as Message;

        let selectionController = m.createMessageComponentCollector({
          filter: (i) => i.user!.id === interaction.user!.id,
        });

        selectionController.on("collect", async (i) => {
          if (i.customId === "suggestions.bot") {
            let toggleSuggestions = new f.ButtonBuilder()
              .setLabel(
                `${
                  data.closedSuggestions == 1 ? "Включить" : "Выключить"
                } предложения`
              )
              .setStyle(f.ButtonStyle.Primary)
              .setCustomId("suggestions.bot.toggle");
            let selectChannel = new f.ButtonBuilder()
              .setLabel("Создать канал для предложений")
              .setStyle(f.ButtonStyle.Primary)
              .setCustomId("suggestions.bot.create");
            let timeActive = new f.ButtonBuilder()
              .setLabel("Поставить время действия")
              .setStyle(f.ButtonStyle.Primary)
              .setCustomId("suggestions.bot.timeActive");

            let action = new f.ActionRowBuilder<ButtonBuilder>().addComponents([
              toggleSuggestions,
              selectChannel,
              timeActive,
            ]);

            await i.deferUpdate();
            (<Message>await i.editReply({
              embeds: [
                f.aembed(
                  "🔧 | Настройки сервера",
                  "Выберите действие для предложений от бота.",
                  f.colors.default
                ),
              ],
              components: [action],
            }))
              .createMessageComponentCollector({
                filter: (i) => i.user!.id == interaction.user!.id,
              })
              .on("collect", async (i) => {
                if (i.customId == "suggestions.bot.create") {
                  let row1 =
                    new ActionRowBuilder<TextInputBuilder>().addComponents([
                      new TextInputBuilder()
                        .setLabel("Название канала")
                        .setCustomId("suggestion.channel.name")
                        .setPlaceholder("Например: Предложения")
                        .setMinLength(1)
                        .setMaxLength(200)
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true),
                    ]);

                  let row2 =
                    new ActionRowBuilder<TextInputBuilder>().addComponents([
                      new TextInputBuilder()
                        .setLabel("Описание канала")
                        .setCustomId("suggestion.channel.description")
                        .setPlaceholder(
                          "Например: Канал для предложений от бота"
                        )
                        .setMaxLength(1024)
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(false),
                    ]);

                  let modalKa = new ModalBuilder()
                    .setTitle("Создание канала для предложений")
                    .setCustomId("create.suggestion.channel")
                    .addComponents([row1, row2]);

                  await i.showModal(modalKa);
                } else if (i.customId == "suggestions.bot.toggle") {
                  db.promise()
                    .query(
                      `UPDATE guildconfig SET closedSuggestions=${
                        data.closedSuggestions == 1 ? 0 : 1
                      } WHERE guildID='${interaction.guild!.id}'`
                    )
                    .then(async () => {
                      await i.reply({
                        embeds: [
                          f.aembed(
                            "🔧 | Настройки сервера",
                            `Предложения для сервера были успешно ${
                              data.closedSuggestions == 1
                                ? "включены"
                                : "выключены"
                            }.`,
                            f.colors.default
                          ),
                        ],
                        ephemeral: true,
                      });
                    });
                } else if (i.customId == "suggestions.bot.timeActive") {
                  let modalKa = new ModalBuilder()
                    .setTitle("Время активности предложений")
                    .setCustomId("suggestion.time.active")
                    .addComponents(
                      new ActionRowBuilder<TextInputBuilder>().addComponents([
                        new TextInputBuilder()
                          .setLabel("Время активности предложений")
                          .setCustomId("suggestion.time.active")
                          .setPlaceholder(
                            "Например: 2 Часа 30 Минут, если хотите чтобы оно было вечено введите 0"
                          )
                          .setMinLength(1)
                          .setMaxLength(20)
                          .setStyle(TextInputStyle.Paragraph)
                          .setRequired(true),
                      ])
                    );

                  await i.showModal(modalKa);
                }
              });
          }
        });
      });
  },
};
