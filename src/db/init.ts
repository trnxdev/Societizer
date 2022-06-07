// База данных MariaDB (MySQL).

// Импортируем АПИ для того чтобы инициализировать базу данных
import mysql from "mysql2";
import config from "../config";
// Создаем функцию для соединения с базой данных
let getConnection = () => {
  return mysql.createConnection({
    host: config.db_host,
    user: config.db_user,
    password: config.db_password,
    database: config.db_database,
    port: config.db_port,
  });
}
// Экспортируем соединение
export default getConnection();

export { getConnection };