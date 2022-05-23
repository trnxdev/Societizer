// make a command to send a random russian meme

import { Command } from "../typings/";
import request from "request";

export let command: Command = {
  name: "meme",
  description: "Отправить случайный мем",
  category: "Развлечения",
  emoji: "🎱",
  options: [],
  run: async (interaction, client, f) => {
    let m = await getRandomRedditMeme();

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

    interaction.reply({ embeds: [embed] });
  },
};

function getRandomRedditMeme(): Promise<{url: string; title: string;}> {
  return new Promise((resolve, reject) => {
    request(
      "https://www.reddit.com/r/KafkaFPS/.json",
      (err: Error, _res: any, body: string) => {
        if (err) {
          reject(err);
        } else {
          const json = JSON.parse(body);
          const memes = json.data.children.filter(
            (m: {data: {link_flair_text: string}}) => m.data.link_flair_text == "мемъ"
          );
          const randomIndex = Math.floor(Math.random() * memes.length);
          const meme = memes[randomIndex].data;
          resolve(meme);
        }
      }
    );
  });
}
