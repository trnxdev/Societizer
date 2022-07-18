import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { CommandFunctions } from "../../typings";

export default async (
  interaction: ChatInputCommandInteraction,
  _f: CommandFunctions
) => {
  let nameQuiz = easyModal(
    "Введите название викторины",
    "Название викторины",
    "quiz.create.new_name",
    TextInputStyle.Paragraph,
    true
  );
  let descQuiz = easyModal(
    "Введите описание викторины",
    "Описание викторины",
    "quiz.create.new_desc",
    TextInputStyle.Paragraph,
    true
  );
  let imgQuiz = easyModal(
    "Введите ссылку на картинку",
    "Ссылка на картинку",
    "quiz.create.new_img",
    TextInputStyle.Paragraph,
    false
  );

  const modal = new ModalBuilder()
    .setTitle("Создание викторины")
    .setCustomId("quiz.create")
    .addComponents([nameQuiz, descQuiz, imgQuiz]);

  await interaction.showModal(modal);
};

let easyModal = (
  label: string,
  placeholder: string,
  id: string,
  style: TextInputStyle,
  required: boolean
) => {
  return new ActionRowBuilder<TextInputBuilder>().addComponents([
    new TextInputBuilder()
      .setCustomId(id)
      .setLabel(label)
      .setStyle(style)
      .setMinLength(3)
      .setMaxLength(200)
      .setPlaceholder(placeholder)
      .setRequired(required),
  ]);
};
