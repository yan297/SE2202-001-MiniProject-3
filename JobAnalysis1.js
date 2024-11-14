// Load jobs data using file input
let jobs = [];

document.getElementById('fileInput').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                jobs = Job.createJobsFromData(data);
                document.getElementById('filterForm').style.display = 'block';
                document.getElementById('sortForm').style.display = 'block';
                generateFilterOptions();
                initializePage();
            } catch (error) {
                console.error('Error reading JSON file:', error.message);
            }
        };
        reader.readAsText(file);
    }
});

// Task 1: Convert and Normalize Time Units
const convertTimeToMinutes = (posted) => {
    if (!posted || typeof posted !== 'string') {
        console.error('Invalid time format:', posted);
        return 0;
    }
    const [value, unit] = posted.split(' ');
    if (!value || !unit) {
        console.error('Invalid time format:', posted);
        return 0;
    }
    if (unit.includes('minute')) return parseInt(value, 10);
    if (unit.includes('hour')) return parseInt(value, 10) * 60;
    if (unit.includes('day')) return parseInt(value, 10) * 60 * 24;
    console.error('Unsupported time unit:', unit);
    return 0;
};

// Task 2: Define a Job Class and Use Constructor for Object Creation
class Job {
    constructor(title, posted, type, level, skill, description) {
        this.title = title || 'Unknown Title';
        this.postedMinutes = convertTimeToMinutes(posted);
        this.type = type || 'Unknown Type';
        this.level = level || 'Unknown Level';
        this.skill = skill || 'Unknown Skill';
        this.description = description || 'No Description';
    }

    static createJobsFromData(data) {
        return data.map(job => new Job(job.Title, job.Posted, job.Type, job.Level, job.Skill, job.Detail));
    }

    getDetails() {
        return `${this.title} - ${this.type} (${this.level})`;
    }

    getDetailedDescription() {
        return `Title: ${this.title}\nType: ${this.type}\nLevel: ${this.level}\nSkill: ${this.skill}\nDescription: ${this.description}\nPosted: ${this.getFormattedPostedTime()}`;
    }

    getFormattedPostedTime() {
        if (this.postedMinutes < 60) {
            return `${this.postedMinutes} minutes ago`;
        } else if (this.postedMinutes < 1440) {
            return `${Math.floor(this.postedMinutes / 60)} hours ago`;
        } else {
            return `${Math.floor(this.postedMinutes / 1440)} days ago`;
        }
    }
}

// Task 3-6: Implement User Interaction and Filtering
const jobList = document.getElementById('jobList');
const wordFrequencyList = document.getElementById('wordFrequencyList');

const filterJobsInUI = (level, type, skill) => {
    return jobs.filter(job => {
        return (
            (level ? job.level.toLowerCase() === level.toLowerCase() : true) &&
            (type ? job.type.toLowerCase() === type.toLowerCase() : true) &&
            (skill ? job.skill.toLowerCase() === skill.toLowerCase() : true)
        );
    });
};

const displayJobs = (jobs) => {
    jobList.innerHTML = '';
    if (jobs.length === 0) {
        jobList.innerHTML = '<p>No jobs available.</p>';
        return;
    }
    jobs.forEach(job => {
        const jobItem = document.createElement('div');
        jobItem.className = 'job-item';
        jobItem.textContent = job.getDetails();
        jobItem.addEventListener('click', () => {
            alert(job.getDetailedDescription());
        });
        jobList.appendChild(jobItem);
    });
};

const generateFilterOptions = () => {
    const levels = new Set();
    const types = new Set();
    const skills = new Set();

    jobs.forEach(job => {
        if (job.level) levels.add(job.level);
        if (job.type) types.add(job.type);
        if (job.skill) skills.add(job.skill);
    });

    populateSelectOptions(document.getElementById('levelFilter'), levels);
    populateSelectOptions(document.getElementById('typeFilter'), types);
    populateSelectOptions(document.getElementById('skillFilter'), skills);
};

const populateSelectOptions = (selectElement, optionsSet) => {
    selectElement.innerHTML = '<option value="">All</option>'; // Reset options
    optionsSet.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        selectElement.appendChild(optionElement);
    });
};

document.getElementById('filterForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const level = document.getElementById('levelFilter').value;
    const type = document.getElementById('typeFilter').value;
    const skill = document.getElementById('skillFilter').value;
    const filteredJobs = filterJobsInUI(level, type, skill);
    displayJobs(filteredJobs);
});

document.getElementById('sortButton').addEventListener('click', () => {
    const sortCriteria = document.getElementById('sortCriteria').value;
    const level = document.getElementById('levelFilter').value;
    const type = document.getElementById('typeFilter').value;
    const skill = document.getElementById('skillFilter').value;
    let filteredJobs = filterJobsInUI(level, type, skill);
    let sortedJobs = [...filteredJobs];

    switch (sortCriteria) {
        case 'titleAsc':
            sortedJobs.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'titleDesc':
            sortedJobs.sort((a, b) => b.title.localeCompare(a.title));
            break;
        case 'postedAsc':
            sortedJobs.sort((a, b) => b.postedMinutes - a.postedMinutes);
            break;
        case 'postedDesc':
            sortedJobs.sort((a, b) => a.postedMinutes - b.postedMinutes);
            break;
    }
    displayJobs(sortedJobs);
});

function initializePage() {
    displayJobs(jobs);
}

