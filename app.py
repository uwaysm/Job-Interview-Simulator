from flask import Flask, render_template, request, jsonify
import openai
import json
import os
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

# Download stopwords
try:
    nltk.download('stopwords')
except FileExistsError:
    pass

try:
    nltk.download('punkt')
except FileExistsError:
    pass

# Initialize Flask app
app = Flask(__name__)

# Set OpenAI API key
openai.api_key = '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'

# Function to check if a job title is real
def is_real_job_title(job_title):
    prompt = f"Is '{job_title}' a real job title?"
    
    # Call OpenAI API to generate a response
    response = openai.Completion.create(
        engine="text-davinci-003",
        prompt=prompt,
        max_tokens=10,
        n=1,
        stop=None,
        temperature=0.7,
    )
    
    # Process the response and return True if the answer contains 'yes'
    answer = response.choices[0].text.strip().lower()
    return 'yes' in answer

# Function to extract keywords from a text
def extract_keywords(text):
    stop_words = set(stopwords.words('english'))
    word_tokens = word_tokenize(text)

    keywords = [word.lower() for word in word_tokens if word.isalpha() and word.lower() not in stop_words]

    return keywords

# Function to get the final decision based on responses and the job title
def get_final_decision(responses, job_title):
    # Create the prompt for the OpenAI API
    prompt = f"Based on the following responses to the questions for the job title '{job_title}', provide a rating (1 to 10) and determine if the candidate is likely to be accepted for the job:\n"
    
    # Add each question and response to the prompt
    for response in responses:
        prompt += f"Question: {response['question']}\nResponse: {response['response']}\n\n"

    # Call the OpenAI API with the prompt
    response = openai.Completion.create(
        engine="text-davinci-003",
        prompt=prompt,
        max_tokens=50,
        n=1,
        stop=None,
        temperature=0.7,
    )
    
    # Extract the decision from the API response
    decision = response.choices[0].text.strip()
    return decision

# Function to generate interview questions for a job title
def generate_interview_questions(job_title):
    prompt = f"Pretend that you are an interviewer at a famous and high end company. Generate 5 interview questions that you would ask in an interview for the job title: {job_title}"
    
    # Call the OpenAI API to generate questions
    response = openai.Completion.create(
        engine="text-davinci-003",
        prompt=prompt,
        max_tokens=100,
        n=1,
        stop=None,
        temperature=0.7,
    )
    
    # Process the response and return the list of questions
    questions = response.choices[0].text.strip().split("\n")
    return questions

# Function to check if a user response is genuine
def is_genuine_response(user_response, question):
    question_keywords = extract_keywords(question)
    response_keywords = extract_keywords(user_response)

    common_keywords = set(question_keywords).intersection(set(response_keywords))

    if len(common_keywords) > 0:
        return True

    # Create a prompt to analyze the response
    prompt = f'Analyze the following response to the question "{question}":\n{user_response}\nIs this a genuine response or a troll response?'
    
    # Call the OpenAI API to analyze the response
    response = openai.Completion.create(
        engine="text-davinci-003",
        prompt=prompt,
        max_tokens=10,
        n=1,
        stop=None,
        temperature=0.7,
    )
    
    # Process the response and return True if it contains 'genuine'
    answer = response.choices[0].text.strip().lower()
    return 'genuine' in answer

# Function to get feedback on a user's response
def get_feedback(user_response, question, job_title, check_genuine_responses=True):
    if check_genuine_responses:
        genuine = is_genuine_response(user_response, question)

        if not genuine:
            return "Troll response"

    # Create a prompt for the OpenAI API
    prompt = f'Prompt: Given the job title "{job_title}", please analyze the following interview response to the question "{question}". Response: {user_response}. Provide a detailed evaluation of the response, highlighting its strengths, weaknesses, and any suggestions for improvement. Put the strengths and weaknesses on separate lines.'
    
    # Call the OpenAI API to get feedback
    response = openai.Completion.create(
        engine="text-davinci-003",
        prompt=prompt,
        max_tokens=300,
        n=1,
        stop=None,
        temperature=0.7,
    )
    
    # Process the response and return the feedback
    feedback = response.choices[0].text.strip()
    return feedback

# Route to check if a job title is real
@app.route('/is_real_job_title', methods=['POST'])
def is_real_job_title_route():
    job_title = request.form.get('job_title')
    if not job_title:
        return jsonify({'error': 'Job title is required'}), 400

    is_real = is_real_job_title(job_title)

    return jsonify({'is_real': is_real})

# Main route, renders the index.html template
@app.route('/')
def index():
    return render_template('index.html')

# Route to generate interview questions
@app.route('/generate_questions', methods=['POST'])
def generate_questions():
    job_title = request.form.get('job_title')
    if not job_title:
        return jsonify({'error': 'Job title is required'}), 400

    if not is_real_job_title(job_title):
        return jsonify({'error': 'Please provide a real job title'}), 400

    # Generate interview questions using the OpenAI API
    questions = generate_interview_questions(job_title)

    return jsonify({'questions': questions})

# Route to evaluate a user's response
@app.route('/evaluate_response', methods=['POST'])
def evaluate_response_route():
    check_genuine_responses = request.form.get('check_genuine_responses', 'True') == 'True'

    user_response = request.form.get('user_response')
    question = request.form.get('question')
    job_title = request.form.get('job_title')
    if not user_response or not question or not job_title:
        return jsonify({'error': 'User response, question, and job title are required'}), 400

    # Evaluate the user's response using the OpenAI API
    feedback = get_feedback(user_response, question, job_title, check_genuine_responses)

    return jsonify(feedback)

# Route to get the final decision based on user responses
@app.route('/final_decision', methods=['POST'])
def final_decision_route():
    job_title = request.form.get('job_title')
    response_data = request.form.get('responses')

    if not job_title or not response_data:
        return jsonify({'error': 'Job title and responses are required'}), 400

    # Parse the responses JSON string
    responses = json.loads(response_data)

    # Get the final decision based on the responses and job title
    decision = get_final_decision(responses, job_title)
    return jsonify(decision)

# Start the Flask app
if __name__ == '__main__':
    app.run(debug=True)

