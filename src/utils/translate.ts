// Импортируем АПИ для переводчика
import translate from '@vitalets/google-translate-api'

// Экспортируем функцию для перевода текста
export let parseRus = async (input: string) => {
    return new Promise(async (resolve, reject) => {
        // Экспортируем обещание
        translate(input, { to: 'ru' }) // Переводим текст
            .then((res: { text: string }) => {
                // Когда получаем ответ...
                resolve(res?.text) // Возвращаем текст в обещание
            })
            .catch((err: Error) => reject(err.message)) // Если ошибка то, ну простите)))
    })
}
