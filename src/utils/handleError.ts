import { CommandInteraction } from "discord.js";
import { fA } from "../handlers/commandHandler";
import { CommandFunctions } from "../typings";
import { parseRus } from './translate'

export default async (interaction: CommandInteraction, err: Error, colors: CommandFunctions["colors"]) => {
    if(!interaction.deferred) await interaction.deferReply({ ephemeral: true })

    const ruserror = await parseRus(err.message);

    return interaction.editReply({ embeds: [
        fA.aembed("Ошибка", `${ruserror} (Переведенно [Google Translate](https://www.npmjs.com/package/@vitalets/google-translate-api))`, colors.error)
    ] });
};
