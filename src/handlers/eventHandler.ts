// Импортируем типизацию
import { Client } from 'discord.js'
// Импортируем штуки для работы с файлами
import fs from 'fs'
import path from 'path'

// Экспортируем функцию
export default (client: Client) => {
    fs.readdirSync(path.resolve(__dirname, '../events')).forEach(async (ev) => {
        // Читаем директорию events где находятся наши эвенты
        let { event } = await import(`../events/${ev}`) // Импортируем файлы и получаем их как объекты

        client.events.set(event.name, event) // Устанавливаем эвент в коллекцию эвентов

        client.on(event.name, event.run.bind(null, client)) // Привязываем эвент к клиенту
    })
}
