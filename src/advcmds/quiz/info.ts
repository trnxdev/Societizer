import {
  Client,
  CommandInteraction,
  Message,
  MessageActionRow,
  MessageButton,
} from "discord.js";
import db from "../../db/init";
import { CommandFunctions } from "../../typings";

let buttonViewNormalInfo = new MessageButton()
  .setLabel("Обычная информация")
  .setStyle("PRIMARY")
  .setCustomId("view.normal.info");
let buttonViewAverageInfo = new MessageButton()
  .setLabel("Средняя информация")
  .setStyle("PRIMARY")
  .setCustomId("view.average.info");
/*let buttonViewFullInfo = new MessageButton()
  .setLabel("Информация о пользователе")
  .setStyle("PRIMARY")
  .setCustomId("view.user.info");*/

let adminPanelRow = new MessageActionRow().addComponents([
  buttonViewNormalInfo,
  buttonViewAverageInfo,
  //buttonViewFullInfo,
]);

export default async (
  interaction: CommandInteraction,
  _client: Client,
  f: CommandFunctions
) => {
  db.promise()
    .query(
      `SELECT * FROM quiz WHERE quizID = '${interaction.options.getInteger(
        "айди",
        true
      )}'`
    )
    .then(async (r: any) => {
      if (interaction.user!.id != r[0][0].author)
        return normalInfo(interaction, f, r);

      if (!interaction.deferred)
        await interaction.deferReply({ ephemeral: true });

      (<Message>await interaction.editReply({
        embeds: [
          f.aembed(
            "ℹ️ | Админ панель информации о викторине",
            "Выберите действие",
            f.colors.default
          ),
        ],
        components: [adminPanelRow],
      }))
        .createMessageComponentCollector({
          filter: (i) => i.user.id == interaction.user.id,
        })
        .on("collect", (i) => {
          if (i.customId == "view.normal.info") normalInfo(interaction, f, r);
          if (i.customId == "view.average.info") averageInfo(interaction, f, r);
        });
    });
};

function formatDate(date: Date): string {
  const monthNames = [
    "Января",
    "Февраля",
    "Марта",
    "Апреля",
    "Мая",
    "Июня",
    "Июля",
    "Августа",
    "Сентября",
    "Октября",
    "Ноября",
    "Декабря",
  ];

  const day = date.getDate();
  const monthIndex = date.getMonth();
  const year = date.getFullYear();

  return `${day} ${monthNames[monthIndex]} ${year}`;
}

export let averageInfo = (
  interaction: CommandInteraction,
  f: CommandFunctions,
  r: any
) => {
  db.promise()
    .query(`SELECT * FROM quizCData WHERE quizID = '${r[0][0].quizID}'`)
    .then(async (res: any) => {
      let dataMap = res[0].map(
        (n: { completedData: boolean[] }) => n.completedData
      );
      const embed = new f.embed()
        .setTitle(`Средняя информация о викторине`)
        .setColor(f.colors.default)
        .setTimestamp()
        .setFooter({
          text: interaction.client.user!.username,
          iconURL: interaction.client.user!.displayAvatarURL(),
        });

      let questionLength = JSON.parse(r[0][0].quizData);
      questionLength.shift();
      questionLength = questionLength.length;

      let percents: number[] = [];

      for (let i = 0; i < questionLength; i++) {
        let data = dataMap.map((n: any) => JSON.parse(n)[i]);
        let percent =
          (data.reduce((a: any, b: any) => a + b, 0) / data.length) * 100;
        percents.push(percent);
        embed.addField(`Вопрос ${i}`, `${percent}%`, true);
      }

      embed.addField(`Средний балл`, `${Math.round(average(percents))}%`, true);
      embed.addField(
        `Пользователей принявших участие`,
        `${dataMap.length}`,
        true
      );

      await interaction.editReply({ embeds: [embed], components: [] });
    });
};

export let normalInfo = async (
  interaction: CommandInteraction,
  f: CommandFunctions,
  r: any
) => {
  if (!interaction?.deferred) await interaction.deferReply({ ephemeral: true });

  if (r[0].length == 0)
    return interaction.editReply({
      embeds: [
        f.aembed("Ошибка", "Данная викторина не была найдена", f.colors.error),
      ],
      components: [],
    });

  let data = r[0][0];

  let parsed = JSON.parse(data.quizData);

  const Embed = new f.embed()
    .setTitle(`Информация о Викторине "${parsed[0].name}"`)
    .addField(
      `Автор`,
      interaction.client.users.cache.get(data.author)!.tag,
      true
    )
    .addField("Создан", formatDate(new Date(data.date)), true)
    .addField("Можно играть", data.closed == 0 ? "Да" : "Нет", true)
    .addField("Количество Вопросов", `${parsed.length - 1}`, true)
    .addField(
      "Сыграно",
      data.completed == 0 ? "Ни разу" : `${data.completed} раз/а`,
      true
    )
    .setColor(f.colors.default)
    .setThumbnail(parsed[0]?.img)
    .setFooter({
      text: interaction.client.user!.username,
      iconURL: interaction.client.user!.displayAvatarURL(),
    })
    .setTimestamp();

  return interaction.editReply({ embeds: [Embed], components: [] });
};

let average = (arr: number[]) => {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
};
