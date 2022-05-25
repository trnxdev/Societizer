import { Command } from '../typings/'
// @ts-ignore
import { search } from 'googlethis'
import { search as ddSearch, SafeSearchType } from 'duck-duck-scrape'

export let command: Command = {
    name: 'internetsearch',
    category: 'Утилиты',
    emoji: '🔍',
    description: 'Команда для поиска чего-то в интернете',
    options: [
        {
            name: 'поисковик',
            description:
                'поисковик с помощью которого вы хотите поискать запрос',
            type: 3,
            choices: [
                {
                    name: 'Google',
                    value: 'google',
                },
                {
                    name: 'DuckDuckGo',
                    value: 'duckduckgo',
                },
            ],
            required: true,
        },
        {
            name: 'запрос',
            description: 'Запрос для поиска',
            type: 3,
            required: true,
        },
        {
            name: 'анонимно',
            description: 'Анонимный поиск',
            type: 5,
            required: false,
        },
    ],
    run: async (interaction, _client, f) => {
        let anon = interaction.options.getBoolean('анонимно', false) || false

        let arr: string[] = []

        let ggl = interaction.options.getString('поисковик', true)
        let query = interaction.options.getString('запрос', true)

        if (ggl == 'google') {
            search(query, { safe: true, additional_params: { hl: 'ru' } }).then(
                (res: { results: [{ title: string; url: string }] }) => {
                    res.results.map((r) => {
                        if (arr.length >= 6) return
                        arr.push(`[${r.title}](${r.url})`)
                    })

                    if (arr.length == 0)
                        return interaction.reply({
                            embeds: [
                                f.aembed(
                                    `Ошибка`,
                                    `Результаты в Google не дали никакие результаты`,
                                    f.colors.error
                                ),
                            ],
                            ephemeral: anon,
                        })

                    let resultsEmbed = f.aembed(
                        `🔍 | Результаты Поиска в Google`,
                        arr.join('\n'),
                        f.colors.default,
                        'https://www.raqnbeauty.com/wp-content/uploads/2020/06/google-logo-png-google-icon-logo-png-transparent-svg-vector-bie-supply-14.png'
                    )

                    return interaction.reply({
                        embeds: [resultsEmbed],
                        ephemeral: anon,
                    })
                }
            )
        } else if (ggl == 'duckduckgo') {
            ddSearch(query, {
                safeSearch: SafeSearchType.STRICT,
                locale: 'ru-ru',
            }).then((res) => {
                res.results.map((r) => {
                    if (arr.length >= 6) return
                    arr.push(`[${r.title}](${r.url})`)
                })

                if (arr.length == 0)
                    return interaction.reply({
                        embeds: [
                            f.aembed(
                                `Ошибка`,
                                `Результаты в DuckDuckGo не дали никакие результаты`,
                                f.colors.error
                            ),
                        ],
                        ephemeral: anon,
                    })

                let resultsEmbed = f.aembed(
                    `🔍 | Результаты Поиска в DuckDuckGo`,
                    arr.join('\n'),
                    f.colors.default,
                    'https://cdn.freebiesupply.com/logos/large/2x/duckduckgo-3-logo-png-transparent.png'
                )

                return interaction.reply({
                    embeds: [resultsEmbed],
                    ephemeral: anon,
                })
            })
        } else
            interaction.reply({
                content: 'Неизвестный поисковик',
                ephemeral: true,
            })
    },
}
