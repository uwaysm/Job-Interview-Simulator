from flask import Flask, render_template, request, jsonify
import openai
import os

app = Flask(__name__)

openai.api_key = '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'

def generate_interview_questions(job_title):
    prompt = f"Pretend that you are an interviewer at a famous and high end company. Generate 5 interview questions that you would ask in an interview for the job title: {job_title}"
    
    response = openai.Completion.create(
        engine="text-davinci-003",
        prompt=prompt,
        max_tokens=100,
        n=1,
        stop=None,
        temperature=0.7,
    )
    
    questions = response.choices[0].text.strip().split("\n")
    return questions

def get_feedback(user_response, question, job_title):
    prompt = f'Prompt: Given the job title "{job_title}", please analyze the following interview response to the question "{question}". Response: {user_response}. Provide a detailed evaluation of the response, highlighting its strengths, weaknesses, and any suggestions for improvement. Put the strenghts and weaknesses on separate lines.'
    
    response = openai.Completion.create(
        engine="text-davinci-003",
        prompt=prompt,
        max_tokens=300,
        n=1,
        stop=None,
        temperature=0.7,
    )
    
    feedback = response.choices[0].text.strip()
    return feedback


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate_questions', methods=['POST'])
def generate_questions():
    job_title = request.form.get('job_title')
    if not job_title:
        return jsonify({'error': 'Job title is required'}), 400

    # Generate interview questions using the OpenAI API
    questions = generate_interview_questions(job_title)

    return jsonify({'questions': questions})

@app.route('/evaluate_response', methods=['POST'])
def evaluate_response_route():
    user_response = request.form.get('user_response')
    question = request.form.get('question')
    job_title = request.form.get('job_title')
    if not user_response or not question or not job_title:
        return jsonify({'error': 'User response, question, and job title are required'}), 400

    # Evaluate the user's response using the OpenAI API
    feedback = get_feedback(user_response, question, job_title)

    return jsonify(feedback)

if __name__ == '__main__':
    app.run(debug=True)
