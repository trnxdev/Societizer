import { Command } from "../typings/";
import db from "../db/init";
import {
  ButtonBuilder,
  ActionRowBuilder,
  GuildMember,
  ButtonStyle,
  TextChannel,
} from "discord.js";
import { doDef } from "../events/ready";

let Like = new ButtonBuilder()
  .setLabel("👍 | Хорошая идея")
  .setStyle(ButtonStyle.Primary)
  .setCustomId("suggestion.like");
let Dislike = new ButtonBuilder()
  .setLabel("👎 | Плохая идея")
  .setStyle(ButtonStyle.Danger)
  .setCustomId("suggestion.dislike");
let ShowStats = new ButtonBuilder()
  .setLabel("📊 | Статистика")
  .setStyle(ButtonStyle.Primary)
  .setCustomId("suggestion.stats");

let row = new ActionRowBuilder<ButtonBuilder>().addComponents([Like, Dislike, ShowStats]);

export let command: Command = {
  name: "suggest",
  description: "Предложите что-то вашему серверу",
  category: "Социалные",
  emoji: "💬",
  options: [
    {
      name: "тема",
      description: "Тема предложения (3-100)",
      required: true,
      type: 3,
    },
    {
      name: "описание",
      description: "Описание предложения (3-750)",
      required: true,
      type: 3,
    },
  ],
  run: (interaction, client, f) => {
    db.promise()
      .query(
        `SELECT * FROM guildconfig WHERE guildID = '${interaction.guild!.id}'`
      )
      .then(async (d: any) => {
        let data = d[0][0];
        let theme = interaction.options.getString("тема", true);
        let details = interaction.options.getString("описание", true);

        if (!data.suggestionChannel)
          return interaction.reply({
            embeds: [
              f.aembed(
                "Ошибка",
                `На этом сервере не указан канал для предложений${(<GuildMember>interaction.member).permissions.has(
                  "Administrator"
                )
                  ? " (Поскольку вы админ, вы можете ввести команду /config)"
                  : "."
                }`,
                f.colors.error
              ),
            ],
            ephemeral: true,
          });

        if (data.suggestionChannel == 1)
          return interaction.reply({
            embeds: [
              f.aembed(
                `Ошибка`,
                `На этом сервере были выключены предложения.`,
                f.colors.error
              ),
            ],
            ephemeral: true,
          });

        if (
          theme.length <= 3 ||
          details.length <= 3 ||
          theme.length >= 100 ||
          details.length >= 750
        )
          return interaction.reply({
            embeds: [
              f.aembed(
                "Ошибка",
                "Тема или описание предложения не подходит по длине символов (Тема: 3-100, Описание: 3-750)",
                f.colors.error
              ),
            ],
            ephemeral: true,
          });

      (<TextChannel> await client.channels.cache.get(data.suggestionChannel)!).send({
          embeds: [
            new f.embed()
              .setColor(f.colors.default)
              .setTimestamp()
              .setTitle(`💡 | Предложение "${theme}"`)
              .setDescription(details)
              .setFooter({
                text: `Отправлено: ${interaction.user!.tag}`,
                iconURL: client.user!.displayAvatarURL(),
              }),
          ],
          components: [row],
        }).then(m => {
          interaction.reply({
            embeds: [
              f.aembed(
                "Успешно",
                `Ваше предложение было отправлено в канал <#${data.suggestionChannel}>.`,
                f.colors.default
              ),
            ],
          });

          db.promise()
            .query(
              `INSERT IGNORE INTO suggestions(guildID, userSigned, author, date, messageID) VALUES ('${interaction.guild!.id}', '{}', '${interaction.user!.id}', '${new Date().toISOString()}', '${m.id}')`
            ).then((r: any) => {
              if (data.suggestionTimeActive != 0) {
                setTimeout(() => {
                  db.promise()
                    .query(
                      `SELECT * FROM suggestions WHERE suggestionID = '${r[0].insertId}'`
                    )
                    .then((d: any) => {
                      doDef(client, data, d[0][0]);
                    });
                }, data.suggestionTimeActive);
              }
            })
        });
      })
  },
};
