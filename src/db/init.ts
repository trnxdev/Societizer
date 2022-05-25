// База данных MariaDB (MySQL).

// Импортируем АПИ для того чтобы инициализировать базу данных
import mysql from 'mysql2'
import config from '../config'
// Создаем переменную для соединения с базой данных
const connection = mysql.createConnection({
    host: config.db_host,
    user: config.db_user,
    password: config.db_password,
    database: config.db_database,
    port: config.db_port,
})
// Экспортируем соединение
export default connection
