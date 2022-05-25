import { App } from '../typings/'

export let app: App = {
    name: 'Поцелуй',
    type: 3,
    run: async (interaction, client, f) => {
        let user = await (await interaction.channel?.messages.fetch(
            interaction.targetId
        ))!.author

        if (user!.id == client.user!.id)
            return interaction.reply({
                embeds: [
                    f.aembed(
                        `💋 | Поцелуй`,
                        `Спасибо что хотите поцеловать меня, но я не могу это сделать, если меня спалят, то мне пиз-`,
                        f.colors.error
                    ),
                ],
                ephemeral: true,
            })

        if (user!.id == interaction.user!.id)
            return interaction.reply({
                embeds: [
                    f.aembed(
                        `💋 | Поцелуй`,
                        `Себя поцеловать, ну...`,
                        f.colors.error
                    ),
                ],
                ephemeral: true,
            })

        return interaction.reply({
            embeds: [
                f.aembed(
                    `💋 | Поцелуй ${
                        user!.bot || user!.system ? '... бота? Ок...' : ''
                    }`,
                    `<@${interaction.user.id}> поцеловал ${
                        user!.bot || user!.system ? '**бота**' : `пользователя`
                    } <@${user!.id}>`,
                    f.colors.default
                ),
            ],
        })
    },
}
