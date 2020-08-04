import {Request, Response, Router} from 'express';
import TwitterLite from 'twitter-lite';
import {consumer_key, consumer_secret} from '../credentials.json';

const client = new TwitterLite({consumer_key, consumer_secret});

let loginData : {
	accessToken: string,
	accessTokenSecret: string,
	userId: string,
	screenName: string,
}

export namespace Twitter {
	function tweets(req : Request, res : Response) {
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
		const response = await client.getRequestToken('http://127.0.0.1:3000/twitter/callback');
		console.dir(response);

		if (response.oauth_callback_confirmed !== 'false')
			await res.json({auth_url: 'https://api.twitter.com/oauth/authenticate?oauth_token=' + response.oauth_token});
		else
			await res.status(500).json({});
	}

	async function callback(req : Request, res : Response) {
		console.dir(req.params);

		const response = await client.getAccessToken({
			oauth_verifier: req.params.oauth_verifier,
			oauth_token: req.params.oauth_token,
		});

		loginData = {
			accessToken: response.oauth_token,
			accessTokenSecret: response.oauth_token_secret,
			userId: response.user_id,
			screenName: response.screen_name,
		};

		res.redirect('/');
	}

	export const router = Router();

	router.get('/tweets', tweets);
	router.get('/login', login);
	router.get('/callback', callback);
}