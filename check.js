const fs = require('fs');
const path = require('path');
const http = require('http');

// Define the path to the question-set folder
const folderPath = path.join(__dirname, 'question-set');

// Initialize an object to store company questions
let companyQuestions = {};

// Function to parse CSV data
function parseCSVData(data) {
    const lines = data.split('\n');
    const headers = lines[0].split(',');

    lines.slice(1).forEach(line => {
        if (line.trim() === '') return; // Skip empty lines
        const values = line.split(',');

        const question = {
            number: values[0],
            name: values[1],
            difficulty: values[2],
            acceptanceRate: values[3],
        };

        // Loop through the companies and check if the question is asked by them
        headers.slice(4).forEach((company, index) => {
            if (values[index + 4].trim() === 'Yes') {
                if (!companyQuestions[company]) {
                    companyQuestions[company] = [];
                }
                companyQuestions[company].push(question);
            }
        });
    });
}

// Function to read and parse all CSV files in the folder
function parseAllCSVFiles(callback) {
    fs.readdir(folderPath, (err, files) => {
        if (err) {
            console.error('Unable to scan directory:', err);
            return;
        }

        let pendingFiles = files.length;

        files.forEach(file => {
            if (file.includes('alltime') && path.extname(file) === '.csv') {
                const filePath = path.join(folderPath, file);
                fs.readFile(filePath, 'utf8', (err, data) => {
                    if (err) {
                        console.error('Error reading file:', err);
                        return;
                    }
                    parseCSVData(data);
                    pendingFiles--;

                    if (pendingFiles === 0) {
                        callback();
                    }
                });
            } else {
                pendingFiles--;
            }
        });

        if (pendingFiles === 0) {
            callback();
        }
    });
}

// Function to generate HTML from the parsed data
function generateHTML() {
    let htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Company Questions</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { color: #333; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
                th { background-color: #f4f4f4; }
            </style>
        </head>
        <body>
            <h1>Company Questions</h1>`;

    for (const company in companyQuestions) {
        htmlContent += `<h2>${company}</h2><table><tr><th>Question Number</th><th>Question Name</th><th>Difficulty Level</th><th>Acceptance Rate</th></tr>`;

        companyQuestions[company].forEach(question => {
            htmlContent += `
                <tr>
                    <td>${question.number}</td>
                    <td>${question.name}</td>
                    <td>${question.difficulty}</td>
                    <td>${question.acceptanceRate}</td>
                </tr>`;
        });

        htmlContent += `</table>`;
    }

    htmlContent += `
        </body>
        </html>`;

    return htmlContent;
}

// Function to start a simple HTTP server and serve the generated HTML
function startServer() {
    const server = http.createServer((req, res) => {
        if (req.url === '/') {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            const htmlContent = generateHTML();
            res.end(htmlContent);
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
        }
    });

    const port = 3000;
    server.listen(port, () => {
        console.log(`Server running at http://localhost:${port}/`);
    });
}

// Execute the functions
parseAllCSVFiles(() => {
    startServer();
});
