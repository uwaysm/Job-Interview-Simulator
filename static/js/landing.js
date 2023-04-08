// List of job titles to iterate through
const jobTitles = ["Software Engineer", "Data Scientist", "UX Designer",
                    "Product Manager", "Data Analyst", "Data Engineer",
                    "Marketing Manager", "Office Assitant", "Lawyer",
                    "Accountant", "Sales Manager"]; // Add more job titles here

window.onload = () => {
    changeTitle();
};

// Function to change the job title on the landing page every 3 seconds
function changeTitle() {
    // TODO: Change the for loop into a infinite loop that will iterate through the array continuously
    let jobTitle = document.getElementById("job-title");
    for(let i = 0; i < jobTitles.length; i++) {
        setTimeout(function() {
            jobTitle.innerHTML = jobTitles[i++ % jobTitles.length];
        }, 3000 * i);
    }
}