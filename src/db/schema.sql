-- Схема бд
-- LONGTEXT просто другое слово для JSON (работает только если на сервере MariaDB а не MySQL)

CREATE DATABASE Societizer; -- Создаём базу данных

USE Societizer; -- Используем базу данных которую мы создали

-- Создаём таблицу для серверов
CREATE TABLE guildconfig (
    guildID VARCHAR(155) PRIMARY KEY, -- Айди сервера
    suggestionChannel VARCHAR(155), -- Айди канала для предложений
    disabledCMDS LONGTEXT, -- Список команд которые будут отключены для сервера, потом добавлю
    closedSuggestions INTEGER(2) DEFAULT 0,
    suggestionTimeActive INTEGER(255) DEFAULT 0
);

CREATE TABLE suggestions (
    suggestionID INTEGER(255) PRIMARY KEY AUTO_INCREMENT, -- Айди предложения
    guildID VARCHAR(155), -- Айди сервера
    userSigned LONGTEXT,
    author VARCHAR(155), -- Автор викторимны
    date VARCHAR(255), -- Дата создания викторины
    FOREIGN KEY (guildID) REFERENCES guildconfig(guildID),
    messageID VARCHAR(155), -- Айди сообщения
    active VARCHAR(20) DEFAULT 'yes' -- Активно ли предложение
);

-- Создаём таблицу для квизов
CREATE TABLE quiz (
    quizID INTEGER(255) PRIMARY KEY AUTO_INCREMENT, -- Айди викторины
    quizData LONGTEXT, -- Данные викторины
    author VARCHAR(155), -- Автор викторимны
    date VARCHAR(255), -- Дата создания викторины
    closed INTEGER(2) DEFAULT 0, -- Выключена ли викторина
    completed INTEGER(255) DEFAULT 0 -- Сколько раз квиз был пройден
);

CREATE TABLE quizCData (
    quizID INTEGER(255),
    completedData LONGTEXT,
    justNum INTEGER(255) PRIMARY KEY AUTO_INCREMENT,
    date VARCHAR(255),
    user VARCHAR(155)
);