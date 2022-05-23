import { GuildMember } from "discord.js";
import { Command } from "../typings";

export let command: Command = {
    name: "mute",
    emoji: "🔇",
    category: "Модерация",
    description: "Информация о данных которые есть в нашей базе данных",
    options: [
        {
            name: "user",
            description: "Пользователь которого вы хотитье замьютить",
            type: 6,
            required: true,
        },
        {
            name: "время",
            description: "Время, на которое участнику надо выдать мьют.",
            type: 3,
        },
        {
            name: "причина",
            description: "Причина, по которой вы хотите замьютить участника.",
            type: 3,
        },
        {
            name: "анонимно",
            description: "Забанить пользователя анонимно, по стандарту не анонимно",
            type: 5,
        },
    ],
    run: async (interaction, client, f) => {
        let reason = interaction.options.getString("причина", false) || "Не указана";
        let anonmute = interaction.options.getBoolean("анонимно", false) || false;
        let user = interaction.options.getUser("user");
        let muser = interaction.options.getMember("user", false) as GuildMember;
        let auth = anonmute ? "Аноним" : `<@${interaction.user.id}>`;
        let t = interaction.options.getString("время");
        const member = interaction.member as GuildMember;

        if (!user)
            return interaction.reply({
                embeds: [f.aembed(`Ошибка`, `Пользователь не найден`, f.colors.error)],
            });
        if (user.id === interaction.user.id)
            return interaction.reply({
                embeds: [
                    f.aembed(`Ошибка`, `Вы не можете замьютить самого себя`, f.colors.error),
                ],
            });
        if (!muser)
            return interaction.reply({
                embeds: [
                    f.aembed("Ошибка", `Пользователь которого вы хотите замьютить не найден на данном сервер`, f.colors.error),
                ],
            });
        if (t && !f.parseTime(t))
            return interaction.reply({
                embeds: [
                    f.aembed("ошибка", "Время неудалось конвертировать в мс!", f.colors.error),
                ],
                ephemeral: true,
            });
        let time = !t ? 1800000 : f.parseTime(t); // 1800000 мс = 30 минут
        if (!time)
            return interaction.reply({
                embeds: [
                    f.aembed("ошибка", "Время неудалось конвертировать в мс!", f.colors.error),
                ],
                ephemeral: true,
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

        if (muser.roles.highest.position >= interaction.guild!.me!.roles.highest.position)
            return interaction.reply({
                embeds: [
                    f.aembed(`Ошибка`, `Роль участника которого вы указали выше чем роль бота`, f.colors.error),
                ],
            });

        if (muser.roles.highest.position <= member.roles.highest.position && interaction.user.id != interaction.guild!.ownerId)
            return interaction.reply({
                embeds: [
                    f.aembed(`Ошибка`, `Ваша роль ниже чем роль участника которого вы указали`, f.colors.error),
                ],
            });

        const embed = new f.embed()
            .setTitle("🔇 | Мьют")
            .setTimestamp()
            .setFooter({
                text: client.user!.username,
                iconURL: client.user!.displayAvatarURL(),
            })
            .setColor(f.colors.default)
            .addField("Пользователь", `<@${user.id}>`, true)
            .addField("Автор", auth, true)
            .setThumbnail(user.displayAvatarURL())
            .addField("Причина", reason, true)
            .addField("Насколько", !t ? "30 Минут" : t, true);
        if (!anonmute)
            await user.send({ embeds: [embed] }).catch(() => { });
        await interaction.deferReply({ ephemeral: anonmute });
        try {
            await muser.timeout(time).catch((err: Error) => {
                f.handleError(interaction, err, f.colors);
            });
        }
        catch (err) {
            return f.handleError(interaction, <Error>err, f.colors);
        }
        finally {
            return interaction.editReply({
                embeds: [embed],
            });
        }
    },
};