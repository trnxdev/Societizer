// Импортируем типизацию
import {
  Client,
  Interaction,
  InteractionType,
  TextInputBuilder,
  TextInputStyle,
  ModalBuilder,
  ModalSubmitInteraction,
  ButtonBuilder,
  Message,
  ChannelType,
  ActionRowBuilder,
} from "discord.js";
import { Event, Command } from "../typings";
// Функции
import db from "../db/init";
import { fA } from "../handlers/commandHandler";
import { parseTime } from "../utils/parseTime";

let data: any = {};

let basicQuestion = new TextInputBuilder()
  .setLabel("Введите вопрос")
  .setCustomId("quiz.create.qa.question")
  .setStyle(TextInputStyle.Short)
  .setMinLength(3)
  .setMaxLength(200)
  .setPlaceholder("Вопрос")
  .setRequired(true);
let wrongAnswers = new TextInputBuilder()
  .setLabel("Введите неверные ответы")
  .setCustomId("quiz.create.qa.wrong")
  .setStyle(TextInputStyle.Paragraph)
  .setMinLength(3)
  .setMaxLength(150)
  .setPlaceholder("Отделяйте с помощью ||")
  .setRequired(true);
let correctAnswer = new TextInputBuilder()
  .setLabel("Введите правильный ответ")
  .setCustomId("quiz.create.qa.correct")
  .setStyle(TextInputStyle.Paragraph)
  .setMinLength(3)
  .setMaxLength(100)
  .setPlaceholder("Правильный Ответ")
  .setRequired(true);
let imgB = new TextInputBuilder()
  .setLabel("Введите картинку")
  .setCustomId("quiz.create.img")
  .setStyle(TextInputStyle.Paragraph)
  .setMinLength(3)
  .setMaxLength(150)
  .setPlaceholder("Картинка")
  .setRequired(false);

let row1 = new ActionRowBuilder<TextInputBuilder>().addComponents([
  basicQuestion,
]);

let row2 = new ActionRowBuilder<TextInputBuilder>().addComponents([
  wrongAnswers,
]);

let row3 = new ActionRowBuilder<TextInputBuilder>().addComponents([
  correctAnswer,
]);

let row4 = new ActionRowBuilder<TextInputBuilder>().addComponents([imgB]);

const modalIze = new ModalBuilder()
  .setTitle("Добавление вопроса")
  .setCustomId("quiz.create.qa")
  .addComponents(row1, row2, row3, row4);

export let event: Event = {
  name: "interactionCreate",
  run: async (client: Client, interaction: Interaction) => {
    if (interaction.isChatInputCommand()) {
      let command = <Command>await client.commands.get(interaction.commandName);

      try {
        command.run(interaction, client, fA);
      } catch (e) {
        console.log(
          `[commands/${command.name}.ts, ${interaction.guild!.id}] ${
            (<Error>e).message
          }`
        );
      }
    } else if (
      interaction.type === InteractionType.MessageComponent &&
      interaction.isButton()
    ) {
      let id = interaction.message.id

      if (
        interaction.customId == "suggestion.like" ||
        interaction.customId == "suggestion.dislike"
      ) {
        let rating = interaction.customId == "suggestion.like" ? 1 : 0;

        db.promise()
          .query(`SELECT * FROM suggestions WHERE messageID = '${id}'`)
          .then(async (res: any) => {
            let signed = JSON.parse(res[0][0].userSigned);

            if (signed[interaction.user!.id] == rating)
              return interaction.reply({
                embeds: [
                  fA.aembed(
                    "Ошибка",
                    "Вы уже поставили эту оценку",
                    fA.colors.error
                  ),
                ],
                ephemeral: true,
              });

            signed[interaction.user!.id] = rating;

            db.promise()
              .query(
                `UPDATE suggestions SET userSigned='${JSON.stringify(
                  signed
                )}' WHERE messageID='${id}'`
              )
              .then(() => {
                return interaction.reply({
                  embeds: [
                    fA.aembed(
                      "Успешно",
                      `Ваш ${
                        rating == 1 ? "позитивный" : "негативный"
                      } голос засчитан!`,
                      fA.colors.default
                    ),
                  ],
                  ephemeral: true,
                });
              });
          });
      } else if (interaction.customId == "suggestion.stats") {
        db.promise()
          .query(`SELECT * FROM suggestions WHERE messageID = '${id}'`)
          .then(async (res: any) => {
            let signed = Object.values(JSON.parse(res[0][0].userSigned));
            let likes = signed.filter((n) => n == "1");
            let dislikes = signed.filter((n) => n == "0");

            return interaction.reply({
              embeds: [
                fA.aembed(
                  "📊 | Статистика",
                  `Голосов: ${signed.length}\nПозитивных: ${likes.length}\nНегативных: ${dislikes.length}`,
                  fA.colors.default
                ),
              ],
              ephemeral: true,
            });
          });
      }
    } else if (interaction.type === InteractionType.ModalSubmit) {
      let quizID = interaction.customId.split(".")[1];

      db.promise()
        .query(`SELECT * FROM quiz WHERE quizID = '${quizID}'`)
        .then(async (r: any) => {
          if ((<string>interaction.customId).startsWith("edit_name_vik")) {
            let newName = interaction.fields.getTextInputValue("new_name");

            let data = JSON.parse(r[0][0].quizData);

            const oldname = data[0].name;

            data[0].name = newName;

            db.promise()
              .query(
                `UPDATE quiz SET quizData = '${JSON.stringify(
                  data
                )}' WHERE quizID = '${quizID}'`
              )
              .then(() => {
                return interaction.reply({
                  content: null,
                  embeds: [
                    fA.aembed(
                      "Успешно",
                      `Название викторины с "${oldname}" было успешно изменено на "${newName}"`,
                      fA.colors.default
                    ),
                  ],
                  ephemeral: true,
                  components: [],
                });
              });
          } else if (
            (<string>interaction.customId).startsWith("edit_img_vik")
          ) {
            let newImg = interaction.fields.getTextInputValue("new_img");

            if (!fA.urlRegex.test(newImg))
              return interaction.reply({
                content: null,
                embeds: [
                  fA.aembed(
                    "Ошибка",
                    "Изображение викторины должно быть ссылкой.",
                    fA.colors.error
                  ),
                ],
                ephemeral: true,
              });

            let data = JSON.parse(r[0][0].quizData);

            const oldimg = data[0].img;

            data[0].img = newImg;

            db.promise()
              .query(
                `UPDATE quiz SET quizData = '${JSON.stringify(
                  data
                )}' WHERE quizID = '${quizID}'`
              )
              .then(() => {
                return interaction.reply({
                  content: null,
                  embeds: [
                    fA.aembed(
                      "Успешно",
                      `Ссылка на картинку викторины была успешно изменена с "${oldimg}" на "${newImg}"`,
                      fA.colors.default
                    ),
                  ],
                  components: [],
                  ephemeral: true,
                });
              });
          } else if (<string>interaction.customId == "quiz.create") {
            if (data[interaction.user.id] != null) {
              if (!interaction.deferred)
                await interaction.deferReply({ ephemeral: true });

              const buttonYes = new fA.ButtonBuilder()
                .setStyle(fA.ButtonStyle.Danger)
                .setLabel("Да")
                .setCustomId("button.yes.delete");
              const buttonNo = new fA.ButtonBuilder()
                .setStyle(fA.ButtonStyle.Danger)
                .setLabel("Нет")
                .setCustomId("button.no.delete");
              const buttonContinue = new fA.ButtonBuilder()
                .setStyle(fA.ButtonStyle.Danger)
                .setLabel("Нет, Продолжить создавать викторину")
                .setCustomId("button.continue.delete");

              const buttons =
                new ActionRowBuilder<ButtonBuilder>().addComponents([
                  buttonYes,
                  buttonNo,
                  buttonContinue,
                ]);

              let im = (await interaction.editReply({
                embeds: [
                  fA.aembed(
                    "Ошибка",
                    "Вы ещё не закончили с предыдущей викториной, хотите удалить предыдущию викторину?",
                    fA.colors.default
                  ),
                ],
                components: [buttons],
              })) as Message;

              im.createMessageComponentCollector({
                filter: (u) => u.user.id == interaction.user.id,
              }).on("collect", async (i) => {
                if (i.customId == "button.yes.delete") {
                  data[interaction.user.id] = null;

                  i.reply({
                    embeds: [
                      fA.aembed(
                        "Успешно",
                        "Викторина была успешно удалена",
                        fA.colors.default
                      ),
                    ],
                    ephemeral: true,
                  });
                } else if (i.customId == "button.no.delete")
                  i.reply({
                    embeds: [
                      fA.aembed(
                        "Успшено",
                        "Вы отказались от удаление викторины",
                        fA.colors.error
                      ),
                    ],
                    ephemeral: true,
                  });
                else if (i.customId == "button.continue.delete")
                  askFor(interaction);
              });
              return;
            }

            let name = interaction.fields.getTextInputValue(
              "quiz.create.new_name"
            );
            let desc = interaction.fields.getTextInputValue(
              "quiz.create.new_desc"
            );
            let img = interaction.fields.getTextInputValue(
              "quiz.create.new_img"
            );

            if (img != "" && !fA.urlRegex.test(img))
              return interaction.reply({
                content: null,
                embeds: [
                  fA.aembed(
                    "Ошибка",
                    "Изображение викторины должно быть ссылкой.",
                    fA.colors.error
                  ),
                ],
                ephemeral: true,
              });

            data[interaction.user.id] = [
              {
                name: name,
                description: desc,
                img: img,
              },
            ];

            askFor(interaction);
          } else if (<string>interaction.customId == "quiz.create.qa") {
            let question = interaction.fields.getTextInputValue(
              "quiz.create.qa.question"
            );
            let wrongAnswers = interaction.fields
              .getTextInputValue("quiz.create.qa.wrong")
              .split("||");
            let correctAnswer = interaction.fields.getTextInputValue(
              "quiz.create.qa.correct"
            );
            let img = interaction.fields.getTextInputValue("quiz.create.img");

            if (data[interaction.user.id].includes(question))
              return interaction.reply({
                content: null,
                embeds: [
                  fA.aembed(
                    "Ошибка",
                    "Вы уже добавили этот вопрос.",
                    fA.colors.error
                  ),
                ],
                ephemeral: true,
              });

            if (wrongAnswers.length < 2)
              return interaction.reply({
                content: null,
                embeds: [
                  fA.aembed(
                    "Ошибка",
                    "Необходимо ввести не менее двух неправильных ответов.",
                    fA.colors.error
                  ),
                ],
                ephemeral: true,
              });

            let dat = data[interaction.user.id];

            let answers = [];

            answers.push({
              text: correctAnswer,
              correct: true,
            });

            wrongAnswers.forEach((answer: any) => {
              answers.push({
                text: answer,
                correct: false,
              });
            });

            dat.push({
              question: question,
              answers: answers,
              img: img,
            });

            askFor(interaction);
          } else if (
            <string>interaction.customId == "create.suggestion.channel"
          ) {
            let channelName = interaction.fields.getTextInputValue(
              "suggestion.channel.name"
            );
            let channelDescription = interaction.fields.getTextInputValue(
              "suggestion.channel.description"
            );

            interaction
              .guild!.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
                topic: channelDescription,
                permissionOverwrites: [
                  {
                    id: interaction.guild!.roles.everyone.id,
                    deny: ['SendMessages', 'ManageMessages', 'AddReactions', 'SendTTSMessages', 'MentionEveryone'],
                  },
                ]
              })
              .then((c) => {
                interaction.reply({
                  content: null,
                  embeds: [
                    fA.aembed(
                      "Успешно",
                      `Канал успешно создан, айди: ${interaction.id}. Пожалуйста настроите для него права.`,
                      fA.colors.default
                    ),
                  ],
                  ephemeral: true,
                  components: [],
                });

                db.query(
                  `UPDATE guildconfig SET suggestionChannel = '${
                    c.id
                  }' WHERE guildID = '${interaction.guild!.id}'`
                );
              });
          } else if (<string>interaction.customId == "suggestion.time.active") {
            let time = interaction.fields.getTextInputValue("");

            if (time == "")
              return interaction.reply({
                content: null,
                embeds: [
                  fA.aembed("Ошибка", "Вы не ввели время.", fA.colors.error),
                ],
                ephemeral: true,
              });
            else {
              if (time != "0") time = String(parseTime(time));

              if (time == null)
                return interaction.reply({
                  embeds: [
                    fA.aembed(
                      "Ошибка",
                      "Не удалось конвертировать время.",
                      fA.colors.error
                    ),
                  ],
                  ephemeral: true,
                });

              db.query(
                `UPDATE guildconfig SET suggestionTimeActive = '${time}' WHERE guildID = '${
                  interaction.guild!.id
                }'`
              );

              return interaction.reply({
                content: null,
                embeds: [
                  fA.aembed(
                    "Успешно",
                    "Время предложений успешно изменено.",
                    fA.colors.default
                  ),
                ],
                ephemeral: true,
              });
            }
          }
        });
    }
  },
};

let askFor = async (modal: ModalSubmitInteraction) => {
  if (!modal.deferred) await modal.deferReply({ ephemeral: true });

  const ButtonYes = new fA.ButtonBuilder()
    .setCustomId("quiz.create.yes")
    .setLabel("Да")
    .setStyle(fA.ButtonStyle.Primary)
    .setDisabled(data[modal.user.id].length > 9);
  const ButtonNo = new fA.ButtonBuilder()
    .setCustomId("quiz.create.no")
    .setLabel("Нет")
    .setStyle(fA.ButtonStyle.Primary)
    .setDisabled(data[modal.user.id].length < 3);
  const ButtonDelete = new fA.ButtonBuilder()
    .setCustomId("quiz.create.delete")
    .setLabel("Удалить")
    .setStyle(fA.ButtonStyle.Danger);

  let rrow = new ActionRowBuilder<ButtonBuilder>().addComponents([
    ButtonYes,
    ButtonNo,
    ButtonDelete,
  ]);

  let i = (await modal.editReply({
    embeds: [
      fA.aembed(
        "Все вопросы?",
        "Вы хотите добавить еще вопросы?",
        fA.colors.default
      ),
    ],
    components: [rrow],
  })) as Message;

  i.createMessageComponentCollector({
    filter: (i_) => i_.user.id == modal.user.id,
  }).on("collect", async (i) => {
    if (i.customId == "quiz.create.yes") {
      await i.showModal(modalIze);
    } else if (i.customId == "quiz.create.no") {
      db.promise()
        .query(
          `INSERT INTO quiz (quizData, author, date) VALUES ('${JSON.stringify(
            data[modal.user!.id]
          )}', '${modal.user!.id}', '${new Date().toISOString()}')`
        )
        .then((x: any) => {
          i.reply({
            embeds: [
              fA.aembed(
                "Успешно",
                `Викторина была успешно создана, айди: ${x[0].insertId}`,
                fA.colors.default
              ),
            ],
            ephemeral: true,
          });

          data[modal.user.id] = null;
        });
    } else if (i.customId == "quiz.create.delete") {
      data[modal.user.id] = [];

      i.reply({
        content: null,
        embeds: [fA.aembed("Успешно", "Викторина удалена.", fA.colors.default)],
        components: [],
        ephemeral: true,
      });
    }
  });
};
