import {Request, Response, Router} from 'express';
import Twit from 'twit';
import credentials from '../credentials.json';

const T = new Twit(credentials);

const twitter : {
	[endpoint : string] : {
		resetTime : Date,
		remaining : number
	}
} = {};

const tweets = (req : Request, res : Response) => {
	/*if (request.query)
		fastify.log.info("Params: ", request.query);*/

	console.dir(req.params);

	/*const endpoint : string = request.params["*"];

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
			.catch(error => fastify.log.error("Error on Twitter request.", error));*/
}

async function login(req : Request, res : Response) {
	console.dir(await T.post('oauth/request_token', {}));

	res.json({});
}

export namespace Twitter {
	export const router = Router();

	router.get('/tweets', tweets);
	router.get('/login', login);
}