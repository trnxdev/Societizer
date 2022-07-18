import {
  Message,
  SelectMenuBuilder,
  Client,
  ChatInputCommandInteraction,
  MessageComponentInteraction,
  ButtonBuilder,
} from "discord.js";

import db from "../../db/init";
import { Ans, CommandFunctions } from "../../typings";

// https://bost.ocks.org/mike/shuffle/
// Функция которая перемешивает массив
let shuffle = (
  array: { label: string; value: string }[]
): { label: string; value: string }[] => {
  var copy = [],
    n = array.length,
    i;
  while (n) {
    i = Math.floor(Math.random() * array.length);

    if (i in array) {
      copy.push(array[i]);
      delete array[i];
      n--;
    }
  }

  return copy;
};

export default async (
  interaction: ChatInputCommandInteraction,
  client: Client,
  f: CommandFunctions
) => {
  db.promise()
    .query(
      `SELECT * FROM quiz WHERE quizID = '${interaction.options.getInteger(
        "айди",
        true
      )}'`
    )
    .then(async (u: any) => {
      if (!u[0][0])
        return interaction.reply({
          embeds: [f.aembed("ошибка", "Квиз не найден", f.colors.error)],
          ephemeral: true,
        });

      const quizData = JSON.parse(u[0][0].quizData);

      if (!interaction.deferred)
        await interaction.deferReply({ ephemeral: true });

      let quezzyname = quizData[0].name; // Почему создаём переменную для этого? Поскольку потом мы убираем первый элемент с массива. Короче: Чтобы не удалилось

      if (u[0][0]?.closed == 1)
        return interaction.editReply({
          embeds: [
            f.aembed(
              "ошибка",
              `Квиз "${quezzyname}" был закрыт пользователем.`,
              f.colors.error
            ),
          ],
        });

      if (
        u[0][0]?.guildOnly != null &&
        u[0][0]?.guildOnly != interaction.guild!.id
      )
        return interaction.editReply({
          embeds: [
            f.aembed(
              "ошибка",
              `Квиз "${quezzyname}" не доступен для вашего сервера.`,
              f.colors.error
            ),
          ],
        });

      const buttonPlay = new f.ButtonBuilder()
        .setLabel("Играть")
        .setCustomId("yes_play")
        .setStyle(f.ButtonStyle.Primary);
      const buttonNo = new f.ButtonBuilder()
        .setLabel("Отказаться")
        .setCustomId("no_play")
        .setStyle(f.ButtonStyle.Danger);
      const buttons = [buttonPlay, buttonNo];

      let message = (await interaction.editReply({
        embeds: [
          f.aembed(
            `📋 | Квиз: ${quezzyname}`,
            `${quizData[0].description}`,
            f.colors.default,
            quizData[0]?.img
          ),
        ],
        components: [
          new f.ActionRowBuilder<ButtonBuilder>().addComponents(buttons),
        ],
      })) as Message;

      quizData.shift(); // Вот тут мы и убираем первый элемент из массива

      const collector = message.createMessageComponentCollector({
        filter: (i) => i.user.id == interaction.user.id,
      });

      collector.on("collect", async (message) => {
        if (message.user.id != interaction.user!.id) return;
        if (message.customId === "yes_play") {
          let x = 1;

          let thisAnsO: any = {};

          async function QuizMe(
            i: number,
            message: MessageComponentInteraction
          ) {
            if (i == quizData.length) {
              let finBool: boolean[] = [];

              for (let i = 0; i < quizData.length; i++) {
                finBool.push(
                  quizData[i].answers.filter(
                    (u: { text: string }) =>
                      u.text == thisAnsO[quizData[i].question]
                  )[0]?.correct
                );
              }

              let true_len = finBool.filter((u: {}) => u).length;

              const embed = new f.embed()
                .setTitle("📊 | Результаты")
                .setColor(f.colors.default)
                .setTimestamp()
                .setFooter({
                  text: client.user!.username,
                  iconURL: client.user!.displayAvatarURL(),
                });

              for (let i = 0; i < finBool.length; i++) {
                embed.addFields([
                  {
                    name: `Вопрос ${i + 1}`,
                    value: quizData[i].question,
                    inline: true,
                  },
                  {
                    name: "Ваш ответ",
                    value: thisAnsO[quizData[i].question],
                    inline: true,
                  },
                ]);
                if (finBool[i] == true)
                  embed.addFields([
                    { name: "Правильно", value: "Да", inline: true },
                  ]);
                else
                  embed.addFields([
                    {
                      name: "Правильный ответ",
                      value: quizData[i].answers.filter(
                        (u: Ans) => u.correct
                      )[0].text,
                      inline: true,
                    },
                  ]);
              }

              if (true_len != quizData.length)
                embed.setDescription(
                  `Вы ответили на ${true_len} вопрос${
                    true_len == 1 ? "" : "ов"
                  } правильно из ${quizData.length} вопросов`
                );
              else if (true_len == 0)
                embed.setDescription(`Вы ответили на все вопросы неправильно`);
              else if (true_len == quizData.length)
                embed.setDescription(`Вы ответили на все вопросы правильно`);

              message.editReply({
                content: null,
                embeds: [embed],
                components: [],
              });

              db.promise()
                .query(
                  `SELECT completed FROM quiz WHERE quizID='${interaction.options.getInteger(
                    "айди",
                    true
                  )}'`
                )
                .then(async (r: any) => {
                  db.query(
                    `UPDATE quiz SET completed='${
                      r[0][0].completed + 1
                    }' WHERE quizID='${interaction.options.getInteger(
                      "айди",
                      true
                    )}'`
                  );

                  db.query(
                    `INSERT IGNORE INTO quizCData(quizID, completedData, date, user) VALUES('${interaction.options.getInteger(
                      "айди",
                      true
                    )}', '${JSON.stringify(
                      finBool
                    )}', '${new Date().toISOString()}', '${
                      interaction.user!.id
                    }')`
                  );
                });
              return;
            }

            let data = quizData[i];

            let triv: { label: string; value: string }[] = [];

            data.answers.forEach((q: { text: string }) =>
              triv.push({ label: q.text, value: q.text })
            );

            let newrow =
              new f.ActionRowBuilder<SelectMenuBuilder>().addComponents(
                new SelectMenuBuilder()
                  .setCustomId("prev")
                  .setCustomId("prev_question")
                  .setPlaceholder("Выберите ваш ответ")
                  .setOptions(shuffle(triv))
              );

            if (x == 1) await message.deferReply({ ephemeral: true });
            x += 1;
            let newmessage = (await message.editReply({
              content: null,
              embeds: [
                f.aembed(
                  `📋 | Квиз: ${quezzyname}`,
                  data.question,
                  f.colors.default,
                  data?.img
                ),
              ],
              components: [newrow],
            })) as Message;

            newmessage
              .createMessageComponentCollector()
              .on("collect", async (thismessage) => {
                if (thismessage.user.id != interaction.user.id) return;
                if (thisAnsO[data.question] == null)
                  thisAnsO[data.question] = (<any>thismessage)?.values[0];

                await thismessage.deferUpdate().catch(() => console.log);
                QuizMe(i + 1, thismessage);
              });
          }

          QuizMe(0, message);
        } else if (message.customId === "no_play") {
          await message.deferUpdate().catch(() => console.log);

          if (message && typeof message.deleteReply === "function")
            message.deleteReply().catch(() => console.log);
        }
      });
    });
};
