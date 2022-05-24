import { Command } from "../typings/"
import { GuildMember, Message } from "discord.js";
import { Modal, showModal, TextInputComponent } from "discord-modals"

export let command: Command = {
    name: "config",
    description: "Изменить настройки сервера",
    category: "Утилиты",
    emoji: "🔧",
    options: [],
    run: async (interaction, client, f) => {
        if (!(<GuildMember>interaction.member).permissions.has("ADMINISTRATOR")) return interaction.reply({
            embeds: [
                f.aembed("Ошибка", "У вас нет прав для изменения настроек бота для этого сервера", f.colors.error)
            ]
        })

        if (!interaction.deferred) await interaction.deferReply({ ephemeral: true })

        let buttonSuggestions = new f.MessageButton().setLabel("Предложения (/suggest)").setStyle("PRIMARY").setCustomId("suggestions.bot");

        let row = new f.MessageActionRow().addComponents(buttonSuggestions);

        let m = (await interaction.editReply({
            embeds: [
                f.aembed("Настройки сервера", `Настройки сервера "${interaction.guild!.name}", выберите категорию.`, f.colors.default)
            ],
            components: [row]
        })) as Message;

        let selectionController = m.createMessageComponentCollector({ filter: (i) => i.user!.id === interaction.user!.id })

        selectionController.on("collect", async (i) => {
            if (i.customId === "suggestions.bot") {
                let selectChannel = new f.MessageButton().setLabel("Создать канал для предложений").setStyle("PRIMARY").setCustomId("suggestions.bot.create");

                let action = new f.MessageActionRow().addComponents([selectChannel]);

                (<Message>await interaction.editReply({
                    embeds: [
                        f.aembed("Настройки сервера", "Выберите действие для предложений от бота.", f.colors.default)
                    ],
                    components: [action]
                })).createMessageComponentCollector({ filter: (i) => i.user!.id === interaction.user!.id }).on("collect", async (i) => {
                    if (i.customId === "suggestions.bot.create") {
                        let modalKa = new Modal().setTitle("Создание канала для предложений").setCustomId("create.suggestion.channel")
                            .addComponents(
                                new TextInputComponent().setLabel("Название канала").setCustomId("suggestion.channel.name").setPlaceholder("Например: Предложения").setMinLength(1).setMaxLength(200).setStyle("LONG").setRequired(true),
                                new TextInputComponent().setLabel("Описание канала").setCustomId("suggestion.channel.description").setPlaceholder("Например: Канал для предложений от бота").setMaxLength(1024).setStyle("LONG").setRequired(false)
                            )

                        showModal(modalKa, {
                            interaction: i,
                            client: client
                        })
                    }
                })
            }
        })
    }
}