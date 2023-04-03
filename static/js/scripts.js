$(document).ready(function () {
  $("#settingsBtn").on("click", function () {
    $("#settingsModal").modal("show");
  });

  $("#saveSettingsBtn").on("click", function () {
    // Save settings changes here
    $("#settingsModal").modal("hide");
  });

  $("#micBtn").addClass("locked");
  $("#sendBtn").addClass("locked");
  $("#userInput").addClass("locked");

  $("#micBtn").on("mousedown", function () {
    if ($(this).hasClass("locked")) {
      alert("Enter a job title first.");
    } else if (recognition) {
      startRecognition();
    }
  });

  $("#sendBtn").on("mousedown", function () {
    if ($(this).hasClass("locked")) {
      alert("Enter a job title first.");
    } else {
      sendResponse();
    }
  });

  $("#userInput").on("mousedown", function () {
    if ($(this).hasClass("locked")) {
      alert("Enter a job title first.");
    }
  });

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

  let responses = [];
  function submitJobTitle() {
    const jobTitle = $("#jobTitle").val().trim();
    if (jobTitle) {
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
    }
  }

  $("#jobTitleSubmit").on("click", function () {
    submitJobTitle();
  });

  $("#jobTitle").on("keypress", function (e) {
    if (e.which == 13) {
      e.preventDefault();
      submitJobTitle();
    }
  });

  function toggleJobTitleInput(enable) {
    $("#jobTitle").prop("disabled", !enable);
    $("#jobTitleSubmit").prop("disabled", !enable);
  }

  $("#sendBtn").prop("disabled", true);
  $("#userInput").prop("disabled", true);
  $("#micBtn").prop("disabled", true);

  let questionIndex = 0;
  let questions = [];

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

  $("#sendBtn").on("click", function () {
    sendResponse();
  });

  $("#userInput").on("keypress", function (e) {
    if (e.which == 13) {
      e.preventDefault();
      sendResponse();
    }
  });

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
          appendMessage("Thank you for completing the interview!", "bot");
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
});
