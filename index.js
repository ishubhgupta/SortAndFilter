document.addEventListener('DOMContentLoaded', function () {
    const tableBody = document.querySelector('#problemTable tbody');
    const companyFilter = document.getElementById('company');
    const difficultyFilter = document.getElementById('difficulty');
    const sortRateButton = document.getElementById('sortRate');
    const sortAlphaButton = document.getElementById('sortAlpha');

    let problems = [];

    // CSV data
    Papa.parse('data.csv', {
        download: true,
        header: true,
        complete: function (results) {
            problems = results.data;
            displayProblems(problems);
        }
    });

    // print
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

    // filters
    function filterProblems() {
        let filteredProblems = problems;
        if (companyFilter.value !== 'All') {
            filteredProblems = filteredProblems.filter(problem => problem[companyFilter.value] === 'Yes');
        }
        if (difficultyFilter.value !== 'All') {
            filteredProblems = filteredProblems.filter(problem => problem['Difficulty Level'] === difficultyFilter.value);
        }
        displayProblems(filteredProblems);
    }

    companyFilter.addEventListener('change', filterProblems);
    difficultyFilter.addEventListener('change', filterProblems);

    // acceptance rate sorting
    sortRateButton.addEventListener('click', function () {
        const sortedProblems = [...problems].sort((a, b) => parseFloat(a['Acceptance Rate']) - parseFloat(b['Acceptance Rate']));
        displayProblems(sortedProblems);
    });

    // question sorting alphabeticaly
    sortAlphaButton.addEventListener('click', function () {
        const sortedProblems = [...problems].sort((a, b) => a['Question Name'].localeCompare(b['Question Name']));
        displayProblems(sortedProblems);
    });
});
