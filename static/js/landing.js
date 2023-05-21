// List of job titles to iterate through
const jobTitles = [
    "Software Engineer", "Data Scientist", "UX Designer",
    "Product Manager", "Data Analyst", "Data Engineer",
    "Marketing Manager", "Office Assitant", "Lawyer",
    "Accountant", "Sales Manager", "Graphic Designer", "Teacher"
]; // Add more job titles here

// List of testimonials for the testimonials carousel
const testimonials = [
    {
        name: "Lloyd",
        job: "Software Engineer @ Google",
        testimonial: "Thanks to GetHired.ai I was able to prepare for my interview properly and get the job I wanted.",
        rating: "&starf;&starf;&starf;&starf;&starf;"
    },
    {
        name: "Uways",
        job: "Software Developer @ Amazon",
        testimonial: "If it wasn't for GetHired.ai I don't think I would've been able to work for Amazon!",
        rating: "&starf;&starf;&starf;&starf;&star;"
    },
    {
        name: "Jason",
        job: "CEO @ Bitcoin",
        testimonial: "I was able to get a job at my dream company thanks to GetHired.ai!",
        rating: "&starf;&starf;&starf;&starf;&starf;"
    },
    {
        name: "Jericho",
        job: "Cyber Security Expert @ CyberX",
        testimonial: "I was well prepared and wasn't nervous at all during my interview thanks to GetHired.ai!",
        rating: "&starf;&starf;&starf;&starf;&starf;"
    }
];

// Carousel variables
let currCarouselIndx = 0; // Default 0
let carouselLength = testimonials.length;

// Function that displays the carousel items from the testimonials array
function displayCarouselItem() {
    $("#testimonial-name").html(testimonials[currCarouselIndx].name).hide();
    $("#testimonial-name").fadeIn(800);
    $("#testimonial-job").html(testimonials[currCarouselIndx].job).hide();
    $("#testimonial-job").fadeIn(800);
    $("#testimonial-text").html(testimonials[currCarouselIndx].testimonial).hide();
    $("#testimonial-text").fadeIn(800);
    $("#testimonial-rating").html(testimonials[currCarouselIndx].rating).hide();
    $("#testimonial-rating").fadeIn(800);
}

// Function to change the job title every 3 seconds
function changeTitle() {
    let indx = 0;
    const jobTitle = document.getElementById("job-title");
    jobTitle.innerHTML = jobTitles[0];

    function displayNextItem(){
        jobTitle.classList.remove("show");
        setTimeout(() => {
            jobTitle.innerHTML = jobTitles[++indx % jobTitles.length];
            jobTitle.classList.add("show");
        }, 1000);
    }

    setInterval(displayNextItem, 3000);
}

setTimeout(function() {
    let flashMessage = document.getElementById('flash-message');
    if (flashMessage) {
        flashMessage.style.opacity = "0";
        setTimeout(function() {
            flashMessage.style.display = "none";
        }, 1000);
    }
}, 3000);

// Functions to run when the page loads
window.onload = () => {
    // EventListeners for buttons:
    // Launch app button
    document
        .getElementsByClassName("launch-app-button")[0]
        .addEventListener("click", function () {
            window.location.href = "/app";
    });
    // Launch app button
    document
        .getElementsByClassName("launch-app-button")[1]
        .addEventListener("click", function () {
            window.location.href = "/app";
    });

    // Carousel variables
    let prevBtn = document.getElementById("prev");
    let nextBtn = document.getElementById("next");

    // EventListener for carousel next button
    nextBtn.addEventListener("click", () => {
        currCarouselIndx = (currCarouselIndx + 1) % carouselLength;
        displayCarouselItem();
    });

    // EventListener for carousel previous button
    prevBtn.addEventListener("click", () => {
        currCarouselIndx = (currCarouselIndx - 1 + carouselLength) % carouselLength;
        displayCarouselItem();
    });

    changeTitle(); // Change the job title every 3 seconds
    displayCarouselItem(); // Display the carousel items

    setInterval(() => {
        currCarouselIndx = (currCarouselIndx + 1) % carouselLength;
        displayCarouselItem();
    }, 4000);

    // Display the login modal when login button is clicked
    $(".login-button").click(function () {
        $("#login-modal").fadeIn(600);
        $("#overlay").fadeIn(600);
        $("#login-modal").show();
        $("#overlay").css("display", "block"); // activates overlay
        
        // Prevents scrolling when modal is open
        $("html").css("position", "fixed");
        $("html").css("overflow-y", "scroll");
    });

    // Display the sign up modal when sign up button is clicked
    $(".signup-button").click(function () {
        $("#signup-modal").fadeIn(600);
        $("#overlay").fadeIn(600);
        $("#signup-modal").show();
        $("#overlay").css("display", "block"); // activates overlay

        // Prevents scrolling when modal is open
        $("html").css("position", "fixed");
        $("html").css("overflow-y", "scroll");
    });

    // Display the login modal when login button is clicked
    $("#tutorial-button").click(function () {
        $("#video-modal").fadeIn(600);
        $("#overlay").fadeIn(600);
        $("#video-modal").show();
        $("#overlay").css("display", "block"); // activates overlay
        
        // Prevents scrolling when modal is open
        $("html").css("position", "fixed");
        $("html").css("overflow-y", "scroll");
    });

    // Hide the modals when the close button is clicked
    $(".close-btn").click(function () {
        $(".popup").hide();
        $("#overlay").css("display", "none"); // activates overlay

        // Allows scrolling when modal is closed
        $("html").css("position", "static");
        $("html").css("overflow-y", "auto");
    });

    // When overlay is clicked, hide the modals
    $("#overlay").click(function () {
        $(".popup").hide();
        $("#overlay").css("display", "none"); // activates overlay

        // Allows scrolling when modal is closed
        $("html").css("position", "static");
        $("html").css("overflow-y", "auto");
    });

    // clone the logos in the carousel and append them to the container
    $(".infinite-carousel-item").clone().appendTo(".infinite-carousel-items");

    // Move the logos to the left every 1.5 seconds
    setInterval(function () {
        // Move the first logo to the end of the carousel
        $(".infinite-carousel-item").first().appendTo(".infinite-carousel-items");
        // Reset the position of the logos
        $(".infinite-carousel-items").css("left", 0);
    }, 1500);

    // Show the chat bubbles when the user scrolls to them
    $(window).scroll(function() {
        var scrollPos = $(window).scrollTop();
        
        // Calculate the position where the divs should appear/disappear
        let bubble1 = $('#chat-bubble-1').offset().top - $(window).height() + 1300;
        let bubble2 = $('#chat-bubble-2').offset().top - $(window).height() + 1300;

        // Show or hide the divs based on the scroll position
        if (scrollPos >= bubble1) {
            $('#chat-bubble-1').fadeIn();
        } 

        if (scrollPos >= bubble2) {
            $('#chat-bubble-2').fadeIn();
        }
    });
};
