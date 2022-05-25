import { Client, CommandInteraction } from 'discord.js'
import db from '../../db/init'
import { CommandFunctions } from '../../typings'

export default async (
    interaction: CommandInteraction,
    client: Client,
    f: CommandFunctions
) => {
    db.promise()
        .query(
            `SELECT * FROM quiz WHERE quizID = '${interaction.options.getInteger(
                'айди',
                true
            )}'`
        )
        .then((r: any) => {
            if (r[0].length == 0)
                return interaction.reply({
                    embeds: [
                        f.aembed(
                            'Ошибка',
                            'Данная викторина не была найдена',
                            f.colors.error
                        ),
                    ],
                    ephemeral: true,
                })

            let data = r[0][0]

            let parsed = JSON.parse(data.quizData)

            const Embed = new f.embed()
                .setTitle(`Информация о Викторине "${parsed[0].name}"`)
                .addField(
                    `Автор`,
                    client.users.cache.get(data.author)!.tag,
                    true
                )
                .addField('Создан', formatDate(new Date(data.date)), true)
                .addField('Можно играть', data.closed == 0 ? 'Да' : 'Нет', true)
                .addField('Количество Вопросов', `${parsed.length - 1}`, true)
                .addField(
                    'Сыграно',
                    data.completed == 0 ? 'Ни разу' : `${data.completed} раз/а`,
                    true
                )
                .setColor(f.colors.default)
                .setThumbnail(parsed[0]?.img)
                .setFooter({
                    text: client.user!.username,
                    iconURL: client.user!.displayAvatarURL(),
                })
                .setTimestamp()

            return interaction.reply({ embeds: [Embed], ephemeral: true })
        })
}

function formatDate(date: Date): string {
    const monthNames = [
        'Января',
        'Февраля',
        'Марта',
        'Апреля',
        'Мая',
        'Июня',
        'Июля',
        'Августа',
        'Сентября',
        'Октября',
        'Ноября',
        'Декабря',
    ]

    const day = date.getDate()
    const monthIndex = date.getMonth()
    const year = date.getFullYear()

    return `${day} ${monthNames[monthIndex]} ${year}`
}
