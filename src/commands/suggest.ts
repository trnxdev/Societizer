import { Command } from '../typings/';
import db from '../db/init'
import { MessageButton, MessageActionRow, GuildMember } from "discord.js" 

let Like = new MessageButton().setLabel("👍 | Хорошая идея").setStyle("PRIMARY").setCustomId("suggestion.like");
let Dislike = new MessageButton().setLabel("👎 | Плохая идея").setStyle("DANGER").setCustomId("suggestion.dislike");
let ShowStats = new MessageButton().setLabel("📊 | Статистика").setStyle("PRIMARY").setCustomId("suggestion.stats");

let row = new MessageActionRow().addComponents([Like, Dislike, ShowStats]);

export let command: Command = {
    name: 'suggest',
    description: 'Предложите что-то вашему серверу',
    category: "Социалные",
    emoji: '💬',
    options: [{
        name: 'тема',
        description: 'Тема предложения (3-100)',
        required: true,
        type: 3
    }, {
        name: 'описание',
        description: 'Описание предложения (3-750)',
        required: true,
        type: 3
    }],
    run: (interaction, client, f) => {
        db.promise().query(`SELECT * FROM guildconfig WHERE guildID = '${interaction.guild!.id}'`).then((d: any) => {
            let data = d[0][0];
            let theme = interaction.options.getString('тема', true);
            let details = interaction.options.getString('описание', true);

            if (!data.suggestionChannel) 
                return interaction.reply({
                    embeds: [
                        f.aembed("Ошибка", `На этом сервере не указан канал для предложений${(<GuildMember>interaction.member).permissions.has("ADMINISTRATOR") ? " (Поскольку вы админ, вы можете ввести команду /config)" : "."}`, f.colors.error)
                    ],
                    ephemeral: true
                })

            if(data.suggestionChannel == 1)
                return interaction.reply({
                    embeds: [
                        f.aembed(`Ошибка`, `На этом сервере были выключены предложения.`, f.colors.error)
                    ],
                    ephemeral: true
                })

            if(interaction.channel!.id != data.suggestionChannel) 
                return interaction.reply({
                    embeds: [
                        f.aembed("Ошибка", `Вы находитесь в неправильном канале (Зайдите в канал "<#${data.suggestionChannel}>")`, f.colors.error)
                    ],
                    ephemeral: true
                })

            if(theme.length <= 3 || details.length <= 3 || theme.length >= 100 || details.length >= 750) 
                return interaction.reply({
                    embeds: [
                        f.aembed("Ошибка", "Тема или описание предложения не подходит по длине символов (Тема: 3-100, Описание: 3-750)", f.colors.error)
                    ],
                    ephemeral: true
                })
            
            db.promise().query(`INSERT IGNORE INTO suggestions(guildID, userSigned, author, date) VALUES ('${interaction.guild!.id}', '{}', '${interaction.user!.id}', '${new Date().toISOString()}')`).then((r: any) => {
                return interaction.reply({
                    embeds: [
                        new f.embed().setColor(f.colors.default).setTimestamp().setTitle(`💡 | Предложение "${theme}"`).setDescription(details).setFooter({ text: `Отправлено: ${interaction.user!.tag} | Айди: ${r[0].insertId}`, iconURL: client.user!.displayAvatarURL() })
                    ],
                    components: [row]
                })
            })
        })
    }
}