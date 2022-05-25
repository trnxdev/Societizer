// Импортируем необходимые Библиотеки
import { Client } from "discord.js";
import fs from "fs";
import path from "path";

// Экспортируем функцию
export default async (client?: Client) => {
  let apps: { name: string; type: number }[] = []; // Создаем пустой массив приложений

  await fs
    .readdirSync(path.resolve(__dirname, "../apps")) // Читаем директорию команд
    .forEach(async (file: string) => {
      // Проходимся по всем файлам
      const { app } = await import(
        path.resolve(__dirname, "../apps/" + file) // Импортируем файл P.S. Не убирайте квадратные скобки
      );

      if (client != null) client.apps.set(app.name, app); // Устанавливаем приложение в коллекцию команд

      if (app.name != "help") {
        apps.push({
          name: app.name,
          type: app.type,
        });
      }
    });

  return apps; // Возвращаем массив приложений
};
