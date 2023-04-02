$(document).ready(function () {
  // Check if the browser supports SpeechRecognition
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  let recognition;

  if (!SpeechRecognition) {
    console.error("Speech recognition is not supported in your browser.");
    $("#micBtn").prop("disabled", true);
  } else {
    // Create a new speech recognition instance
    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    // Handle the speech recognition result
    recognition.onresult = function (event) {
      const speechResult = event.results[0][0].transcript;
      $("#userInput").val(speechResult);
    };

    // Handle any speech recognition errors
    recognition.onerror = // Handle any speech recognition errors
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

  // Add event listener to the microphone button
  $("#micBtn").on("click", function () {
    if (recognition) {
      startRecognition();
    }
  });

  // Implement the startRecognition function
  function startRecognition() {
    recognition.continuous = true;

    $("#micBtn").prop("disabled", true); // Disable the mic button while recording

    recognition.start();

    recognition.onend = function () {
      $("#micBtn").prop("disabled", false); // Re-enable the mic button after recording
    };
  }

  let responses = [];
  function submitJobTitle() {
    const jobTitle = $("#jobTitle").val().trim();
    if (jobTitle) {
      toggleJobTitleInput(false); // Disable job title input and submit button
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
    }
  }

  $("#jobTitleSubmit").on("click", function () {
    submitJobTitle();
  });

  $("#jobTitle").on("keypress", function (e) {
    if (e.which == 13) {
      // 13 is the Enter key code
      e.preventDefault(); // Prevent default form submission behavior
      submitJobTitle();
    }
  });

  // Add the toggleJobTitleInput function here
  function toggleJobTitleInput(enable) {
    $("#jobTitle").prop("disabled", !enable);
    $("#jobTitleSubmit").prop("disabled", !enable);
  }

  // Disable the send button and user input field initially
  $("#sendBtn").prop("disabled", true);
  $("#userInput").prop("disabled", true);

  let questionIndex = 0;
  let questions = [];

  // Handle send button click
  function sendResponse() {
    const userResponse = $("#userInput").val().trim();
    if (userResponse) {
      // Lock send button and input field
      $("#sendBtn").prop("disabled", true);
      $("#userInput").prop("disabled", true);

      const currentQuestion = questions[questionIndex - 1];
      const jobTitle = $("#jobTitle").val(); // Get the selected job title

      // Display user's response
      appendMessage(userResponse, "user");

      // Clear the response box
      $("#userInput").val(""); // Add this line to clear the response box

      $.ajax({
        url: "/evaluate_response",
        type: "POST",
        data: {
          user_response: userResponse,
          question: currentQuestion,
          job_title: jobTitle,
        }, // Include the job title in the data
        success: function (response) {
          displayFeedback(response);
          responses.push({
            question: currentQuestion,
            response: userResponse,
            feedback: response,
          });
        },
        error: function (error) {
          console.error("Error evaluating response:", error);
        },
      });
    }
  }

  $("#sendBtn").on("click", function () {
    sendResponse();
  });

  $("#userInput").on("keypress", function (e) {
    if (e.which == 13) {
      // 13 is the Enter key code
      e.preventDefault(); // Prevent default form submission behavior
      sendResponse();
    }
  });

  function displayNextQuestion() {
    // Unlock send button and input field
    $("#sendBtn").prop("disabled", false);
    $("#userInput").prop("disabled", false);
    $("#userInput").focus(); // Set focus back to the input field

    if (questionIndex < questions.length) {
      const question = questions[questionIndex];
      appendMessage(question, "bot");
      questionIndex++;
      $("#userInput").val("");

      // Unlock send button and input field
      $("#sendBtn").prop("disabled", false);
      $("#userInput").prop("disabled", false);
    } else {
      // Request a final decision when the interview is complete
      const jobTitle = $("#jobTitle").val();
      $.ajax({
        url: "/final_decision",
        type: "POST",
        data: { job_title: jobTitle, responses: JSON.stringify(responses) },
        success: function (response) {
          appendMessage(`${response}`, "bot");
          appendMessage("Thank you for completing the interview!", "bot");
        },
        error: function (error) {
          console.error("Error getting final decision:", error);
        },
      });

      $("#sendBtn").prop("disabled", true);
      $("#userInput").prop("disabled", true);

      // Re-enable job title input and submit button
      toggleJobTitleInput(true);
    }
  }

  function displayFeedback(feedback) {
    appendMessage(feedback, "bot");

    // Add a break after the feedback
    const breakElement = $("<li>").addClass("break");
    $("#chatBox").append(breakElement);

    displayNextQuestion();
  }

  function appendMessage(message, sender) {
    const messageClass = sender === "bot" ? "bot-message" : "user-message";
    const messageElement = $("<li>").addClass(messageClass).text(message);
    $("#chatBox").append(messageElement);

    if (sender === "bot") {
      // Add a line break only after the bot's message
      const breakElement = $("<li>").addClass("break");
      $("#chatBox").append(breakElement);
    }

    $(".chat-container").scrollTop($(".chat-container")[0].scrollHeight);
  }
});
