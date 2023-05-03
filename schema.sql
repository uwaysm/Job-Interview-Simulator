DROP TABLE IF EXISTS chatHistory; /* Delete chatHistory table if it already exists */

CREATE TABLE chatHistory (
    chatId INTEGER PRIMARY KEY AUTOINCREMENT,
    userID INTEGER NOT NULL,
    botQuestion TEXT NOT NULL,
    userResponse TEXT NOT NULL,
    botReview TEXT NOT NULL,
    timestamp TEXT NOT NULL
);