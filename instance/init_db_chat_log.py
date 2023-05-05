# Run this python script to create the database. Warning, if database exists, it will be deleted and recreated.

import sqlite3

conn = sqlite3.connect('./instance/database.db')

with open("./instance/chat_log_schema.sql") as f:
    conn.executescript(f.read())

conn.commit()
conn.close()
