$(document).ready(function () {
  let responses = [];

  // Disable the send button and user input field initially
  $("#sendBtn").prop("disabled", true);
  $("#userInput").prop("disabled", true);

  let questionIndex = 0;
  let questions = [];

  // Handle job title submission
  $("#jobTitleSubmit").on("click", function () {
    const jobTitle = $("#jobTitle").val().trim();
    if (jobTitle) {
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
  });

  // Handle send button click
  $("#sendBtn").on("click", function () {
    const userResponse = $("#userInput").val().trim();
    if (userResponse) {
      const currentQuestion = questions[questionIndex - 1];
      const jobTitle = $("#jobTitle").val(); // Get the selected job title

      // Display user's response
      appendMessage(userResponse, "user");

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
  });

  function displayNextQuestion() {
    if (questionIndex < questions.length) {
      const question = questions[questionIndex];
      appendMessage(question, "bot");
      questionIndex++;
      $("#userInput").val("");
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
          appendMessage(`Rating: ${response}`, "bot");
          appendMessage("Thank you for completing the interview!", "bot");
        },
        error: function (error) {
          console.error("Error getting final decision:", error);
        },
      });

      $("#sendBtn").prop("disabled", true);
      $("#userInput").prop("disabled", true);
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
