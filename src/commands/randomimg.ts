import { Command } from "../typings/";

export let command: Command = {
  name: "randomimg",
  emoji: "🖼️",
  description: "Отправляет случайное изображение с интернета (600x600)",
  category: "Развлечения",
  options: [
    {
      name: "ширина",
      description: "Ширина изображения",
      type: 4,
      autocomplete: false,
    },
    {
      name: "высота",
      description: "Высота изображения",
      type: 4,
      autocomplete: false,
    },
  ],
  run: async (interaction, client, f) => {
    // get a random image from the internet
    let height = interaction.options.getInteger("Высота", false) || "600";
    let width = interaction.options.getInteger("Ширина", false) || "600";

    let { url }: Response = await fetch(
      `https://random.imagecdn.app/${height}/${width}`
    );

    const embed = new f.embed()
      .setTitle(`🖼️ | Случайное изображение`)
      .setImage(url)
      .setColor(f.colors.default)
      .setFooter({
        text: `Изображение получено с сервиса random.imagecdn.app`,
        iconURL: client.user!.displayAvatarURL(),
      })
      .setTimestamp();

    interaction.reply({ embeds: [embed] });
  },
};
