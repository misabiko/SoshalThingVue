import * as Fastify from 'fastify';
import * as fastifyStatic from "fastify-static";
import * as Twit from 'twit';
import * as fs from 'fs';

const credentialsPath = __dirname + '/../credentials.json';
const twitter : {
	[endpoint : string] : {
		resetTime : Date,
		remaining : number
	}
} = {};

if (!fs.existsSync(credentialsPath)) {
	console.error("You need to add credentials.json for Twit options.");
	process.exit(1);
}

const T = new Twit(JSON.parse(fs.readFileSync(credentialsPath, 'utf8')));

const fastify : Fastify.FastifyInstance = Fastify({logger: {prettyPrint: true}});

fastify.register(fastifyStatic, {
	root: __dirname,
	serve: false
});

function staticGet(filename : string, path? : string) {
	fastify.get(path || "/" + filename, (request, reply) => {
		reply.sendFile(filename)
	});
}

staticGet("index.html", "/");
staticGet("index.js", "/index.js");
staticGet("index.css", "/index.css");

fastify.get("/twitter/tweets/*", (request, reply) => {
	if (request.query)
		fastify.log.info("Params: ", request.query);

	const endpoint : string = request.params["*"];

	fastify.log.info(endpoint);
	if (twitter.hasOwnProperty(endpoint) && !twitter[endpoint].remaining && (twitter[endpoint].resetTime.getTime() - Date.now()) >= 0)
		fastify.log.error("Rate limit reached. Reset in " + (Math.round((twitter[endpoint].resetTime.getTime() - Date.now()) / 600) / 100) + " minutes.");
	else
		T.get(endpoint, request.query)
			.then(twitResp => {
				fastify.log.info("Remaining calls: " + twitResp.resp.headers["x-rate-limit-remaining"]);

				twitter[endpoint] = {
					...twitter[endpoint],
					resetTime: new Date(1000 * parseInt(twitResp.resp.headers["x-rate-limit-reset"] as string)),
					remaining: parseInt(twitResp.resp.headers["x-rate-limit-remaining"] as string)
				};
				fastify.log.info((Math.round((twitter[endpoint].resetTime.getTime() - Date.now()) / 600) / 100) + " minutes until reset.");

				reply
					.code(200)
					.headers({
						"Content-Type": "application/json",
						"Access-Control-Allow-Origin": "*"
					})
					.send(twitResp.data);
			})
			.catch(error => fastify.log.error("Error on Twitter request.", error));
});

fastify.post("/twitter/like/:id", (request, reply) => {
	T.post("favorites/create", {id: request.params.id}).then(twitResp => {
		reply
			.code(200)
			.headers({
				"Content-Type": "application/json",
				"Access-Control-Allow-Origin": "*"
			})
			.send(twitResp.data);
	})
		.catch(error => fastify.log.error("Error on Twitter like.", error));
});

fastify.post("/twitter/retweet/:id", (request, reply) => {
	T.post("statuses/retweet", {id: request.params.id}).then(twitResp => {
		reply.code(200)
			.headers({
				"Content-Type": "application/json",
				"Access-Control-Allow-Origin": "*"
			});
		reply.send(twitResp.data);
	})
		.catch(error => fastify.log.error("Error on Twitter retweet.", error));
});

fastify.listen(3000)
	.catch(err => {
		fastify.log.error(err);
		process.exit(1);
	});