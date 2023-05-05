// Execute when the document is ready
$(document).ready(function () {
  // Show the settings modal when the settings button is clicked
  $("#settingsBtn").on("click", function () {
    $("#settingsModal").modal("show");
  });

  // Hide the settings modal and save the settings changes when the save button is clicked
  $("#saveSettingsBtn").on("click", function () {
    // Save settings changes here
    $("#settingsModal").modal("hide");
  });

  // Initialize buttons and input as locked
  $("#micBtn").addClass("locked");
  $("#sendBtn").addClass("locked");
  $("#userInput").addClass("locked");

  // Alert the user to enter a job title first when they click the locked mic button
  $("#micBtn").on("mousedown", function () {
    if ($(this).hasClass("locked")) {
      alert("Enter a job title first.");
    } else if (recognition) {
      startRecognition();
    }
  });

  // Alert the user to enter a job title first when they click the locked send button
  $("#sendBtn").on("mousedown", function () {
    if ($(this).hasClass("locked")) {
      alert("Enter a job title first.");
    } else {
      sendResponse();
    }
  });

  // Alert the user to enter a job title first when they click the locked user input
  $("#userInput").on("mousedown", function () {
    if ($(this).hasClass("locked")) {
      alert("Enter a job title first.");
    }
  });

  // Set up speech recognition
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  let recognition;

  if (!SpeechRecognition) {
    console.error("Speech recognition is not supported in your browser.");
    $("#micBtn").prop("disabled", true);
  } else {
    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    // Handle speech recognition results
    recognition.onresult = function (event) {
      const speechResult = event.results[0][0].transcript;
      $("#userInput").val(speechResult);
    };

    // Handle speech recognition errors
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

  // Start speech recognition when the mic button is clicked
  $("#micBtn").on("click", function () {
    if (recognition) {
      startRecognition();
    }
  });

  // Start the speech recognition process
  function startRecognition() {
    if ($("#sendBtn").prop("disabled")) {
      return;
    }

    $("#micBtn").prop("disabled", true);

    recognition.start();

    // Re-enable the mic button when speech recognition ends
    recognition.onend = function () {
      $("#micBtn").prop("disabled", false);
    };
  }

  // Store responses
  let responses = [];

  let questionIndex = 0;
  let questions = [];

  // Submit the job title and generate interview questions
  function submitJobTitle() {
    const jobTitle = $("#jobTitle").val().trim();

    // Reset the responses and questions arrays
    responses = [];
    questions = [];
    
    if (jobTitle) {
      // Check if the job title is real before proceeding
      $.ajax({
        url: "/is_real_job_title",
        type: "POST",
        data: { job_title: jobTitle },
        success: function (response) {
          if (response.is_real) {
            toggleJobTitleInput(false);
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
          }
        },
        error: function (error) {
          console.error("Error checking job title:", error);
        },
      });
    }
  }

  // Submit the job title when the submit button is clicked
  $("#jobTitleSubmit").on("click", function () {
    submitJobTitle();
  });

  // Submit the job title when the enter key is pressed
  $("#jobTitle").on("keypress", function (e) {
    if (e.which == 13) {
      e.preventDefault();
      submitJobTitle();
    }
  });

  // Enable or disable job title input
  function toggleJobTitleInput(enable) {
    $("#jobTitle").prop("disabled", !enable);
    $("#jobTitleSubmit").prop("disabled", !enable);
  }

  // Initialize buttons and input as disabled
  $("#sendBtn").prop("disabled", true);
  $("#userInput").prop("disabled", true);
  $("#micBtn").prop("disabled", true);

  // Send the user's response and evaluate it
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
          job_title: jobTitle
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
  }

  // Send the response when the send button is clicked
  $("#sendBtn").on("click", function () {
    sendResponse();
  });

  // Send the response when the enter key is pressed
  $("#userInput").on("keypress", function (e) {
    if (e.which == 13) {
      e.preventDefault();
      sendResponse();
    }
  });

  // Display the next question or final decision
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

  // Display the feedback for the user's response
  function displayFeedback(feedback) {
    appendMessage(feedback, "bot");

    const breakElement = $("<li>").addClass("break");
    $("#chatBox").append(breakElement);
    displayNextQuestion();
  }

  // Append a message to the chat box
  function appendMessage(message, sender) {
    const liElement = $("<li>").addClass(sender).text(message);
    $("#chatBox").append(liElement);
    $("#chatBox").scrollTop($("#chatBox")[0].scrollHeight);
  }
});
