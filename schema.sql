DROP TABLE IF EXISTS chatHistory; /* Delete chatHistory table if it already exists */

CREATE TABLE chatHistory (
    chatID INTEGER PRIMARY KEY AUTOINCREMENT, /* Surrogate key */
    sessionID INTEGER NOT NULL, /* Groups the chat history by session */
    userID INTEGER NOT NULL, /* Groups the chat history by user */
    botQuestion TEXT NOT NULL, /* The question asked by the bot */
    userResponse TEXT NOT NULL, /* The response given by the user */
    botReview TEXT NOT NULL, /* The review of user answer given by the bot */
    timestamp TEXT NOT NULL /* The timestamp of the chat */
);