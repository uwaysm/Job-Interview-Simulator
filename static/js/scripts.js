// ------------------------------
// Variable declarations
// ------------------------------
let questionIndex = 0;
let questions = [];
let responses = [];

// ------------------------------
// Functions
// ------------------------------

function openNav() {
  var sidebar = document.getElementsByClassName("sidebar")[0]; // Select the first element in the collection
  sidebar.style.display = "block";
  sidebar.style.zIndex = "1";
}

function closeNav() {
  var sidebar = document.getElementsByClassName("sidebar")[0]; // Select the first element in the collection
  sidebar.style.display = "none";
}

// Function that shows side bar again when window is resized
$(window).resize(function () {
  if ($(window).width() > 576) {
    $(".sidebar").show();
  }
});

// Accepts a boolean "enable" as an argument and enables or disables the "jobTitle" input field and "jobTitleSubmit" button accordingly.
function toggleJobTitleInput(enable) {
  $("#jobTitle").prop("disabled", !enable);
  $("#jobTitleSubmit").prop("disabled", !enable);
}

/**
 * Validates the entered job title by making an AJAX request to the "/is_real_job_title" endpoint.
 * If the job title is valid, it disables the job title input and submits the job title to the "/generate_questions" endpoint.
 * The received list of questions is stored in the "questions" array, and the first question is displayed.
 * If there are any errors during the process, they are logged in the console.
 */

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

// Simulate loading effect by looping dots in the message box

function textloader(element) {
  element.textContent = "";

  loadInterval = setInterval(() => {
    element.textContent += ".";
    if (element.textContent === "....") {
      element.textContent = "";
    }
  }, 300);
}

// Simulate Typing Text

// function typeText(element, text) {
//   let index = 0;

//   let interval = setInterval(() => {
//     if (index < text.length) {
//       element.innerHTML += text.charAt(index);
//       index++;
//     } else {
//       clearInterval(interval);
//     }
//   }, 20);
// }

function typeText(element, text) {
  let index = 0;

  return new Promise(resolve => {
    let interval = setInterval(() => {
      if (index < text.length) {
        element.innerHTML += text.charAt(index);
        index++;
      } else {
        clearInterval(interval);
        resolve();
      }
    }, 20);
  });
}

/**
 * Takes the user's input from the "userInput" field, appends it to the chat box, and sends it for evaluation.
 * The user's response is stored along with the question and feedback in the "responses" array.
 * If there's an error during evaluation, it is logged in the console.
 */

function sendResponse() {
  const userResponse = $("#userInput").val().trim();
  if (userResponse) {
    $("#sendBtn").prop("disabled", true);
    $("#userInput").prop("disabled", true);

    const currentQuestion = questions[questionIndex - 1];
    const jobTitle = $("#jobTitle").val();

    appendMessage(userResponse, "user");

    $("#userInput").val("");

    // Create a temporary "bot" message with loading effect
    const tempBotResponse = $("<li>").addClass("bot");
    $("#chatBox").append(tempBotResponse);
    textloader(tempBotResponse[0]);

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
          feedback: response,
        });
        // Clear the temporary "bot" message
        tempBotResponse.remove();
        displayFeedback(response);
      },
      error: function (error) {
        console.error("Error evaluating response:", error);
      },
    });
  }
}

/**
 * Displays the next question in the interview process or finalizes the interview.
 * If there are more questions, the next question is appended to the chat box.
 * If there are no more questions, a final decision is sent and displayed.
 * Confetti animation is triggered upon completion of the interview.
 *
 * If another interview is desired, the user can enter a job title.
 */

function displayNextQuestion() {
  // Remove the 'locked' class from the elements
  $("#sendBtn").removeClass("locked");
  $("#userInput").removeClass("locked");

  $("#sendBtn").prop("disabled", false);
  $("#userInput").prop("disabled", false);
  $("#userInput").focus();

  if (questionIndex < questions.length) {
    const question = questions[questionIndex];
    appendMessage(question, "question", true)
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
        appendMessage("Thank you for completing the interview!", "final");

        var duration = 5 * 1000;
        var animationEnd = Date.now() + duration;
        var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        function randomInRange(min, max) {
          return Math.random() * (max - min) + min;
        }

        var interval = setInterval(function () {
          var timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          var particleCount = 50 * (timeLeft / duration);
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
          // since particles fall down, start a bit higher than random
          confetti(
            Object.assign({}, defaults, {
              particleCount,
              origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
            })
          );
          confetti(
            Object.assign({}, defaults, {
              particleCount,
              origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
            })
          );
        }, 250);
        appendMessage(
          "Enter a job title if you would like another interview.",
          "final"
        );
      },
      error: function (error) {
        console.error("Error getting final decision:", error);
      },
    });

    $("#sendBtn").prop("disabled", true);
    $("#userInput").prop("disabled", true);

    toggleJobTitleInput(true);
  }
}

/**
 * Displays feedback in the chat box with typing animation.
 * Clears the load interval and appends a line break element.
 * Proceeds to display the next question.
 *
 * @param {string} feedback - The feedback message to be displayed.
 */

// function displayFeedback(feedback) {
//   appendMessage(feedback, "bot", true); // Use typing animation for feedback
//   clearInterval(loadInterval);
//   const breakElement = $("<li>").addClass("break");
//   $("#chatBox").append(breakElement);

//   displayNextQuestion();
// }

function displayFeedback(feedback) {
  appendMessage(feedback, "bot", true) // Use typing animation for feedback
    .then(() => {
      clearInterval(loadInterval);
      const breakElement = $("<li>").addClass("break");
      $("#chatBox").append(breakElement);
      displayNextQuestion();
    });
}
/**
 * Appends a message to the chat box.
 *
 * @param {string} message - The message to be appended.
 * @param {string} sender - The sender of the message (e.g., "bot", "user").
 * @param {boolean} [typed=false] - Specifies if the message should be simulated as typed.
 */

// function appendMessage(message, sender, typed = false) {
//   const liElement = $("<li>").addClass(sender);
//   $("#chatBox").append(liElement);

//   if (sender === "bot") {
//     if (typed) {
//       typeText(liElement[0], message); // Simulate typing
//     } else {
//       liElement.text(message);
//     }
//   } else {
//     liElement.text(message);
//   }

//   $(".chat-container").scrollTop($(".chat-container")[0].scrollHeight); // Scroll to bottom
// }

function appendMessage(message, sender, typed = false) {
  const liElement = $("<li>").addClass(sender);
  $("#chatBox").append(liElement);

  if (sender === "bot") {
    if (typed) {
      return typeText(liElement[0], message); // Return the promise
    } else {
      liElement.text(message);
    }
  } else {
    liElement.text(message);
  }

  $(".chat-container").scrollTop($(".chat-container")[0].scrollHeight); // Scroll to bottom
}

// ------------------------------
// Event Listeners
// ------------------------------

$(document).ready(function () {
  $("#userInput").addClass("locked");
  $("#sendBtn").addClass("locked");
  $("#userInput").addClass("locked");
  $("#userInput").prop("disabled", true);

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
