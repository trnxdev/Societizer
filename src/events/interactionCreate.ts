// Импортируем типизацию
import { Client, Interaction } from "discord.js";
import { Event, Command, App } from "../typings";
// Функции

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
    }
  },
};
