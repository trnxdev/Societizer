// Импортируем типизацию
import { Client, Interaction } from "discord.js";
import { Event, Command, App } from "../typings";
// Функции
import db from '../db/init'
import { fA } from "../handlers/commandHandler";

export let event: Event = {
  name: "interactionCreate",
  run: async (client: Client, interaction: Interaction) => {
    if (interaction.isCommand()) {
      let command = <Command>await client.commands.get(interaction.commandName);

      try {
        command.run(interaction, client, fA);
      } catch (e) {
        console.log(
          `[commands/${command.name}.ts, ${interaction.guild!.id}] ${(<Error>e).message}`
        );
      }
    } else if (interaction.isContextMenu()) {
      let app = <App>await client.apps.get(interaction.commandName);

      try {
        app.run(interaction, client, fA);
      } catch (e) {
        console.log(
          `[apps/${app.name}.ts, ${interaction.guild!.id}] ${(<Error>e).message}`
        );
      }
    } else if (interaction.isMessageComponent() && interaction.component.type == "BUTTON" && interaction.component.customId?.startsWith("suggestion.")) {
      let id = interaction.message.embeds[0].footer?.text.split(" ")[interaction.message.embeds[0].footer?.text.split(" ").length-1]

      if((interaction.component.customId == "suggestion.like" || interaction.component.customId == "suggestion.dislike")) {
        let rating = interaction.component.customId == "suggestion.like" ? 1 : 0

        db.promise().query(`SELECT * FROM suggestions WHERE suggestionID = '${id}'`).then(async (res: any) => {
          let signed = JSON.parse(res[0][0].userSigned)
          
          if(signed[interaction.user!.id] == rating) 
            return interaction.reply({
              embeds: [
                fA.aembed("Ошибка", "Вы уже поставили эту оценку", fA.colors.error)
              ],
              ephemeral: true
            })

          signed[interaction.user!.id] = rating;

          db.promise().query(`UPDATE suggestions SET userSigned='${JSON.stringify(signed)}' WHERE suggestionID='${id}'`).then(() => {
            return interaction.reply({
              embeds: [
                fA.aembed('Успешно', `Ваш ${rating == 1 ? "позитивный" : "негативный"} голос засчитан!`, fA.colors.default)
              ],
              ephemeral: true
            })
          })
        })
      } else if(interaction.component.customId == "suggestion.stats") {
        db.promise().query(`SELECT * FROM suggestions WHERE suggestionID = '${id}'`).then(async (res: any) => {
          let signed = Object.values(JSON.parse(res[0][0].userSigned))
          let likes = signed.filter(n => n == "1")
          let dislikes = signed.filter(n => n == "0")

          return interaction.reply({
            embeds: [
              fA.aembed('📊 | Статистика', `Голосов: ${signed.length}\nПозитивных: ${likes.length}\nНегативных: ${dislikes.length}`, fA.colors.default),
            ],
            ephemeral: true
          })
        })
      }
    }
  },
};
