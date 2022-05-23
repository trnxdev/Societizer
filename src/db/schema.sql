-- Схема бд
-- LONGTEXT просто другое слово для JSON (работает только если на сервере MariaDB а не MySQL)

CREATE DATABASE Anproject; -- Создаём базу данных

USE Anproject; -- Используем базу данных которую мы создали

-- Создаём таблицу для серверов
CREATE TABLE guildconfig (
    guildID VARCHAR(155) PRIMARY KEY, -- Айди сервера
    disabledCMDS LONGTEXT
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