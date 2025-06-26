document.addEventListener('DOMContentLoaded', function () {
    // Theme management
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    
    // Initialize theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    function updateThemeIcon(theme) {
        if (theme === 'dark') {
            themeIcon.className = 'fas fa-sun';
        } else {
            themeIcon.className = 'fas fa-moon';
        }
    }
    
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    // Main application variables
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
    
    // Table pagination elements
    const prevTablePageButton = document.getElementById('prevTablePage');
    const nextTablePageButton = document.getElementById('nextTablePage');
    const prevTablePageBottomButton = document.getElementById('prevTablePageBottom');
    const nextTablePageBottomButton = document.getElementById('nextTablePageBottom');
    const tablePageInfo = document.getElementById('tablePageInfo');
    const tablePageInfoBottom = document.getElementById('tablePageInfoBottom');
    const resultsInfo = document.getElementById('resultsInfo');

    const pageSize = 10; // Number of companies per page
    const tablePageSize = 15; // Number of problems per page
    let currentPage = 1;
    let currentTablePage = 1;
    let companyButtons = [];
    let filteredCompanies = [];
    let problems = [];
    let filteredProblems = [];
    let displayedProblems = [];
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

    // Function to display problems in the table with pagination
    function displayProblems(data) {
        const startIndex = (currentTablePage - 1) * tablePageSize;
        const endIndex = startIndex + tablePageSize;
        const paginatedData = data.slice(startIndex, endIndex);
        
        tableBody.innerHTML = '';
        paginatedData.forEach(problem => {
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
        
        displayedProblems = paginatedData;
        updateTablePagination(data.length);
        updateResultsInfo(data.length);
        
        console.log('Problems displayed:', paginatedData);
    }

    // Function to update table pagination controls
    function updateTablePagination(totalProblems) {
        const totalPages = Math.ceil(totalProblems / tablePageSize);
        
        // Update page info for both top and bottom controls
        const pageText = `Page ${currentTablePage} of ${totalPages}`;
        tablePageInfo.textContent = pageText;
        tablePageInfoBottom.textContent = pageText;
        
        // Update button states
        const isFirstPage = currentTablePage === 1;
        const isLastPage = currentTablePage === totalPages || totalPages === 0;
        
        prevTablePageButton.disabled = isFirstPage;
        nextTablePageButton.disabled = isLastPage;
        prevTablePageBottomButton.disabled = isFirstPage;
        nextTablePageBottomButton.disabled = isLastPage;
    }

    // Function to update results info
    function updateResultsInfo(totalProblems) {
        const startIndex = (currentTablePage - 1) * tablePageSize + 1;
        const endIndex = Math.min(currentTablePage * tablePageSize, totalProblems);
        
        if (totalProblems === 0) {
            resultsInfo.textContent = 'No problems found';
        } else {
            resultsInfo.textContent = `Showing ${startIndex}-${endIndex} of ${totalProblems} problems`;
        }
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

        // Reset table pagination when filters change
        currentTablePage = 1;
        
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

    // Handle table pagination buttons
    prevTablePageButton.addEventListener('click', function () {
        if (currentTablePage > 1) {
            currentTablePage--;
            displayProblems(filteredProblems);
        }
    });

    nextTablePageButton.addEventListener('click', function () {
        const totalPages = Math.ceil(filteredProblems.length / tablePageSize);
        if (currentTablePage < totalPages) {
            currentTablePage++;
            displayProblems(filteredProblems);
        }
    });

    prevTablePageBottomButton.addEventListener('click', function () {
        if (currentTablePage > 1) {
            currentTablePage--;
            displayProblems(filteredProblems);
        }
    });

    nextTablePageBottomButton.addEventListener('click', function () {
        const totalPages = Math.ceil(filteredProblems.length / tablePageSize);
        if (currentTablePage < totalPages) {
            currentTablePage++;
            displayProblems(filteredProblems);
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
        currentTablePage = 1; // Reset to first page when sorting
        displayProblems(filteredProblems);
    });

    // Sort problems by Title
    sortAlphaButton.addEventListener('click', function () {
        filteredProblems.sort((a, b) => alphaSortOrder * a['Title'].localeCompare(b['Title']));
        alphaSortOrder *= -1;
        currentTablePage = 1; // Reset to first page when sorting
        displayProblems(filteredProblems);
    });

    // Scroll to top button functionality
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollToTopBtn.classList.add('show');
        } else {
            scrollToTopBtn.classList.remove('show');
        }
    });

    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});
