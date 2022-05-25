import { GuildMember } from "discord.js";
import { Command } from "../typings/";

export let command: Command = {
  name: "ban",
  category: "Модерация",
  emoji: "🔨",
  description: "Бан пользователя",
  options: [
    {
      name: "пользователь",
      description: "Пользователь для бана",
      type: 6,
      required: true,
    },
    {
      name: "причина",
      description: "Причина бана",
      type: 3,
      required: false,
    },
    {
      name: "анонимно",
      description: "Забанить пользователя анонимно, по стандарту не анонимно",
      type: 5,
      required: false,
    },
  ],
  run: async (interaction, client, f) => {
    const user = interaction.options.getUser("пользователь", true);
    const reason =
      interaction.options.getString("причина", false) || "Не указана";
    const anonban = interaction.options.getBoolean("анонимно", false) || false;
    const auth = anonban ? "Аноним" : `<@${interaction.user.id}>`;
    const member = interaction.member as GuildMember;

    if (!member.permissions.has("BAN_MEMBERS"))
      return interaction.reply({
        embeds: [
          f.aembed(
            "Ошибка",
            "У вас нет прав на бан пользователей",
            f.colors.error
          ),
        ],
        ephemeral: true,
      });
    if (!user)
      return interaction.reply({
        embeds: [f.aembed("ошибка", "Пользователь не найден", f.colors.error)],
        ephemeral: true,
      });
    let bans = await interaction.guild?.bans.fetch();
    if (bans?.has(user.id))
      return interaction.reply({
        embeds: [
          f.aembed(
            `Ошибка`,
            `Участник ${user.tag} уже забанен на данном сервере`,
            f.colors.error
          ),
        ],
        ephemeral: true,
      });
    if (user.id === interaction.user?.id)
      return interaction.reply({
        embeds: [
          f.aembed("ошибка", "Нельзя забанить самого себя", f.colors.error),
        ],
        ephemeral: true,
      });
    if (user.id === interaction.guild?.ownerId)
      return interaction.reply({
        embeds: [
          f.aembed("ошибка", "Нельзя банить владельца сервера", f.colors.error),
        ],
        ephemeral: true,
      });
    const embed = new f.embed()
      .setTitle(`🔨 | Бан`)
      .setTimestamp()
      .setFooter({
        text: client.user!.username,
        iconURL: client.user!.displayAvatarURL(),
      })
      .setColor(f.colors.default)
      .addField("Пользователь", `<@${user.id}>`, true)
      .addField("Автор", auth, true)
      .setThumbnail(user.displayAvatarURL())
      .addField("Причина", reason, true);

    if (!anonban) await user.send({ embeds: [embed] }).catch(() => {});

    interaction.guild?.bans
      .create(user, { reason: reason })
      .then(() => {
        return interaction.reply({
          embeds: [embed],
          ephemeral: anonban,
        });
      })
      .catch((err) => {
        return f.handleError(interaction, err, f.colors);
      });
  },
};
