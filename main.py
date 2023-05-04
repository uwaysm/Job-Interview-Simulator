from flask import Flask, render_template
from src.app import is_real_job_title_route, generate_questions, evaluate_response_route, final_decision_route

def create_app():
    app = Flask(__name__)

    @app.route('/')
    def landing():
        return render_template('landing.html')

    @app.route('/login')
    def login():
        return render_template('login.html')

    @app.route('/register')
    def register():
        return render_template('register.html')

    @app.route('/app')
    def app_main():
        return render_template('app.html')

    app.add_url_rule('/is_real_job_title', 'is_real_job_title_route', is_real_job_title_route, methods=['POST'])
    app.add_url_rule('/generate_questions', 'generate_questions', generate_questions, methods=['POST'])
    app.add_url_rule('/evaluate_response', 'evaluate_response_route', evaluate_response_route, methods=['POST'])
    app.add_url_rule('/final_decision', 'final_decision_route', final_decision_route, methods=['POST'])

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
