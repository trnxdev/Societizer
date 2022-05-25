import { Client, CommandInteraction, Message } from 'discord.js'
import db from '../../db/init'
import { CommandFunctions } from '../../typings'
import edit from './config_edit'

export default async (
    interaction: CommandInteraction,
    client: Client,
    f: CommandFunctions
) => {
    let id = interaction.options.getInteger('айди', true)

    db.promise()
        .query(`SELECT * FROM quiz WHERE quizID = '${id}'`)
        .then(async (res: any) => {
            let data = res[0][0]

            if (data.author != interaction.user.id)
                return interaction.reply({
                    embeds: [
                        f.aembed(
                            'ошибка',
                            'Вы не можете управлять этой викториной, поскольку вы не владелец этой викторины',
                            f.colors.error
                        ),
                    ],
                    ephemeral: true,
                })

            if (!interaction.deferred)
                await interaction.deferReply({ ephemeral: true })

            const button = new f.MessageButton()
                .setCustomId('toggle_quiz')
                .setLabel(
                    `${data.closed == 0 ? 'Выключить' : 'Включить'} викторину`
                )
                .setStyle('PRIMARY')

            const button2 = new f.MessageButton()
                .setCustomId('delete_quiz')
                .setLabel('Удалить викторину')
                .setStyle('DANGER')

            const button3 = new f.MessageButton()
                .setCustomId('clear_data')
                .setLabel('Очистить данные')
                .setStyle('DANGER')

            const button4 = new f.MessageButton()
                .setCustomId('edit_quiz')
                .setLabel('Редактировать викторину')
                .setStyle('PRIMARY')

            const buttons = [button, button2, button3, button4]

            const row = new f.MessageActionRow().addComponents(buttons)

            const message = (await interaction.editReply({
                embeds: [
                    f.aembed('Выберите ваше действие', '', f.colors.default),
                ],
                components: [row],
            })) as Message

            const collector = message.createMessageComponentCollector({
                filter: (i) =>
                    i.customId === buttons[0].customId ||
                    i.customId === buttons[1].customId ||
                    i.customId === buttons[2].customId ||
                    i.customId === buttons[3].customId,
            })

            collector.on('collect', async (i) => {
                if (i.user.id != interaction.user.id) return

                if (i.isMessageComponent()) {
                    await i.deferUpdate()
                    switch (i.customId) {
                        case 'toggle_quiz':
                            db.promise()
                                .query(
                                    `UPDATE quiz SET closed = '${
                                        data.closed == 0 ? 1 : 0
                                    }' WHERE quizID = '${id}'`
                                )
                                .then(async () => {
                                    return await i.editReply({
                                        content: null,
                                        embeds: [
                                            f.aembed(
                                                'Успешно',
                                                `Квиз "${
                                                    JSON.parse(data.quizData)[0]
                                                        .name
                                                }" был успешно ${
                                                    data.closed == 1
                                                        ? 'выключен'
                                                        : 'включён'
                                                }`,
                                                f.colors.default
                                            ),
                                        ],
                                        components: [],
                                    })
                                })
                            break
                        case 'delete_quiz':
                            db.promise()
                                .query(
                                    `DELETE FROM quiz WHERE quizID = '${id}'`
                                )
                                .then(async () => {
                                    return await i.editReply({
                                        content: null,
                                        embeds: [
                                            f.aembed(
                                                'Успешно',
                                                `Квиз "${
                                                    JSON.parse(data.quizData)[0]
                                                        .name
                                                }" был успешно удалён`,
                                                f.colors.default
                                            ),
                                        ],
                                        components: [],
                                    })
                                })
                            break
                        case 'clear_data':
                            db.promise()
                                .query(
                                    `UPDATE quiz SET completed='0' WHERE quizID = '${id}'`
                                )
                                .then(async () => {
                                    return await i.editReply({
                                        content: null,
                                        embeds: [
                                            f.aembed(
                                                'Успешно',
                                                `Данные квиза "${
                                                    JSON.parse(data.quizData)[0]
                                                        .name
                                                }" были успешно очищены`,
                                                f.colors.default
                                            ),
                                        ],
                                        components: [],
                                    })
                                })
                            break
                        case 'edit_quiz':
                            edit(interaction, f, client, res[0][0])
                            break
                    }
                }
            })
        })
}
