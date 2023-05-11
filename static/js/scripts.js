// ------------------------------
// Variable declarations
// ------------------------------
let questionIndex = 0;
let questions = [];
let responses = [];

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition;

// ------------------------------
// Functions
// ------------------------------

//  Starts speech recognition and sets the "micBtn" button to disabled. When recognition ends, it re-enables the "micBtn" button.
function startRecognition() {
  if ($("#sendBtn").prop("disabled")) {
    return;
  }

  $("#micBtn").prop("disabled", true);

  recognition.start();

  recognition.onend = function () {
    $("#micBtn").prop("disabled", false);
  };
}

window.onload = () => {
  document
      .getElementsByClassName("chat-history-button")[0]
      .addEventListener("click", function () {
          window.location.href = "/chat_logs";
  });
}

// Accepts a boolean "enable" as an argument and enables or disables the "jobTitle" input field and "jobTitleSubmit" button accordingly.
function toggleJobTitleInput(enable) {
  $("#jobTitle").prop("disabled", !enable);
  $("#jobTitleSubmit").prop("disabled", !enable);
}

//  Validates the entered job title by making an AJAX request to the "/is_real_job_title" endpoint.
// If it's a valid job title, it disables the job title input and submits the job title to the "/generate_questions" endpoint to receive a list of questions.
// The questions are then stored in the "questions" array, and the first question is displayed.
function submitJobTitle() {
  const jobTitle = $("#jobTitle").val().trim();

  // Reset the responses and questions arrays
  responses = [];
  questions = [];
  
  if (jobTitle) {
    toggleJobTitleInput(false);
    // Check if the job title is real before proceeding
    $.ajax({
      url: "/is_real_job_title",
      type: "POST",
      data: { job_title: jobTitle },
      success: function (response) {
        if (response.is_real) {
          $.ajax({
            url: "/generate_questions",
            type: "POST",
            data: { job_title: jobTitle },
            success: function (response) {
              questions = response.questions;
              questionIndex = 0;
              displayNextQuestion();
            },
            error: function (error) {
              console.error("Error fetching questions:", error);
            },
          });
        } else {
          alert("Enter a real job title");
          toggleJobTitleInput(true);
        }
      },
      error: function (error) {
        console.error("Error checking job title:", error);
      },
    });
  }
}
// Takes the user's input from the "userInput" field, appends it to the chat box, and sends it to the "/evaluate_response" endpoint for evaluation.
// Stores the response and feedback in the "responses" array. If there's an error, logs it in the console.
function sendResponse() {
  const userResponse = $("#userInput").val().trim();
  if (userResponse) {
    $("#sendBtn").prop("disabled", true);
    $("#userInput").prop("disabled", true);
    $("#micBtn").prop("disabled", true);

    const currentQuestion = questions[questionIndex - 1];
    const jobTitle = $("#jobTitle").val();

    appendMessage(userResponse, "user");

    $("#userInput").val("");

    $.ajax({
      url: "/evaluate_response",
      type: "POST",
      data: {
        user_response: userResponse,
        question: currentQuestion,
        job_title: jobTitle,
      },
      success: function (response) {
        responses.push({
          question: currentQuestion,
          response: userResponse,
          feedback: response
        });
        
        displayFeedback(response);
      },
      error: function (error) {
        console.error("Error evaluating response:", error);
      },
    });
  }

  $("#chatbox").scrollTop($("#chatbox").height());
}

// Removes the "locked" class from the elements, enables input fields and buttons, and displays the next question in the "questions" array.
// If there are no more questions, it sends the user's responses to the "/final_decision" endpoint and displays the final decision in the chat box.
function displayNextQuestion() {
  // Remove the 'locked' class from the elements
  $("#sendBtn").removeClass("locked");
  $("#userInput").removeClass("locked");
  $("#micBtn").removeClass("locked");

  $("#sendBtn").prop("disabled", false);
  $("#userInput").prop("disabled", false);
  $("#micBtn").prop("disabled", false);
  $("#userInput").focus();

  if (questionIndex < questions.length) {
    const question = questions[questionIndex];
    appendMessage(question, "bot");
    questionIndex++;
    $("#userInput").val("");

    $("#sendBtn").prop("disabled", false);
    $("#userInput").prop("disabled", false);
  } else {
    const jobTitle = $("#jobTitle").val();
    $.ajax({
      url: "/final_decision",
      type: "POST",
      data: { job_title: jobTitle, responses: JSON.stringify(responses) },
      success: function (response) {
        appendMessage(`${response}`, "bot");
        appendMessage("", "bot");
        appendMessage("Thank you for completing the interview!", "bot");
        appendMessage(
          "Enter a job title if you would like another interview.",
          "bot"
        );
      },
      error: function (error) {
        console.error("Error getting final decision:", error);
      },
    });

    $("#sendBtn").prop("disabled", true);
    $("#userInput").prop("disabled", true);
    $("#micBtn").prop("disabled", true);

    toggleJobTitleInput(true);
  }
}

//  Accepts "feedback" as an argument, appends the feedback message to the chat box, and calls the displayNextQuestion function.
function displayFeedback(feedback) {
  appendMessage(feedback, "bot");

  const breakElement = $("<li>").addClass("break");
  $("#chatBox").append(breakElement);
  displayNextQuestion();
  $("#chatbox").scrollTop($("#chatbox").height());
}

//  Accepts "message" and "sender" as arguments, creates a new list item element with the sender's class and message text,
// and appends it to the chat box. Scrolls to the bottom of the chat box.
function appendMessage(message, sender) {
  const liElement = $("<li>").addClass(sender).text(message);
  $("#chatBox").append(liElement);
  
// ------------------------------
// Event Listeners
// ------------------------------

$(document).ready(function () {
  $("#userInput").addClass("locked");

  $("#settingsBtn").on("click", function () {
    $("#settingsModal").modal("show");
  });

  // Opens the settings modal when the settings button is clicked.
  $("#saveSettingsBtn").on("click", function () {
    // Save settings changes here
    $("#settingsModal").modal("hide");
  });

  //  Closes the settings modal when the save settings button is clicked. (Note: Settings changes should be saved here.)
  $("#micBtn").addClass("locked");
  $("#sendBtn").addClass("locked");
  $("#userInput").addClass("locked");
  $("#userInput").prop("disabled", true);

  // When the "micBtn" button is pressed, if it's locked, it shows an alert asking to enter a job title first.
  // If speech recognition is supported, it calls the startRecognition function.
  $("#micBtn").on("mousedown", function () {
    if ($(this).hasClass("locked")) {
      alert("Enter a job title first.");
    } else if (recognition) {
      startRecognition();
    }
  });

  // When the "sendBtn" button is pressed, if it's locked, it shows an alert asking to enter a job title first.
  // If not locked, it calls the sendResponse function.
  $("#sendBtn").on("mousedown", function () {
    if ($(this).hasClass("locked")) {
      alert("Enter a job title first.");
    } else {
      sendResponse();
    }
  });

  // When the "userInput" field is clicked, if it's locked, it shows an alert asking to enter a job title first.
  $("#userInput").on("mousedown", function () {
    if ($(this).hasClass("locked")) {
      alert("Enter a job title first.");
    }
  });

  // If speech recognition is supported, it calls the startRecognition function when the "micBtn" button is clicked.
  if (!SpeechRecognition) {
    console.error("Speech recognition is not supported in your browser.");
    $("#micBtn").prop("disabled", true);
  } else {
    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = function (event) {
      const speechResult = event.results[0][0].transcript;
      $("#userInput").val(speechResult);
    };

    recognition.onerror = function (event) {
      console.error("Error during speech recognition:", event.error);
      if (event.error === "not-allowed") {
        alert(
          "Access to the microphone was denied. Please allow access to the microphone to use the voice input feature."
        );
      } else {
        alert("An error occurred during speech recognition: " + event.error);
      }
    };
  }

  $("#micBtn").on("click", function () {
    if (recognition) {
      startRecognition();
    }
  });

  // Calls the submitJobTitle function when the "jobTitleSubmit" button is clicked.
  $("#jobTitleSubmit").on("click", function () {
    submitJobTitle();
  });

  // Calls the submitJobTitle function when the "Enter" key is pressed in the "jobTitle" input field.
  $("#jobTitle").on("keypress", function (e) {
    if (e.which == 13) {
      e.preventDefault();
      submitJobTitle();
    }
  });

  //  Calls the sendResponse function when the "sendBtn" button is clicked.
  $("#sendBtn").on("click", function () {
    sendResponse();
  });

  //  Calls the sendResponse function when the "Enter" key is pressed in the "userInput" field.
  $("#userInput").on("keypress", function (e) {
    if (e.which == 13) {
      e.preventDefault();
      sendResponse();
    }
  });
});
