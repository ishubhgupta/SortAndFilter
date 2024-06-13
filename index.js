document.addEventListener('DOMContentLoaded', function () {
    const tableBody = document.querySelector('#problemTable tbody');
    const companyButtons = document.querySelectorAll('.company-filter');
    const difficultyDropdown = document.getElementById('difficultyDropdown');
    const sortRateButton = document.getElementById('sortRate');
    const sortAlphaButton = document.getElementById('sortAlpha');
    const sortNumberButton = document.getElementById('sortNumber');
    const selectedDifficultiesContainer = document.getElementById('selected-difficulties');

    let problems = [];
    let filteredProblems = [];
    let selectedCompany = 'All';
    let selectedDifficulties = new Set();
    let alphaSortOrder = 1;  // 1 for ascending, -1 for descending
    let rateSortOrder = 1;   // 1 for ascending, -1 for descending
    let numberSortOrder = 1; // 1 for ascending, -1 for descending

    // CSV data
    Papa.parse('data.csv', {
        download: true,
        header: true,
        complete: function (results) {
            problems = results.data;
            problems.sort((a, b) => parseInt(a['Question Number']) - parseInt(b['Question Number']));
            filteredProblems = [...problems];  // Initialize with all problems
            displayProblems(filteredProblems);
        }
    });

    // Function to display problems
    function displayProblems(data) {
        tableBody.innerHTML = '';
        data.forEach(problem => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${problem['Question Number']}</td>
                <td>${problem['Question Name']}</td>
                <td>${problem['Difficulty Level']}</td>
                <td>${problem['Acceptance Rate']}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Function to filter problems
    function filterProblems() {
        filteredProblems = problems;

        if (selectedCompany !== 'All') {
            filteredProblems = filteredProblems.filter(problem => problem[selectedCompany] === 'Yes');
        }

        if (selectedDifficulties.size > 0) {
            filteredProblems = filteredProblems.filter(problem => selectedDifficulties.has(problem['Difficulty Level']));
        }

        displayProblems(filteredProblems);
    }

    // Function to add difficulty tag
    function addDifficultyTag(difficulty) {
        const tag = document.createElement('div');
        tag.classList.add('difficulty-tag', difficulty.toLowerCase());
        tag.textContent = difficulty;

        const closeButton = document.createElement('span');
        closeButton.classList.add('close-btn');
        closeButton.textContent = '✖';
        closeButton.addEventListener('click', function () {
            selectedDifficulties.delete(difficulty);
            tag.remove();
            filterProblems();
        });

        tag.appendChild(closeButton);
        selectedDifficultiesContainer.appendChild(tag);
    }

    // Function to remove all difficulty tags
    function removeAllDifficultyTags() {
        selectedDifficultiesContainer.innerHTML = '';
    }

    companyButtons.forEach(button => {
        button.addEventListener('click', function () {
            companyButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            selectedCompany = this.dataset.company;
            filterProblems();
        });
    });

    difficultyDropdown.addEventListener('click', function (event) {
        const selectedValue = event.target.getAttribute('data-value');
        if (selectedValue) {
            selectedDifficulties.clear();
            removeAllDifficultyTags();
            if (selectedValue !== 'All') {
                selectedDifficulties.add(selectedValue);
                addDifficultyTag(selectedValue);
            }
            filterProblems();
        }
    });

    // Sort by acceptance rate
    sortRateButton.addEventListener('click', function () {
        rateSortOrder *= -1;
        filteredProblems.sort((a, b) => rateSortOrder * (parseFloat(a['Acceptance Rate']) - parseFloat(b['Acceptance Rate'])));
        displayProblems(filteredProblems);
    });

    // Sort alphabetically
    sortAlphaButton.addEventListener('click', function () {
        alphaSortOrder *= -1;
        filteredProblems.sort((a, b) => alphaSortOrder * a['Question Name'].localeCompare(b['Question Name']));
        displayProblems(filteredProblems);
    });

    // Sort by question number
    sortNumberButton.addEventListener('click', function () {
        numberSortOrder *= -1;
        filteredProblems.sort((a, b) => numberSortOrder * (parseInt(a['Question Number']) - parseInt(b['Question Number'])));
        displayProblems(filteredProblems);
    });
});


document.addEventListener('DOMContentLoaded', function () {
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');

    // Show the button when the user scrolls down 20px from the top
    window.addEventListener('scroll', function () {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            scrollToTopBtn.style.display = 'block';
        } else {
            scrollToTopBtn.style.display = 'none';
        }
    });

    // Scroll to the top when the user clicks the button
    scrollToTopBtn.addEventListener('click', function () {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});
