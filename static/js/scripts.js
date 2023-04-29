$(document).ready(function () {
  // Button event listeners
  setUpButtonEventListeners();

  // Initialize UI elements
  initializeUIElements();

  // Set up speech recognition
  setUpSpeechRecognition();

  let recognition;

  // Functions for UI manipulation
  function toggleJobTitleInput(enable) {
    $("#jobTitle").prop("disabled", !enable);
    $("#jobTitleSubmit").prop("disabled", !enable);
  }
  function displayNextQuestion() {
    // Remove the 'locked' class from the elements
    $("#sendBtn").removeClass("locked");
    $("#userInput").removeClass("locked");
    $("#micBtn").removeClass("locked");

    $("#sendBtn").prop("disabled", false);
    $("#userInput").prop("disabled", false);
    $("#micBtn").prop("disabled", false);
    $("#userInput").focus();

    if (questionIndex === 5) {
      // Add this condition to check for 5 questions
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

      // Lock the buttons after calling the final_decision route
      $("#sendBtn").addClass("locked").prop("disabled", true);
      $("#userInput").addClass("locked").prop("disabled", true);
      $("#micBtn").addClass("locked").prop("disabled", true);

      toggleJobTitleInput(true);
    } else if (questionIndex < questions.length) {
      const question = questions[questionIndex];
      appendMessage(question, "bot");
      questionIndex++;
      $("#userInput").val("");

      $("#sendBtn").prop("disabled", false);
      $("#userInput").prop("disabled", false);
    }
  }
  function displayFeedback(feedback) {
    appendMessage(feedback, "bot");

    const breakElement = $("<li>").addClass("break");
    $("#chatBox").append(breakElement);
    displayNextQuestion();
  }

  function appendMessage(message, sender) {
    const liElement = $("<li>").addClass(sender).text(message);
    $("#chatBox").append(liElement);
    $("#chatBox").scrollTop($("#chatBox")[0].scrollHeight);
  }

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

  // AJAX request functions
  function isRealJobTitle(jobTitle, successCallback, errorCallback) {
    $.ajax({
      url: "/is_real_job_title",
      type: "POST",
      data: { job_title: jobTitle },
      success: function (response) {
        successCallback(response.is_real);
      },
      error: function (error) {
        console.error("Error checking job title:", error);
        errorCallback(error);
      },
    });
  }
  function generateQuestions(jobTitle, successCallback, errorCallback) {
    $.ajax({
      url: "/generate_questions",
      type: "POST",
      data: { job_title: jobTitle },
      success: function (response) {
        successCallback(response.questions);
      },
      error: function (error) {
        console.error("Error fetching questions:", error);
        errorCallback(error);
      },
    });
  }
  function evaluateResponse(
    userResponse,
    currentQuestion,
    jobTitle,
    successCallback,
    errorCallback
  ) {
    $.ajax({
      url: "/evaluate_response",
      type: "POST",
      data: {
        user_response: userResponse,
        question: currentQuestion,
        job_title: jobTitle,
      },
      success: function (response) {
        successCallback(response);
      },
      error: function (error) {
        console.error("Error evaluating response:", error);
        errorCallback(error);
      },
    });
  }
  function getFinalDecision(
    jobTitle,
    responses,
    successCallback,
    errorCallback
  ) {
    $.ajax({
      url: "/final_decision",
      type: "POST",
      data: { job_title: jobTitle, responses: JSON.stringify(responses) },
      success: function (response) {
        successCallback(response);
      },
      error: function (error) {
        console.error("Error getting final decision:", error);
        errorCallback(error);
      },
    });
  }

  // Event listener setup functions
  function setUpButtonEventListeners() {
    // Settings button click listener
    $("#settingsBtn").on("click", function () {
      $("#settingsModal").modal("show");
    });

    // Save settings button click listener
    $("#saveSettingsBtn").on("click", function () {
      // Save settings changes here
      $("#settingsModal").modal("hide");
    });

    // Mic button click listener
    $("#micBtn").on("mousedown", function () {
      if ($(this).hasClass("locked")) {
        alert("Enter a job title first.");
      } else if (recognition) {
        recognition.start();
      }
    });

    // Send button click listener
    $("#sendBtn").on("mousedown", function () {
      if ($(this).hasClass("locked")) {
        alert("Enter a job title first.");
      } else {
        sendResponse();
      }
    });

    // User input click listener
    $("#userInput").on("mousedown", function () {
      if ($(this).hasClass("locked")) {
        alert("Enter a job title first.");
      }
    });

    // Job title submit button click listener
    $("#jobTitleSubmit").on("click", function () {
      submitJobTitle();
    });

    // Job title input enter key press listener
    $("#jobTitle").on("keypress", function (e) {
      if (e.which == 13) {
        e.preventDefault();
        submitJobTitle();
      }
    });

    // Send button click listener
    $("#sendBtn").on("click", function () {
      sendResponse();
    });

    // User input enter key press listener
    $("#userInput").on("keypress", function (e) {
      if (e.which == 13) {
        e.preventDefault();
        sendResponse();
      }
    });
  }

  function initializeUIElements() {
    // Initialize buttons and input as locked
    $("#micBtn").addClass("locked");
    $("#sendBtn").addClass("locked");
    $("#userInput").addClass("locked");

    // Initialize buttons and input as disabled
    $("#sendBtn").prop("disabled", true);
    $("#userInput").prop("disabled", true);
    $("#micBtn").prop("disabled", true);
  }

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

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
      sendResponse(); // Automatically submit the recognized speech.
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
  function setUpSpeechRecognition() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

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
        sendResponse(); // Automatically submit the recognized speech.
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
  }
  function submitJobTitle() {
    const jobTitle = $("#jobTitle").val().trim();
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
});
