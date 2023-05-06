DROP TABLE IF EXISTS chatHistory; /* Delete chatHistory table if it already exists */
DROP TABLE IF EXISTS sessionHistory; /* Delete sessionHistory table if it already exists */

PRAGMA foreign_keys = ON; /* Enable foreign key constraints */

CREATE TABLE chatHistory (
    chatID INTEGER PRIMARY KEY AUTOINCREMENT, /* Surrogate key */
    sessionID INTEGER NOT NULL, /* Groups the chat history by session */
    botQuestion TEXT NOT NULL, /* The question asked by the bot */
    userResponse TEXT NOT NULL, /* The response given by the user */
    botReview TEXT NOT NULL, /* The review of user answer given by the bot */
    FOREIGN KEY (sessionID) REFERENCES sessionHistory(sessionID) /* Foreign key constraint */
);

CREATE TABLE sessionHistory (
    sessionID INTEGER PRIMARY KEY AUTOINCREMENT, /* SessionID -> each session is 5 questions */
    userID INTEGER NOT NULL, /* Groups the session history by user */
    jobTitle TEXT NOT NULL, /* The job title given by the user */
    finalDecision TEXT, /* The final decision made by the bot -> If the user does not finish a session (when they dont answer all 5 questions), it can be NULL*/
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP /* The timestamp of the session */
);