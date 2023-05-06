import json
import unittest
from unittest.mock import patch
from flask_bcrypt import Bcrypt
from app import app, db, User
import sqlite3
import os
from app import get_feedback 

class TestFlaskApp(unittest.TestCase):
    def create_tables(self):
        db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'instance', 'database.db')
        sqlite3.connect('./instance/database.db')

    def setUp(self):
        app.config['TESTING'] = True
        app.config['SQLALCHEMY_DATABASE_URI'] = 'your_test_database_uri'
        app.config['WTF_CSRF_ENABLED'] = False
        self.app = app.test_client()
        self.create_tables()
        with app.app_context():
            db.create_all()
        self.bcrypt = Bcrypt(app)

    def tearDown(self):
        with app.app_context():
            db.session.remove()
            db.drop_all()

    def register_user(self, username, password):
        return self.app.post('/register', data=dict(username=username, password=password, confirm_password=password), follow_redirects=True)

    def login_user(self, username, password):
        return self.app.post('/login', data=dict(username=username, password=password), follow_redirects=True)

    def logout_user(self):
        return self.app.get('/logout', follow_redirects=True)

    def test_register_user(self):
        response = self.register_user('testuser', 'testpassword')
        self.assertIn(b'Your account has been created!', response.data)

        # Wrap the code that needs the application context
        with self.app.application.app_context():
            user = User.query.filter_by(username='testuser').first()
            self.assertIsNotNone(user)
            self.assertTrue(self.bcrypt.check_password_hash(user.password, 'testpassword'))



    # def test_register_user_existing_username(self):
    #     self.register_user('testuser', 'testpassword')
    #     response = self.register_user('testuser', 'testpassword2')
    #     self.assertIn(b'Username already exists.', response.data)

    def test_login_logout(self):
        self.register_user('testuser', 'testpassword')
        response = self.login_user('testuser', 'testpassword')
        self.assertIn(b'Logged in successfully!', response.data)
        response = self.logout_user()
        self.assertIn(b'GetHired.ai', response.data)

    def test_login_wrong_password(self):
        self.register_user('testuser', 'testpassword')
        response = self.login_user('testuser', 'wrongpassword')
        self.assertIn(b'Invalid username or password.', response.data)

    def test_login_nonexistent_user(self):
        response = self.login_user('nonexistent', 'testpassword')
        self.assertIn(b'Invalid username or password.', response.data)

    # Test cases for job title validation
    @patch('app.is_real_job_title')
    def test_is_real_job_title(self, mock_is_real_job_title):
        mock_is_real_job_title.return_value = True
        response = self.app.post('/is_real_job_title', data=dict(job_title='Software Engineer'))
        data = json.loads(response.data)
        self.assertTrue(data['is_real'])

    @patch('app.is_real_job_title')
    def test_is_real_job_title_no_input(self, mock_is_real_job_title):
        response = self.app.post('/is_real_job_title', data=dict(job_title=''))
        self.assertEqual(response.status_code, 400)

    # Test cases for interview question generation
    @patch('app.generate_interview_questions')
    def test_generate_interview_questions(self, mock_generate_interview_questions):
        mock_generate_interview_questions.return_value = [
            'Question 1', 'Question 2', 'Question 3']
        response = self.app.post('/generate_questions', data=dict(job_title='Software Engineer'))
        print(response)
        data = json.loads(response.data)
        print(data['questions'])
        self.assertEqual(data['questions'], ['Question 1', 'Question 2', 'Question 3'])

    @patch('app.generate_interview_questions')
    def test_generate_interview_questions_no_input(self, mock_generate_interview_questions):
        response = self.app.post('/generate_questions', data=dict(job_title=''))
        self.assertEqual(response.status_code, 400)

        # Test cases for response evaluation
    @patch('app.get_feedback')  # Change this line
    def test_evaluate_response(self, mock_get_feedback):
        mock_get_feedback.return_value = {
            'score': 0.75,
            'feedback': 'Good answer!'
        }
        response = self.app.post('/evaluate_response', data={
            'user_response': 'I have worked in various positions...',
            'question': 'Tell me about your experience.',
            'job_title': 'Software Developer'
        })
        data = json.loads(response.data)
        self.assertEqual(data['score'], 0.75)



    @patch('app.evaluate_response_route')
    def test_evaluate_response_no_input(self, mock_evaluate_response):
        response = self.app.post('/evaluate_response', data=dict(response=''))
        self.assertEqual(response.status_code, 400)

    # Test cases for final decision making
    def test_decide(self):
        db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'instance', 'database.db')
        
        sample_responses = [
            {
                "question": "Tell me about your experience.",
                "response": "I have worked in various positions...",
                "feedback": "Good answer!"
            },
            # Add more response objects if needed
        ]

        response = self.app.post('/final_decision', data={
            'job_title': 'Software Developer',
            'responses': json.dumps(sample_responses)  # Convert the list to a JSON string
        })

        data = json.loads(response.data)
        self.assertIn("Yes", data)

        

    @patch('app.final_decision_route', return_value=None)  # Change this line
    def test_decide_no_input(self, mock_decide):
        response = self.app.post('/final_decision', data=dict(score=None))
        self.assertEqual(response.status_code, 400)

if __name__ == '__main__':
    unittest.main()

