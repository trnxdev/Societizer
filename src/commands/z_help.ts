// Почему этот файл называется z_help.ts а не просто help.ts, это потомучто у него в commandHandler потом вставляются все команды которые ДО этого прогрузились,
// поэтому этот файл начинается именно с z поскольку это последняя буква латинского алфавита.
import { Command, CommandCategory } from "../typings/";

export let command: Command = {
  name: "help",
  emoji: "📚",
  description: "Список команд",
  category: "Информация",
  options: [],
  run: async (interaction, client, f) => {
    let cmd = interaction.options.getString("команда", false);
    let cmdX: any = {};

    let categories: CommandCategory[] = client.commands
      .map((c) => c.category)
      .filter((v, i, a) => a.indexOf(v) === i);

    categories.forEach((category) => {
      cmdX[category] = client.commands
        .filter((c) => c.category == category)
        .map((c) => c.name);
    });

    if (!cmd) {
      const embed = new f.embed()
        .setTitle(`📜 | Список команд`)
        .setColor(f.colors.default)
        .setTimestamp()
        .setFooter({
          text: client.user!.username,
          iconURL: client.user!.displayAvatarURL(),
        });

      categories.forEach((category) => {
        embed.addField(category, cmdX[category].join(" | "), true);
      });

      return interaction.reply({ embeds: [embed], ephemeral: true });
    } else {
      let searchedcmd = client.commands.find((c) => c.name == cmd);

      if (!searchedcmd)
        return interaction.reply({
          embeds: [
            f.aembed(`Ошибка`, `Команда ${cmd} не найдена`, f.colors.error),
          ],
        });

      let usage = `/${searchedcmd.name}`;

      let realoptions: {name: string}[] = searchedcmd.options!.filter(
        (o) => o.required == true
      );

      if (realoptions.length != 0)
        usage = `${usage} <${realoptions.map((o) => o.name).join("> <")}>`;

      let embed = new f.embed()
        .setTitle(
          `📜 | Информация о команде ${searchedcmd.name} ${searchedcmd.emoji} |`
        )
        .setColor(f.colors.default)
        .setTimestamp()
        .setFooter({
          text: client.user!.username,
          iconURL: client.user!.displayAvatarURL(),
        })
        .addField("Описание", searchedcmd.description, true)
        .addField("Категория", searchedcmd.category, true)
        .addField("Использование", usage, true);

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
