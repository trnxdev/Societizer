// Импортируем всякие штучки
import { ColorResolvable, MessageEmbed } from "discord.js";

// Экспортируем функцию
export default (
  rustitle: string,
  rusdesc: string,
  color: ColorResolvable, // ColorResolvable = Цвет который discord.js распознаёт
  imgif?: string
) => {
  let compareTitle = rustitle.toLowerCase(); // Изменяем название чтобы потом проверить на совпадение

  if (compareTitle == "ошибка") rustitle = ":x: | Ошибка!";
  if (compareTitle == "успешно") rustitle = ":white_check_mark: | Успешно!";

  const Embed = new MessageEmbed(); // Создаём новый Эмбед

  // Делаем эмбед
  Embed.setTitle(rustitle)
    .setDescription(rusdesc)
    .setColor(color)
    .setFooter({
      text: "Societizer", // Замените тут на своё название бота
      iconURL:
        "https://cdn.discordapp.com/avatars/958077423080067124/1bf56bded0f8fa3581c618b6750035ba.webp", // Замените тут на свою аватарку
    })
    .setTimestamp();

  if (imgif != null) Embed.setThumbnail(imgif);
  // Возвращаем эмбед
  return Embed;
};
