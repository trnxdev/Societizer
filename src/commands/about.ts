import { Command } from "../typings/";
import { version as dVersion } from "discord.js"
export let command: Command = {
    name: "about",
    emoji: "ℹ️",
    category: "Информация",
    description: "Информация о боте + сообщение создателя",
    options: [],
    run: async (interaction, client, f) => {
        return interaction.reply({embeds: [
            new f.embed()
                .setTitle("ℹ️ | Информация о боте")
                .addField("Версия discord.js", `v${dVersion}`, true)
                .addField("Версия MariaDB", "10.0.28", true)
                .addField("Версия Node.js", process.version, true)
                .addField("ЯП", "TypeScript, JavaScript, SQL", true)
                .addField("Хоститься на", "Raspberry Pi 400", true)
                .addField("Хоститься с помощью", "pm2", true)
                .addField("Создатель", "Tiratira#1111", true)
                .addField("Репозиторий", "[GitHub](https://github.com/TiranexDev/Societizer)", true)
                .addField("Сообщение от создателя", 
                "Спасибо вам за использование бота, если вы нашли ошибку или опечатку, пожалуйста, напишите мне в личные сообщения, я потратил очень много время на данного бота, надеюсь с этим ботом у вас будут только хорошие воспоминания."
                , true)
                .setColor(f.colors.default)
                .setTimestamp()
                .setFooter({
                    text: `Спасибо вам за использование данного бота ❤️`,
                    iconURL: client.user!.displayAvatarURL(),
                })
            ]
        })
    }
}