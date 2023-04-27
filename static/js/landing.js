// List of job titles to iterate through
const jobTitles = [
    "Software Engineer", "Data Scientist", "UX Designer",
    "Product Manager", "Data Analyst", "Data Engineer",
    "Marketing Manager", "Office Assitant", "Lawyer",
    "Accountant", "Sales Manager"
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
        job: "CEO @ SomeRandomStartUp",
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

// Functions to run when the page loads
window.onload = () => {
    // EventListeners for buttons:
    // Login button
    document
        .getElementById("login-button")
        .addEventListener("click", function () {
            window.location.href = "/login";
    });
    // Sign up button
    document
        .getElementById("signup-button")
        .addEventListener("click", function () {
            window.location.href = "/register";
    });
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
    // Tutorial button
    document
        .getElementById("tutorial-button")
        .addEventListener("click", function () {
            window.alert("Tutorial not yet implemented")
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

    changeTitle();
    displayCarouselItem();

    setInterval(() => {
        currCarouselIndx = (currCarouselIndx + 1) % carouselLength;
        displayCarouselItem();
    }, 4000);
};
