import mysql from "mysql2";
import config from "../config";

// Экспорт соеденения
export default mysql.createPool({
    host: config.db_host,
    user: config.db_user,
    password: config.db_password,
    database: config.db_database,
    port: config.db_port,
});