from flask import Flask
from flask_sqlalchemy import SQLAlchemy

from main import *

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key_here'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///your_database.db'
db = SQLAlchemy()
db.init_app(app)

# Add route functions
app.add_url_rule('/', 'landing', landing)
app.add_url_rule('/app', 'app_main', app_main)
app.add_url_rule('/is_real_job_title', 'is_real_job_title_route', is_real_job_title_route, methods=['POST'])
app.add_url_rule('/generate_questions', 'generate_questions', generate_questions, methods=['POST'])
app.add_url_rule('/evaluate_response', 'evaluate_response_route', evaluate_response_route, methods=['POST'])
app.add_url_rule('/final_decision', 'final_decision_route', final_decision_route, methods=['POST'])
app.add_url_rule('/login', 'login', login, methods=['GET', 'POST'])
app.add_url_rule('/register', 'register', register, methods=['GET', 'POST'])
app.add_url_rule('/logout', 'logout', logout, methods=['GET'])

if __name__ == '__main__':
    app.run(debug=True)
