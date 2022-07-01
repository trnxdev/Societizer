// make a command to send a random russian meme

import { Command } from "../typings/";
import axios from "axios";

export let command: Command = {
  name: "meme",
  description: "Отправить случайный мем",
  category: "Развлечения",
  emoji: "🎱",
  options: [],
  run: async (interaction, client, f) => {
    getRandomRedditMeme()
      .then((m) => {
        const embed = new f.embed()
          .setTitle("🎱 | Мем")
          .setTimestamp()
          .setDescription(m?.title)
          .setFooter({
            text: `Мемы взяты с r/KafkaFPS`,
            iconURL: client.user?.displayAvatarURL(),
          })
          .setImage(m?.url)
          .setColor(f.colors.default);

        return interaction.reply({ embeds: [embed] });
      })
      .catch(async (err) => {
        return interaction.reply({
          embeds: [
            f.aembed(
              "Ошибка",
              `Не удалось получить мемы с реддита: ${await f.parseRus(err)}`,
              f.colors.error
            ),
          ],
        });
      });
  },
};

let getRandomRedditMeme = (): Promise<{ url: string; title: string }> => {
  return new Promise(async (resolve, reject) => {
    axios
      .get("https://www.reddit.com/r/KafkaFPS/.json")
      .then((res) => {
        const json = res.data;
        const memes = json.data.children.filter(
          (m: { data: { link_flair_text: string } }) =>
            m.data.link_flair_text == "мемъ"
        );
        const randomIndex = Math.floor(Math.random() * memes.length);
        const meme = memes[randomIndex].data;
        resolve(meme);
      })
      .catch((err) => {
        reject(err);
      });
  });
};
