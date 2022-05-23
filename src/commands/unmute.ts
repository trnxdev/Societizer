import { GuildMember } from 'discord.js';
import { Command } from '../typings/'

export let command: Command = {
    name: "unmute",
    emoji: "💬",
    category: "Модерация",
    description: "Информация о данных которые есть в нашей базе данных",
    options: [
        {
            name: "пользователь",
            description: "Пользователь которого вы хотите размутить",
            type: 6,
            required: true,
        },
        {
            name: "анонимно",
            description: "Забанить пользователя анонимно, по стандарту не анонимно",
            type: 5,
        },
    ],
    run: async (interaction, client, f) => {
        let anonmute = interaction.options.getBoolean("анонимно", false) || false;
        let user = interaction.options.getUser("пользователь", true);
        let muser = interaction.options.getMember("пользователь", false) as GuildMember;
        let auth = anonmute ? "Аноним" : `<@${interaction.user.id}>`;
        const member = interaction.member as GuildMember;

        if (!user)
            return interaction.reply({
                embeds: [f.aembed(`Ошибка`, `Пользователь не найден`, f.colors.error)],
            });

        if (!muser)
            return interaction.reply({
                embeds: [
                    f.aembed("Ошибка", `Пользователь которого вы хотите замьютить не найден на данном сервер`, f.colors.error),
                ],
            });

        if (!member.permissions.has("MANAGE_MESSAGES"))
            return interaction.reply({
                embeds: [
                    f.aembed(`Ошибка`, `У вас нету прав чтобы управлять сообщениями`, f.colors.error),
                ],
                ephemeral: true,
            });

        if (!interaction.guild!.me!.permissions.has("MANAGE_MESSAGES"))
            return interaction.reply({
                embeds: [
                    f.aembed(`Ошибка`, `У бота нету прав чтобы управлять сообщениями`, f.colors.error),
                ],
                ephemeral: true,
            });

        const embed = new f.embed()
            .setTitle(`🔇 | Размьют`)
            .setTimestamp()
            .setFooter({ text: client.user!.username, iconURL: client.user!.displayAvatarURL() })
            .setColor(f.colors.default)
            .addField("Пользователь", `<@${user.id}>`, true)
            .addField("Автор", auth, true)
            .setThumbnail(user.displayAvatarURL());

        if (muser.communicationDisabledUntil) {
            try {
                await muser.timeout(null).catch((err) => {
                    f.handleError(interaction, err, f.colors);
                });
            }
            catch (err) {
                f.handleError(interaction, <Error>err, f.colors);
            }
            finally {
                if (!anonmute)
                    await user.send({ embeds: [embed] }).catch(() => { });
                return interaction.reply({ embeds: [embed], ephemeral: anonmute });
            }
        }
        else {
            return interaction.reply({
                embeds: [
                    f.aembed(`Ошибка`, `Участник которого вы указали не находиться в мьюте на данном сервере`, f.colors.error),
                ],
                ephemeral: true
            });
        }
    },
};
