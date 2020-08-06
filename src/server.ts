import express from 'express';
import morgan from 'morgan';
import {Twitter} from "./routes/twitter";

const app = express();

app.use(morgan('dev'));

app.use(express.static('public'));
app.use('/index.js', express.static(__dirname + '/index.js'));
app.use('/twitter', Twitter.router);

app.listen(3000, () => console.log('Listening at http://localhost:3000'));

/*
function staticGet(filename : string, path? : string) {
	fastify.get(path || "/" + filename, (request, reply) => {
		reply.sendFile(filename)
	});
}

staticGet("index.html", "/");
staticGet("index.js", "/index.js");
staticGet("index.css", "/index.css");

app.get("/twitter/tweets/!*", (req : Request, res : Response) => {
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
	});*/
