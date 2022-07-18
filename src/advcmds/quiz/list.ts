import { ChatInputCommandInteraction } from "discord.js";
import db from "../../db/init";
import { CommandFunctions } from "../../typings";

export default async (
  interaction: ChatInputCommandInteraction,
  f: CommandFunctions
) => {
  let user =
    interaction.options.getUser("пользователь", false) || interaction.user;

  if (user.bot || user.system)
    return interaction.reply({
      embeds: [
        f.aembed(
          "ошибка",
          "Вы не можете просматривать викторины бота",
          f.colors.error
        ),
      ],
      ephemeral: true,
    });

  db.promise()
    .query(`SELECT * FROM quiz WHERE author='${user!.id}'`)
    .then((r: any) => {
      if (r[0].length == 0) {
        interaction.reply({
          embeds: [
            f.aembed(
              `ошибка`,
              `У данного пользователя нету викторин`,
              f.colors.error
            ),
          ],
          ephemeral: true,
        });
      } else {
        return interaction.reply({
          embeds: [
            f.aembed(
              `📚 | Список викторин`,
              `Всего викторин: ${r[0].length}\nАйди всех викторины: ${r[0]
                .map((n: { quizID: number }) => n.quizID)
                .join(", ")}`,
              f.colors.default
            ),
          ],
          ephemeral: true,
        });
      }
    });
};
