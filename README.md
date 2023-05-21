# README.md

# Job Interview Simulator Web Application

This web application is a Job Interview Simulator that helps users practice their interview skills. Users can enter a job title and the AI-powered system will generate relevant interview questions. Users can then respond to these questions and receive feedback on their responses, as well as a final decision on whether they would be accepted for the job.

### Usage

- Enter a job title, and the app will generate 5 interview questions for the role.
- Respond to each question, and the app will evaluate your response and provide feedback.
- After answering all the questions, the app will provide a final decision on your performance.

## Architecture

The application is built using the Flask web framework and is powered by OpenAI's GPT-4 API. It has the following primary components:

1. **Flask**: A lightweight web framework used to develop the web application.
2. **SQLAlchemy**: A SQL toolkit and Object-Relational Mapping (ORM) system that gives application developers the full power and flexibility of SQL.
3. **OpenAI API**: The GPT-4 API is used to generate interview questions, evaluate responses, and provide feedback to the user.
4. **Flask-Login**: A Flask extension that handles user authentication and management.
5. **Flask-WTF**: A Flask extension for handling forms.
6. **Flask-Bcrypt**: A Flask extension for hashing passwords.
7. **Flask-SQLAlchemy**: A Flask extension that provides a simple interface for using SQLAlchemy with Flask.

## Notes for marker
- Execute the unit test (unit_test.py) before running the app.
- When the html validator is run on the chat_logs.html, there are some errors associated with the Jinja2 code, this is because the HTML validator can only validate plain HTML. It cannot parse or understand server-side templating languages like Jinja2.
- Therefore to test the html it's necessary to render the html in a browser and test the rendered html instead of the chat_logs.html as when they are rendered the Jinja2 templating engine will process all of the Jinja code and replace them with the appropriate HTML content.

## Setup

Follow the instructions below to setup a virtual environment and run the application.

1. Clone the repository:

```
git clone https://github.com/uwaysm/Job-Interview-Simulator
cd Job-Interview-Simulator
```

2. Create a virtual environment:
```
python -m venv env
```

3. Activate the virtual environment:
- On Windows:
```
.\env\Scripts\activate
```

- On Unix or MacOS:
```
source env/bin/activate
```
4. Install the necessary Python packages:

```
pip install -r requirements.txt
```
5. Set your OpenAI API key in the `.env` file in the variable `OPENAI_API_KEY`

6. Run the application:
```
python app.py
```

6. Open a web browser and enter the following URL to access the application:

`http://localhost:5001/`

# Python-Unittest Unit Tests
The unit tests for the Job Interview Simulator web application cover the following features:

## 1. User Registration, Login, and Logout

- Test successful user registration with a unique username and password.
- Test unsuccessful user registration with an existing username.
- Test successful user login and logout.
- Test unsuccessful user login with the wrong password.
- Test unsuccessful user login with a nonexistent username.

## 2. Job Title Validation

- Test the validation of real job titles.
- Test the validation of job titles with no input.

## 3. Interview Question Generation

- Test successful interview question generation based on a job title.
- Test unsuccessful interview question generation with no input.

## 4. Response Evaluation

- Test successful evaluation of user responses with scores and feedback.
- Test unsuccessful evaluation of user responses with no input.

## 5. Final Decision Making

- Test the final decision-making process based on user responses.
- Test the final decision-making process with no input.

## 6. Session Handling
- Tests whether a session can be successfully added to the database. 
- Compares the chat history recorded in the database with the input responses, checking if they are of the same length and contain the same values.

## 7. Chat Logs Access
- Tests whether an authenticated user can successfully access the chat logs.
- Checks if the response status code is 200, indicating successful access.
- Tests the behavior when an unauthenticated user tries to access the chat logs page
- Checks if the response status code is not equal to 400, indicating that an unauthorized request has not been made.

You can find the corresponding test methods in the `TestFlaskApp` class in the `unit_tests.py` file.

## How to run the unit tests

### Prerequisites

Before you begin, make sure you have completed the steps to set up and run the web application locally. Additionally, ensure you have the following Python packages installed:

- unittest

## Step 1: Run the tests

Open a terminal or command prompt, navigate to the project directory, and run the following command to execute the unit tests:

```bash
python -m unittest test_app.py
```

## Selenium Unit Tests

In our application, we use Selenium for end-to-end testing. Selenium is a powerful tool for controlling web browsers through programs and automating browser tasks. It provides a way to test interactions that require complex user behaviors or sequences of events, and it can be used to simulate real user interactions with your web application.

### Running Selenium Tests

Before running the tests, ensure that you have the Selenium WebDriver installed and configured. You will also need to have the specific WebDriver for the browser you wish to use (e.g., Chrome, Firefox).

To run the tests, use the following command:

```shell
python selenium_test.py
```

# Credits / Acknowledgements

This project is a collaborative effort by the following team members:

- Uways Minty (https://github.com/uwaysm)
- Lloyd Na (https://github.com/LloydN01)
- Jericho Cura (https://github.com/hurrkage)
- Jason Millman (https://github.com/Jayce-m)

We would also like to thank everyone who provided their valuable feedback and suggestions during the development process.

### License

This project is licensed under the MIT License.

