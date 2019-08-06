import {createServer} from "http";
import {promises as fsPromises} from "fs";

const reqTypes : {[url : string] : string[]} = {
	'/': ['text/html', '/index.html'],
	'/index.js': ['text/javascript', '/index.js'],
	'/manifest.json': ['application/json', '/manifest.json'],
	'/index.css': ['text/css', '/index.css']
};

createServer(async (request, response) => {
	console.log(request.url);

	if (!reqTypes.hasOwnProperty(request.url)) {
		response.writeHead(404);
		response.end();
		return;
	}

	const reqType = reqTypes[request.url];
	response.writeHead(200, {'Content-Type': reqType[0]});
	response.end((await fsPromises.readFile(__dirname + reqType[1])).toString());
}).listen(3000);

console.log('Server running at http://localhost:3000/');
