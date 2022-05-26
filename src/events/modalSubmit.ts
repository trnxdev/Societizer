// Импортируем типизацию
import { Event } from "../typings";
import db from "../db/init";
import { fA } from "../handlers/commandHandler";
import { Client, Message } from "discord.js";
import {
  Modal,
  ModalSubmitInteraction,
  showModal,
  TextInputComponent,
} from "discord-modals";
import { parseTime } from "../utils/parseTime";

let data: any = {};

let basicQuestion = new TextInputComponent()
  .setLabel("Введите вопрос")
  .setCustomId("quiz.create.qa.question")
  .setStyle("LONG")
  .setMinLength(3)
  .setMaxLength(200)
  .setPlaceholder("Вопрос")
  .setRequired(true);
let wrongAnswers = new TextInputComponent()
  .setLabel("Введите неверные ответы")
  .setCustomId("quiz.create.qa.wrong")
  .setStyle("LONG")
  .setMinLength(3)
  .setMaxLength(150)
  .setPlaceholder("Отделяйте с помощью ||")
  .setRequired(true);
let correctAnswer = new TextInputComponent()
  .setLabel("Введите правильный ответ")
  .setCustomId("quiz.create.qa.correct")
  .setStyle("LONG")
  .setMinLength(3)
  .setMaxLength(100)
  .setPlaceholder("Правильный Ответ")
  .setRequired(true);
let imgB = new TextInputComponent()
  .setLabel("Введите картинку")
  .setCustomId("quiz.create.img")
  .setStyle("LONG")
  .setMinLength(3)
  .setMaxLength(150)
  .setPlaceholder("Картинка")
  .setRequired(false);

const modalIze = new Modal()
  .setTitle("Добавление вопроса")
  .setCustomId("quiz.create.qa")
  .addComponents(basicQuestion, wrongAnswers, correctAnswer, imgB);

export let event: Event = {
  name: "modalSubmit",
  run: async (client: Client, modal: ModalSubmitInteraction) => {
    let quizID = modal.customId.split(".")[1];
    db.promise()
      .query(`SELECT * FROM quiz WHERE quizID = '${quizID}'`)
      .then(async (r: any) => {
        if ((<string>modal.customId).startsWith("edit_name_vik")) {
          let newName = modal.fields[0].value;

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
              return modal.reply({
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
        } else if ((<string>modal.customId).startsWith("edit_img_vik")) {
          let newImg = modal.fields[0].value;

          if (!fA.urlRegex.test(newImg))
            return modal.reply({
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
              return modal.reply({
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
        } else if (<string>modal.customId == "quiz.create") {
          if (data[modal.user.id] != null) {
            if (!modal.deferred) await modal.deferReply({ ephemeral: true });

            const buttonYes = new fA.MessageButton()
              .setStyle("DANGER")
              .setLabel("Да")
              .setCustomId("button.yes.delete");
            const buttonNo = new fA.MessageButton()
              .setStyle("PRIMARY")
              .setLabel("Нет")
              .setCustomId("button.no.delete");
            const buttonContinue = new fA.MessageButton()
              .setStyle("PRIMARY")
              .setLabel("Нет, Продолжить создавать викторину")
              .setCustomId("button.continue.delete");

            const buttons = new fA.MessageActionRow().addComponents([
              buttonYes,
              buttonNo,
              buttonContinue,
            ]);

            // @ts-ignore
            let im = (await modal.editReply({
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
              filter: (u) => u.user.id == modal.user.id,
            }).on("collect", async (i) => {
              if (i.customId == "button.yes.delete") {
                data[modal.user.id] = null;

                return i.reply({
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
                return i.reply({
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
                return askFor(modal, client);
            });
            return;
          }

          let name = modal.fields[0].value;
          let desc = modal.fields[1].value;
          let img = modal.fields[2]?.value;

          if (img != null && !fA.urlRegex.test(img))
            return modal.reply({
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

          data[modal.user.id] = [
            {
              name: name,
              description: desc,
              img: img,
            },
          ];

          askFor(modal, client);
        } else if (<string>modal.customId == "quiz.create.qa") {
          let question = modal.fields[0].value;
          let wrongAnswers = modal.fields[1].value.split("||");
          let correctAnswer = modal.fields[2].value;
          let img = modal.fields[3]?.value;

          if (data[modal.user.id].includes(question))
            return modal.reply({
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
            return modal.reply({
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

          let dat = data[modal.user.id];

          let answers = [];

          answers.push({
            text: correctAnswer,
            correct: true,
          });

          wrongAnswers.forEach((answer) => {
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

          askFor(modal, client);
        } else if (<string>modal.customId == "create.suggestion.channel") {
          let channelName = modal.fields[0].value;
          let channelDescription = modal.fields[1]?.value;

          modal
            .guild!.channels.create(channelName, {
              type: "GUILD_TEXT",
              topic: channelDescription,
            })
            .then((c) => {
              modal.reply({
                content: null,
                embeds: [
                  fA.aembed(
                    "Успешно",
                    `Канал успешно создан, айди: ${modal.id}`,
                    fA.colors.default
                  ),
                ],
                components: [],
              });

              db.query(
                `UPDATE guildconfig SET suggestionChannel = '${
                  c.id
                }' WHERE guildID = '${modal.guild!.id}'`
              );
            });
        } else if ((<string>modal.customId) == "suggestion.time.active") {
          let time = modal.fields[0].value;

          if (time == "") 
            return modal.reply({
              content: null,
              embeds: [
                fA.aembed(
                  "Ошибка",
                  "Вы не ввели время.",
                  fA.colors.error
                ),
              ],
              ephemeral: true,
            });
          else {
            if(time != "0") time = String(parseTime(time));

            if (time == null)
              return modal.reply({
                embeds: [
                  fA.aembed(
                    "Ошибка",
                    "Не удалось конвертировать время.",
                    fA.colors.error
                  )
                ]
              })

            db.query(
              `UPDATE guildconfig SET suggestionTimeActive = '${time}' WHERE guildID = '${modal.guild!.id}'`
            );
            
            return modal.reply({
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
  },
};

let askFor = async (modal: ModalSubmitInteraction, client: Client) => {
  if (!modal.deferred) await modal.deferReply({ ephemeral: true });

  const ButtonYes = new fA.MessageButton()
    .setCustomId("quiz.create.yes")
    .setLabel("Да")
    .setStyle("PRIMARY")
    .setDisabled(data[modal.user.id].length > 9);
  const ButtonNo = new fA.MessageButton()
    .setCustomId("quiz.create.no")
    .setLabel("Нет")
    .setStyle("PRIMARY")
    .setDisabled(data[modal.user.id].length < 3);
  const ButtonDelete = new fA.MessageButton()
    .setCustomId("quiz.create.delete")
    .setLabel("Удалить")
    .setStyle("DANGER");

  const row = new fA.MessageActionRow().addComponents([
    ButtonYes,
    ButtonNo,
    ButtonDelete,
  ]);

  // @ts-ignore
  let i = (await modal.editReply({
    embeds: [
      fA.aembed(
        "Все вопросы?",
        "Вы хотите добавить еще вопросы?",
        fA.colors.default
      ),
    ],
    components: [row],
  })) as Message;

  i.createMessageComponentCollector({
    filter: (i_) => i_.user.id == modal.user.id,
  }).on("collect", (i) => {
    if (i.customId == "quiz.create.yes") {
      showModal(modalIze, { client: client, interaction: i });
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
            ephemeral: true
          });

          data[modal.user.id] = null;
        });
    } else if (i.customId == "quiz.create.delete") {
      data[modal.user.id] = [];

      return i.reply({
        content: null,
        embeds: [fA.aembed("Успешно", "Викторина удалена.", fA.colors.default)],
        components: [],
      });
    }
  });
};
