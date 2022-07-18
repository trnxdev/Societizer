import {
  Client,
  Message,
  ChatInputCommandInteraction,
  ButtonBuilder,
  ModalBuilder,
  TextInputBuilder,
  ActionRowBuilder,
  TextInputStyle,
} from "discord.js";
import { CommandFunctions } from "../../typings";

export default async (
  interaction: ChatInputCommandInteraction,
  f: CommandFunctions,
  _client: Client,
  dbres: { quizID: string }
) => {
  const modalNewName = new ModalBuilder()
    .setCustomId(`edit_name_vik.${dbres.quizID}`)
    .setTitle(`Редактировать название викторины`)
    .addComponents([
      new ActionRowBuilder<TextInputBuilder>().addComponents([
        new TextInputBuilder()
          .setCustomId("new_name")
          .setLabel("Введите новое название викторины")
          .setStyle(TextInputStyle.Paragraph)
          .setMinLength(3)
          .setMaxLength(20)
          .setPlaceholder("Новое название")
          .setRequired(true),
      ]),
    ]);

  const modalNewImg = new ModalBuilder()
    .setCustomId(`edit_img_vik.${dbres.quizID}`)
    .setTitle(`Редактировать название викторины`)
    .addComponents([
      new ActionRowBuilder<TextInputBuilder>().addComponents([
        new TextInputBuilder()
          .setCustomId("new_img")
          .setLabel("Введите новую ссылку для картинки")
          .setStyle(TextInputStyle.Paragraph)
          .setMinLength(3)
          .setMaxLength(150)
          .setPlaceholder("Новая ссылка на картинку")
          .setRequired(true),
      ]),
    ]);

  const row = new f.ActionRowBuilder<ButtonBuilder>().addComponents([
    new f.ButtonBuilder()
      .setCustomId("new_name_button")
      .setLabel("Редактировать название")
      .setStyle(f.ButtonStyle.Primary),
    new f.ButtonBuilder()
      .setCustomId("new_img_button")
      .setLabel("Редактировать картинку")
      .setStyle(f.ButtonStyle.Primary),
  ]);

  const message = (await interaction.editReply({
    embeds: [f.aembed("Выберите ваше действие", "", f.colors.default)],
    components: [row],
  })) as Message;

  const collector = message.createMessageComponentCollector({
    filter: (i) =>
      i.customId == "new_name_button" || i.customId == "new_img_button",
  });

  collector.on("collect", async (sub) => {
    if (sub.user.id != interaction.user.id) return;

    if (sub.customId == "new_name_button")
      await interaction.showModal(modalNewName);
    else if (sub.customId == "new_img_button")
      await interaction.showModal(modalNewImg);
  });
};
