Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const fs_1 = require("fs");
const reqTypes = {
    '/': ['text/html', '/index.html'],
    '/index.js': ['text/javascript', '/index.js'],
    '/manifest.json': ['application/json', '/manifest.json'],
    '/index.css': ['text/css', '/index.css']
};
http_1.createServer(async (request, response) => {
    console.log(request.url);
    if (!reqTypes.hasOwnProperty(request.url)) {
        response.writeHead(404);
        response.end();
        return;
    }
    response.writeHead(200, { 'Content-Type': reqTypes[request.url][0] });
    response.write((await fs_1.promises.readFile(__dirname + reqTypes[request.url][1])).toString());
    response.end();
}).listen(3000);
console.log('Server running at http://localhost:3000/');
