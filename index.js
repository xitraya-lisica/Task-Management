// Required modules
const http = require('http');
const url = require('url');
const { parse } = require('querystring');

// In-memory store for tasks
let tasks = [
    { id: 1, task: 'Buy groceries', completed: false },
    { id: 2, task: 'Clean the house', completed: false },
];



// Function to handle incoming requests
const requestHandler = (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const method = req.method;

    // Set headers for the response
    res.setHeader('Content-Type', 'application/json');

    // Routing based on URL and method
    if (parsedUrl.pathname === '/tasks') {
        if (method === 'GET') {
            // Return all tasks
            res.writeHead(200);
            res.end(JSON.stringify(tasks));
        } else if (method === 'POST') {
            // Add a new task
            let body = '';
            req.on('data', chunk => {
                body += chunk;
            });

            req.on('end', () => {
                const { task } = JSON.parse(body);
                if (task) {
                    const newTask = {
                        id: tasks.length + 1,
                        task,
                        completed: false,
                    };
                    tasks.push(newTask);
                    res.writeHead(201);
                    res.end(JSON.stringify(newTask));
                } else {
                    res.writeHead(400);
                    res.end(JSON.stringify({ message: 'Task description is required' }));
                }
            });
        } else {
            res.writeHead(405);
            res.end(JSON.stringify({ message: 'Method Not Allowed' }));
        }
    } else if (parsedUrl.pathname.startsWith('/tasks/')) {
        const taskId = parseInt(parsedUrl.pathname.split('/')[2], 10);

        const task = tasks.find(t => t.id === taskId);

        if (!task) {
            res.writeHead(404);
            res.end(JSON.stringify({ message: 'Task not found' }));
        } else {
            if (method === 'GET') {
                // Return a specific task
                res.writeHead(200);
                res.end(JSON.stringify(task));
            } else if (method === 'PUT') {
                // Update a task
                let body = '';
                req.on('data', chunk => {
                    body += chunk;
                });

                req.on('end', () => {
                    const { task: updatedTask, completed } = JSON.parse(body);
                    if (updatedTask !== undefined) {
                        task.task = updatedTask;
                    }
                    if (completed !== undefined) {
                        task.completed = completed;
                    }
                    res.writeHead(200);
                    res.end(JSON.stringify(task));
                });
            } else if (method === 'DELETE') {
                // Delete a task
                tasks = tasks.filter(t => t.id !== taskId);
                res.writeHead(204);
                res.end();
            } else {
                res.writeHead(405);
                res.end(JSON.stringify({ message: 'Method Not Allowed' }));
            }
        }
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({ message: 'Not Found' }));
    }
};

// Create HTTP server
const server = http.createServer(requestHandler);

// Set the server to listen on port 3000
server.listen(3000, () => {
    console.log('Server running at http://localhost:3000/');
});
