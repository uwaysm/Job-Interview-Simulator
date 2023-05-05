# README.md

## Interview Simulator

This Interview Simulator is a Flask web app that uses OpenAI's GPT-4 to generate interview questions for a specific job title, evaluate user responses, and provide feedback.

### Requirements

- Python 3.8 or higher
- Flask
- OpenAI
- NLTK

### Installation

1. Clone the repository:
```
git clone https://github.com/uwaysm/Job-Interview-Simulator.git
```

2. Navigate to the project directory:
```python
cd job-interview-simulator
```


3. Install the required packages:
```
pip install -r requirements.txt
```

### Running the Application

1. Set the Flask app environment variable:

- For Windows:
```
set FLASK_APP=app.py
```
- For macOS and Linux:
```
export FLASK_APP=app.py
```


2. Run the application:
```
flask run
```

3. Open a web browser and navigate to `http://127.0.0.1:5000/` to access the app.

### Usage

- Enter a job title, and the app will generate 5 interview questions for the role.
- Respond to each question, and the app will evaluate your response and provide feedback.
- After answering all the questions, the app will provide a final decision on your performance.

# Credits / Acknowledgements

This project is a collaborative effort by the following team members:

- Uways Minty (https://github.com/uwaysm)
- Lloyd Na (https://github.com/LloydN01)
- Jericho Cura (https://github.com/hurrkage)
- Jason Millman (https://github.com/Jayce-m)

We would also like to thank everyone who provided their valuable feedback and suggestions during the development process.

### License

This project is licensed under the MIT License.

