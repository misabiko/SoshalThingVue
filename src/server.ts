import * as Fastify from 'fastify';
import * as fastifyStatic from "fastify-static";

const fastify : Fastify.FastifyInstance = Fastify({logger: {prettyPrint: true}});

fastify.register(fastifyStatic, {
	root: __dirname,
	serve: false
});

function staticGet(filename : string, path? : string) {
	fastify.get(path || "/" + filename, (request, reply) => {reply.sendFile(filename)});
}

staticGet("index.html", "/");
staticGet("index.js", "/index.js");
staticGet("index.css", "/index.css");

fastify.listen(3000)
	.catch(err => {
		fastify.log.error(err);
		process.exit(1);
	});