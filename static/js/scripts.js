$(document).ready(function () {
  let checkForRealJobTitle = true;
  let checkGenuineResponses = true;

  $("#saveSettingsBtn").on("click", function () {
    checkForRealJobTitle = $("#checkForRealJobTitle").is(":checked");
    checkGenuineResponses = $("#checkforGenuineResponse").is(":checked");
    $("#settingsModal").modal("hide");
  });

  $("#settingsBtn").on("click", function () {
    $("#settingsModal").modal("show");
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
      if (checkForRealJobTitle) {
        // Check if the job title is real before proceeding
        $.ajax({
          url: "/is_real_job_title",
          type: "POST",
          data: { job_title: jobTitle },
          success: function (response) {
            if (response.is_real) {
              proceedWithQuestions(jobTitle);
            } else {
              alert("Enter a real job title");
            }
          },
          error: function (error) {
            console.error("Error checking job title:", error);
          },
        });
      } else {
        proceedWithQuestions(jobTitle);
      }
    }
  }
  function proceedWithQuestions(jobTitle) {
    toggleJobTitleInput(false);
    $.ajax({
      url: "/generate_questions",
      type: "POST",
      data: {
        job_title: jobTitle,
      },
      success: function (response) {
        if (response.questions) {
          displayQuestions(response.questions);
        } else {
          alert("Error generating questions. Please try again.");
          toggleJobTitleInput(true);
        }
      },
      error: function (error) {
        console.error("Error generating questions:", error);
        toggleJobTitleInput(true);
      },
    });
  }

  function toggleJobTitleInput(enable) {
    if (enable) {
      $("#jobTitle").removeAttr("disabled");
      $("#submitJobTitleBtn").removeAttr("disabled");
    } else {
      $("#jobTitle").attr("disabled", "disabled");
      $("#submitJobTitleBtn").attr("disabled", "disabled");
    }
  }

  function displayQuestions(questions) {
    $("#questions").empty();

    questions.forEach(function (question, index) {
      const listItem = $(
        `<li class="list-group-item">${index + 1}. ${question}</li>`
      );
      $("#questions").append(listItem);
    });

    $("#micBtn").removeClass("locked");
    $("#sendBtn").removeClass("locked");
    $("#userInput").removeClass("locked");
  }

  function sendResponse() {
    const userInput = $("#userInput").val().trim();
    if (userInput) {
      responses.push(userInput);
      $("#userInput").val("");

      if (responses.length >= 5) {
        if (checkGenuineResponses) {
          $.ajax({
            url: "/evaluate_response",
            type: "POST",
            data: {
              user_response: userInput,
              question: currentQuestion,
              job_title: jobTitle,
              check_genuine_responses: checkGenuineResponses, // added this line
            },
            success: function (response) {
              if (response.are_genuine) {
                alert("Thank you for your genuine responses!");
                responses = [];
              } else {
                alert("Some responses were not genuine. Please try again.");
                responses.pop();
              }
            },
            error: function (error) {
              console.error("Error checking responses:", error);
            },
          });
        } else {
          alert("Thank you for your responses!");
          responses = [];
        }
      }
    }
  }

  $("#submitJobTitleBtn").on("click", function () {
    submitJobTitle();
  });

  $("#jobTitle").on("keydown", function (event) {
    if (event.key === "Enter") {
      submitJobTitle();
    }
  });

  $("#userInput").on("keydown", function (event) {
    if (event.key === "Enter") {
      sendResponse();
    }
  });
});
