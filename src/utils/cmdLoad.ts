// Импортируем необходимые Библиотеки
import { Client } from 'discord.js'
import fs from 'fs'
import path from 'path'
import { Command } from '../typings/'

// Экспортируем функцию
export default async (client?: Client) => {
    let cmds: {
        name: Command['name']
        description: Command['description']
        options: Command['options']
    }[] = [] // Создаем пустой массив команд
    let cmdx: {
        name?: Command['name']
        description?: Command['description']
        options?: Command['options']
        type?: number
        value?: Command['name']
    }[] = []

    fs.readdirSync(path.resolve(__dirname, '../commands')) // Читаем директорию команд
        .forEach(async (file: string) => {
            // Проходимся по всем файлам
            const { command } = await import(
                path.resolve(__dirname, '../commands/' + file) // Импортируем файл P.S. Не убирайте квадратные скобки
            )

            if (client != null) client.commands.set(command.name, command) // Устанавливаем команду в коллекцию команд

            if (command.name != 'help') {
                cmds.push({
                    name: command.name,
                    description: command.description || 'Нету',
                    options: command.options ? command.options : [],
                })
                cmdx!.push({
                    name: command.name,
                    description: command.description || 'Нету',
                    options: command.options ? command.options : [],
                })
            }

            if (command.name == 'help') {
                cmds.push({
                    name: command.name,
                    description: command.description,
                    options: [
                        {
                            name: 'команда',
                            description: 'Название команды',
                            type: 3,
                            choices: cmdx!
                                .map((x) => {
                                    delete x.options
                                    delete x.description
                                    x.type = 3
                                    x.value = x.name
                                    if (x.name == 'help') x = null as any
                                    return x
                                })
                                .filter((u) => u != null),
                        },
                    ],
                })
            }
        })
    return cmds // Возвращаем массив команд#
}
