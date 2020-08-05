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
		console.dir(req.params);
	}

	async function login(req : Request, res : Response) {
		if (loginData)
			await res.json({
				userId: loginData.userId,
				screenName: loginData.screenName,
			});

		const response = await client.getRequestToken('http://127.0.0.1:3000/twitter/callback');

		if (response.oauth_callback_confirmed !== 'false')
			await res.json({auth_url: 'https://api.twitter.com/oauth/authenticate?oauth_token=' + response.oauth_token});
		else
			await res.status(500).json({});
	}

	async function callback(req : Request, res : Response) {
		const response = await client.getAccessToken({
			oauth_verifier: <string>req.query.oauth_verifier,
			oauth_token: <string>req.query.oauth_token,
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