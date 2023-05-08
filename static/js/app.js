window.onload = () => {
    document
        .getElementsByClassName("chat-history-button")[0]
        .addEventListener("click", function () {
            window.location.href = "/chat_logs";
    });
}