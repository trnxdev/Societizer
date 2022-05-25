import { Client, Message, CommandInteraction } from 'discord.js'
import { Modal, TextInputComponent, showModal } from 'discord-modals'
import { CommandFunctions } from '../../typings'

export default async (
    interaction: CommandInteraction,
    f: CommandFunctions,
    client: Client,
    dbres: { quizID: string }
) => {
    const modalNewName = new Modal()
        .setCustomId(`edit_name_vik.${dbres.quizID}`)
        .setTitle(`Редактировать название викторины`)
        .addComponents(
            new TextInputComponent()
                .setCustomId('new_name')
                .setLabel('Введите новое название викторины')
                .setStyle('LONG')
                .setMinLength(3)
                .setMaxLength(20)
                .setPlaceholder('Новое название')
                .setRequired(true)
        )

    const modalNewImg = new Modal()
        .setCustomId(`edit_img_vik.${dbres.quizID}`)
        .setTitle(`Редактировать название викторины`)
        .addComponents(
            new TextInputComponent()
                .setCustomId('new_img')
                .setLabel('Введите новую ссылку для картинки')
                .setStyle('LONG')
                .setMinLength(3)
                .setMaxLength(150)
                .setPlaceholder('Новая ссылка на картинку')
                .setRequired(true)
        )

    const row = new f.MessageActionRow().addComponents([
        new f.MessageButton()
            .setCustomId('new_name_button')
            .setLabel('Редактировать название')
            .setStyle('PRIMARY'),
        new f.MessageButton()
            .setCustomId('new_img_button')
            .setLabel('Редактировать картинку')
            .setStyle('PRIMARY'),
    ])

    const message = (await interaction.editReply({
        embeds: [f.aembed('Выберите ваше действие', '', f.colors.default)],
        components: [row],
    })) as Message

    const collector = message.createMessageComponentCollector({
        filter: (i) =>
            i.customId == 'new_name_button' || i.customId == 'new_img_button',
    })

    collector.on('collect', async (sub) => {
        if (sub.user.id != interaction.user.id) return

        if (sub.customId == 'new_name_button')
            showModal(modalNewName, {
                client: client,
                interaction: sub,
            })
        else if (sub.customId == 'new_img_button')
            showModal(modalNewImg, {
                client: client,
                interaction: sub,
            })
    })
}
