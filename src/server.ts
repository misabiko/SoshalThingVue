import * as Fastify from 'fastify';
import * as fastifyStatic from "fastify-static";

const fastify : Fastify.FastifyInstance = Fastify({logger: {prettyPrint: true}});

fastify.register(fastifyStatic, {
	root: __dirname,
	serve: false
});

fastify.get("/", (request, reply) => {reply.sendFile("index.html")});
fastify.get("/index.js", (request, reply) => {reply.sendFile("index.js")});
fastify.get("/index.css", (request, reply) => {reply.sendFile("index.css")});

fastify.listen(3000)
	.catch(err => {
		fastify.log.error(err);
		process.exit(1);
	});