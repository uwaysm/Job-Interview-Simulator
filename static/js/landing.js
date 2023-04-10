// List of job titles to iterate through
const jobTitles = ["Software Engineer", "Data Scientist", "UX Designer",
                    "Product Manager", "Data Analyst", "Data Engineer",
                    "Marketing Manager", "Office Assitant", "Lawyer",
                    "Accountant", "Sales Manager"]; // Add more job titles here

// Functions to run when the page loads
window.onload = () => {
    changeTitle();
};

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