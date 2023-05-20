import json
import unittest
import os
from unittest.mock import patch
from flask_bcrypt import Bcrypt
from app import app, db, User, get_feedback, add_session_to_database

os.environ['DATABASE_URL'] = 'sqlite://'

class TestFlaskApp(unittest.TestCase):

    def setUp(self):
        self.app_context = app.app_context()
        self.app_context.push()
        self.app = app.test_client() # Flask provides a virtual test environment for testing our application
        app.config['TESTING'] = True
        app.config['WTF_CSRF_ENABLED'] = False
        self.bcrypt = Bcrypt(app)
        db.create_all()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()
        
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

    def test_register_user_existing_username(self):
        self.register_user('testuser', 'testpassword')
        response = self.register_user('testuser', 'testpassword2')
        self.assertIn(b'Username already exists.', response.data)

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
    def test_is_real_job_title_invalid(self, mock_is_real_job_title):
        mock_is_real_job_title.return_value = False
        response = self.app.post('/is_real_job_title', data=dict(job_title='random job title'))
        data = json.loads(response.data)
        self.assertFalse(data['is_real'])

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
        data = json.loads(response.data)
        self.assertEqual(data['questions'], ['Question 1', 'Question 2', 'Question 3'])

    @patch('app.generate_interview_questions')
    def test_generate_interview_questions_no_input(self, mock_generate_interview_questions):
        response = self.app.post('/generate_questions', data=dict(job_title=''))
        self.assertEqual(response.status_code, 400)

    # Test cases for response evaluation
    @patch('app.get_feedback')
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
        self.assertEqual(data['feedback'], 'Good answer!')

    @patch('app.evaluate_response_route')
    def test_evaluate_response_no_input(self, mock_evaluate_response):
        response = self.app.post('/evaluate_response', data=dict(response=''))
        self.assertEqual(response.status_code, 400)

    # Test cases for final decision making
    def test_decide(self):        
        sample_responses = [
            {
                "question": "Tell me about your experience.",
                "response": "I have worked in various positions...",
                "feedback": "Good answer!"
            },
        ]

        response = self.app.post('/final_decision', data={
            'job_title': 'Software Developer',
            'responses': json.dumps(sample_responses)  # Convert the list to a JSON string
        })

        data = json.loads(response.data)
        self.assertIsNotNone(data) # Check that the final decision is not None (i.e. it was calculated)

    @patch('app.final_decision_route')
    def test_decide_no_input(self, mock_decide):
        mock_decide.return_value = None
        response = self.app.post('/final_decision', data=dict(score=None))
        self.assertEqual(response.status_code, 400)

    # # Test cases for adding a session to the database
    # def test_add_session_to_database(self):
    #     # Build a fake profile
    #     userID = 100
    #     job_title = 'Software Engineer'
    #     responses = [
    #         {"question": "Tell me about your experience.", 
    #          "response": "I have worked at Google as a Software Engineer for 10 years", 
    #          "feedback": "Good answer!"}
    #     ]
    #     decision = "10/10 Hired!"

    #     db_test_session = db.session
        
    #     # Invoke the add_session_to_database() function using the test database connection
    #     add_session_to_database(userID, job_title, responses, decision, db_test_session)

    #     # Check that the session was added to the database
    #     self.cursor.execute("SELECT * FROM chatHistory JOIN sessionHistory ON chatHistory.sessionID = sessionHistory.sessionID")
    #     session_history = self.cursor.fetchall()
    #     self.assertEqual(len(session_history), 1) # Check that only one session exists
    #     self.assertEqual(session_history[0][1], 1)
    #     self.assertEqual(session_history[0][6], userID)
    #     self.assertEqual(session_history[0][7], job_title)
    #     self.assertEqual(session_history[0][2], responses[0]['question'])
    #     self.assertEqual(session_history[0][3], responses[0]['response'])
    #     self.assertEqual(session_history[0][4], responses[0]['feedback'])
    #     self.assertIsNotNone(session_history[0][8]) # Check that the final decision is not None (i.e. it was calculated)
    #     self.assertIsNotNone(session_history[0][9]) # Check that the timestamp is not None (i.e. it was added)

if __name__ == '__main__':
    unittest.main()