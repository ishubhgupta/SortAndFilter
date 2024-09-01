document.addEventListener('DOMContentLoaded', function () {
    const tableBody = document.querySelector('#problemTable tbody');
    const companyList = document.getElementById('companyList');
    const difficultyDropdown = document.getElementById('difficultyDropdown');
    const sortNumberButton = document.getElementById('sortNumber');
    const sortAlphaButton = document.getElementById('sortAlpha');
    const selectedDifficultiesContainer = document.getElementById('selected-difficulties');
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    const searchBar = document.getElementById('searchBar');
    const prevPageButton = document.getElementById('prevPage');
    const nextPageButton = document.getElementById('nextPage');
    const pageInfo = document.getElementById('pageInfo');

    const pageSize = 10; // Number of companies per page
    let currentPage = 1;
    let companyButtons = [];
    let filteredCompanies = [];
    let problems = [];
    let filteredProblems = [];
    let selectedCompany = 'All';
    let selectedDifficulties = new Set();
    let alphaSortOrder = 1;  // 1 for ascending, -1 for descending
    let numberSortOrder = 1; // 1 for ascending, -1 for descending

    console.log('Script loaded');

    // Load and parse the CSV file
    Papa.parse('data.csv', {
        download: true,
        header: true,
        complete: function (results) {
            console.log('CSV data loaded:', results.data);
            problems = results.data;

            if (problems.length > 0) {
                // Sort problems by ID in ascending order by default
                problems.sort((a, b) => parseInt(a['ID'], 10) - parseInt(b['ID'], 10));
                filteredProblems = [...problems];

                // Get unique companies
                const companies = new Set();
                problems.forEach(problem => {
                    Object.keys(problem).forEach(key => {
                        if (key !== 'Title' && key !== 'ID' && key !== 'Difficulty Level') {
                            companies.add(key);
                        }
                    });
                });

                console.log('Companies:', companies);

                // Populate company list dynamically
                companyButtons = Array.from(companies);
                filteredCompanies = companyButtons;

                // Add 'All' button
                const allButton = document.createElement('button');
                allButton.classList.add('company-filter');
                allButton.textContent = 'All';
                allButton.dataset.company = 'All';
                allButton.addEventListener('click', function () {
                    selectedCompany = 'All';
                    console.log('Selected company:', selectedCompany);
                    filterProblems();
                });
                companyList.prepend(allButton);

                companyButtons.forEach(company => {
                    const button = document.createElement('button');
                    button.classList.add('company-filter');
                    button.textContent = company;
                    button.dataset.company = company;
                    button.addEventListener('click', function () {
                        selectedCompany = this.dataset.company;
                        console.log('Selected company:', selectedCompany);
                        filterProblems();
                    });
                    companyList.appendChild(button);
                });

                updateCompanyList();
                displayProblems(filteredProblems);
            } else {
                console.error('No data found in CSV.');
            }
        },
        error: function (error) {
            console.error('Error loading CSV:', error);
        }
    });

    // Function to display problems in the table
    function displayProblems(data) {
        tableBody.innerHTML = '';
        data.forEach(problem => {
            const row = document.createElement('tr');
            const leetCodeURL = `https://leetcode.com/problems/${problem['Title'].toLowerCase().replace(/ /g, '-')}/description/`;

            // Determine difficulty class for styling
            let difficultyClass = '';
            switch (problem['Difficulty Level'].toLowerCase()) {
                case 'easy':
                    difficultyClass = 'easy';
                    break;
                case 'medium':
                    difficultyClass = 'medium';
                    break;
                case 'hard':
                    difficultyClass = 'hard';
                    break;
                default:
                    break;
            }

            row.innerHTML = `
                <td>${problem['ID']}</td>
                <td><a href="${leetCodeURL}" target="_blank">${problem['Title']}</a></td>
                <td class="difficulty ${difficultyClass}">${problem['Difficulty Level']}</td>
            `;
            tableBody.appendChild(row);
        });
        console.log('Problems displayed:', data);
    }

    // Function to filter problems based on company and difficulty
    function filterProblems() {
        filteredProblems = problems;

        if (selectedCompany !== 'All') {
            filteredProblems = filteredProblems.filter(problem => problem[selectedCompany] === 'Yes');
        }

        if (selectedDifficulties.size > 0) {
            filteredProblems = filteredProblems.filter(problem => {
                // Show problems only if they match the selected difficulty
                return selectedDifficulties.has(problem['Difficulty Level']);
            });
        }

        console.log('Filtered problems:', filteredProblems);
        displayProblems(filteredProblems);
        updateCompanyList();
    }

    // Function to update company list with pagination
    function updateCompanyList() {
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        const companiesToDisplay = filteredCompanies.slice(start, end);

        companyList.innerHTML = '';
        companiesToDisplay.forEach(company => {
            const button = document.createElement('button');
            button.classList.add('company-filter');
            button.textContent = company;
            button.dataset.company = company;
            button.addEventListener('click', function () {
                selectedCompany = this.dataset.company;
                console.log('Selected company:', selectedCompany);
                filterProblems();
            });
            companyList.appendChild(button);
        });

        // Add 'All' button at the top
        const allButton = document.createElement('button');
        allButton.classList.add('company-filter');
        allButton.textContent = 'All';
        allButton.dataset.company = 'All';
        allButton.addEventListener('click', function () {
            selectedCompany = 'All';
            console.log('Selected company:', selectedCompany);
            filterProblems();
        });
        companyList.prepend(allButton);

        // Update pagination controls
        pageInfo.textContent = `Page ${currentPage}`;
        prevPageButton.disabled = currentPage === 1;
        nextPageButton.disabled = end >= filteredCompanies.length;
    }

    // Handle search input
    searchBar.addEventListener('input', function () {
        const searchTerm = this.value.toLowerCase();
        filteredCompanies = companyButtons.filter(company => company.toLowerCase().includes(searchTerm));
        currentPage = 1; // Reset to first page
        updateCompanyList();
    });

    // Handle pagination buttons
    prevPageButton.addEventListener('click', function () {
        if (currentPage > 1) {
            currentPage--;
            updateCompanyList();
        }
    });

    nextPageButton.addEventListener('click', function () {
        if ((currentPage * pageSize) < filteredCompanies.length) {
            currentPage++;
            updateCompanyList();
        }
    });

    // Event listeners for difficulty filter
    difficultyDropdown.addEventListener('click', function (event) {
        const difficulty = event.target.dataset.value;
        if (difficulty) {
            // Clear previous selections and add new selection
            selectedDifficulties.clear();
            if (difficulty !== 'All') {
                selectedDifficulties.add(difficulty);
            }
            updateDifficultyFilters();
            filterProblems();
        }
    });

    // Function to add difficulty tag in the UI
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

    // Function to update difficulty filters in the UI
    function updateDifficultyFilters() {
        removeAllDifficultyTags();
        if (selectedDifficulties.size > 0) {
            selectedDifficulties.forEach(difficulty => {
                addDifficultyTag(difficulty);
            });
        }
    }

    // Sort problems by ID
    sortNumberButton.addEventListener('click', function () {
        filteredProblems.sort((a, b) => numberSortOrder * (parseInt(a['ID'], 10) - parseInt(b['ID'], 10)));
        numberSortOrder *= -1;
        displayProblems(filteredProblems);
    });

    // Sort problems by Title
    sortAlphaButton.addEventListener('click', function () {
        filteredProblems.sort((a, b) => alphaSortOrder * a['Title'].localeCompare(b['Title']));
        alphaSortOrder *= -1;
        displayProblems(filteredProblems);
    });

    // Scroll to top button functionality
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollToTopBtn.style.display = 'block';
        } else {
            scrollToTopBtn.style.display = 'none';
        }
    });

    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});
