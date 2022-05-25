import { Command } from '../typings'
import { BitlyClient } from 'bitly'
import config from '../config'
const bitly = new BitlyClient(config.bitlyToken)

export let command: Command = {
    name: 'shortlink',
    emoji: '🔗',
    description: 'Преобразует ссылку в короткую',
    options: [
        {
            name: 'ссылка',
            description: 'Ссылка которую вы хотите преобразовать',
            required: true,
            type: 3,
        },
    ],
    category: 'Утилиты',
    run: async (interaction, client, f) => {
        let url = interaction.options.getString('ссылка', true)

        if (!f.urlRegex.test(url))
            return interaction.reply({
                embeds: [
                    f.aembed(
                        `Ошибка`,
                        `Неверный формат ссылки`,
                        f.colors.error
                    ),
                ],
                ephemeral: true,
            })

        let short = await bitly.shorten(url)

        return interaction.reply({
            embeds: [
                new f.embed()
                    .setTitle(`🔗 | Ссылка`)
                    .setColor(f.colors.default)
                    .setDescription(
                        `Выша ссылка была успешно преобразована: ${url} => ${short.link}`
                    )
                    .setTimestamp()
                    .setFooter({
                        text: `API: bit.ly (npmjs.com/bitly)`,
                        iconURL: client.user!.displayAvatarURL(),
                    }),
            ],
            ephemeral: true,
        })
    },
}
