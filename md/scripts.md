# Interactive Job Interview Simulation

## Main Steps

1. User submits a job title.
2. Application generates interview questions based on the job title.
3. User answers the questions by typing or using speech recognition.
4. Application evaluates user's responses and provides feedback.
5. After all questions are answered, the application gives a final decision.

## Summary

- On document ready, the code initializes elements and sets up event handlers.
- The code sets up speech recognition.
- The interview simulation is an iterative process.

## Functions

### submitJobTitle()

- Submits the user's job title.
- Generates interview questions.
- Retrieves and trims the job title from the input field.
- Sends AJAX requests to check the validity of the job title and generate questions.
- Stores the received questions in the questions array.
- Calls displayNextQuestion() to display the first question.

### toggleJobTitleInput(enable)

- Enables or disables the job title input and submit button.
- Takes a boolean enable parameter.
- If enable is true, the input and submit button are enabled; otherwise, they are disabled.

### startRecognition()

- Starts the speech recognition process.
- Checks if the send button is disabled.
- Disables the mic button and starts speech recognition using the recognition.start() method.
- Re-enables the mic button when speech recognition ends using the recognition.onend event handler.

### sendResponse()

- Sends the user's response and evaluates it.
- Retrieves and trims the user's response from the input field.
- Disables the send button, user input, and mic button.
- Appends the user's response to the chat box using appendMessage().
- Sends an AJAX request to the /evaluate_response endpoint.
- Displays the server's response as feedback using displayFeedback().
- Stores the user's response, feedback, and question in the responses array.

### displayNextQuestion()

- Displays the next question or the final decision.
- Unlocks the send button, user input, and mic button.
- Displays the next question if there are more questions in the questions array.
- Sends an AJAX request to the /final_decision endpoint if all questions are answered.
- Displays the server's response, a thank you message, and prompts for a new job title.
- Disables the send button, user input, and mic button.
- Enables the job title input using toggleJobTitleInput(true).

### displayFeedback(feedback)

- Displays the feedback for the user's response.
- Appends the feedback to the chat box using appendMessage().
- Adds a break element to the chat box.
- Calls displayNextQuestion() to display the next question or final decision.

### appendMessage(message, sender)

- Appends a message to the chat box.
- Creates a new list item element and assigns the sender class (either "user" or "bot").
- Sets the text content to message.
- Appends the list item to the chat box and scrolls the chat box to the bottom.
