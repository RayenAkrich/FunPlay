-- Database creation
CREATE DATABASE IF NOT EXISTS FunPlay;
USE FunPlay;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nickname VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    pwd VARCHAR(255) NOT NULL,
    loginStreak INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_guest BOOL DEFAULT FALSE
);

-- Games table
CREATE TABLE games (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gameName VARCHAR(100) NOT NULL,
    class ENUM('solo', 'multi', 'both') NOT NULL
);

-- GamePlayed table
CREATE TABLE gamePlayed (
    id INT AUTO_INCREMENT PRIMARY KEY,
    game_id INT NOT NULL,
    idPlayer1 INT NOT NULL,
    idPlayer2 INT,
    score INT,
    played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    class ENUM('solo', 'multi') NOT NULL,
    FOREIGN KEY (game_id) REFERENCES games(id),
    FOREIGN KEY (idPlayer1) REFERENCES users(id),
    FOREIGN KEY (idPlayer2) REFERENCES users(id)
);

-- Leaderboard table
CREATE TABLE leaderboard (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idPlayer INT NOT NULL,
    game_id INT NOT NULL,
    score INT NOT NULL,
    FOREIGN KEY (idPlayer) REFERENCES users(id),
    FOREIGN KEY (game_id) REFERENCES games(id)
);

-- Rooms table
CREATE TABLE rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ownerUserID INT NOT NULL,                
    gameID INT NOT NULL,                    
    pass VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    isfull BOOL,
    FOREIGN KEY (ownerUserID) REFERENCES users(id),
    FOREIGN KEY (gameID) REFERENCES games(id)
);

-- RoomUsers table
CREATE TABLE room_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    roomID INT NOT NULL,
    userID INT NOT NULL,
    FOREIGN KEY (roomID) REFERENCES rooms(id),
    FOREIGN KEY (userID) REFERENCES users(id)
);

use funplay;
select * from gameplayed;
select * from games;
select * from leaderboard;
select * from rooms;
select * from users;