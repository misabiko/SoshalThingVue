import * as Fastify from 'fastify';
import {AddressInfo} from "net";

const fastify: Fastify.FastifyInstance = Fastify({logger: true});

fastify.get('/', async () => ({hello: 'world'}));

const start = async () => {
	try {
		await fastify.listen(3000);
		fastify.log.info(`Server listening on ${(<AddressInfo>fastify.server.address()).port}`);
	}catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};
start().then();

/*import {promises as fsPromises} from "fs";

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
*/