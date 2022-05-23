import { Modal, showModal, TextInputComponent, TextInputStyle } from "discord-modals";
import { CommandInteraction } from "discord.js";
import { CommandFunctions } from "../../typings";

export default async (interaction: CommandInteraction, _f: CommandFunctions) => {
  let nameQuiz = easyModal("Введите название викторины", "Название викторины", "quiz.create.new_name", "LONG", true);
  let descQuiz = easyModal("Введите описание викторины", "Описание викторины", "quiz.create.new_desc", "LONG", true);
  let imgQuiz = easyModal("Введите ссылку на картинку", "Ссылка на картинку", "quiz.create.new_img", "LONG", false);

  const modal = new Modal().setTitle("Создание викторины").setCustomId("quiz.create").addComponents(nameQuiz, descQuiz, imgQuiz);

  showModal(modal, {
      client: interaction.client,
      interaction: interaction
  });
}

let easyModal = (label: string, placeholder: string, id: string, style: TextInputStyle, required: boolean) => {
    return new TextInputComponent()
        .setCustomId(id)
        .setLabel(label)
        .setStyle(style)
        .setMinLength(3)
        .setMaxLength(200)
        .setPlaceholder(placeholder)
        .setRequired(required);
}
