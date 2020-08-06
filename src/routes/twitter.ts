import {NextFunction, Request, Response, Router} from 'express';
import TwitterLite from 'twitter-lite';
import {consumer_key, consumer_secret} from '../credentials.json';
import {tweetToPostData} from '../core/twitter';
import {PostData} from '../PostData';

let client = new TwitterLite({consumer_key, consumer_secret});

let loginData : {
	userId : string,
	screenName : string,
}

export namespace Twitter {
	async function homeTimeline(req : Request, res : Response, next : NextFunction) {
		try {
			const response = await client.get('statuses/home_timeline');
			console.log(`${response.length - 1} tweets sent.`);

			console.log(`Rate: ${response._headers.get('x-rate-limit-remaining')} / ${response._headers.get('x-rate-limit-limit')}`);
			const delta = (response._headers.get('x-rate-limit-reset') * 1000) - Date.now()
			console.log(`Reset: ${Math.ceil(delta / 1000 / 60)} minutes`);

			const tweets : PostData[] = response.map(tweetToPostData);

			await res.json(tweets);
		}catch (e) {
			if ('errors' in e) {
				for (const error of e.errors) {
					// Twitter API error
					if (error.code === 88)
						console.log('Rate limit will reset on', new Date(e._headers.get('x-rate-limit-reset') * 1000));
					else {
						console.error(error);
						next(error);
					}
				}
			}else {
				console.error(e);
				next(e);
			}
		}
	}

	async function login(req : Request, res : Response, next : NextFunction) {
		try {
			if (loginData)
				return await res.json({
					userId: loginData.userId,
					screenName: loginData.screenName,
				});

			const response = await client.getRequestToken('http://127.0.0.1:3000/twitter/callback');

			if (response.oauth_callback_confirmed !== 'false')
				await res.json({auth_url: 'https://api.twitter.com/oauth/authenticate?oauth_token=' + response.oauth_token});
			else
				await res.status(500).json({});
		}catch (error) {
			next(error);
		}
	}

	async function callback(req : Request, res : Response, next : NextFunction) {
		const response = await client.getAccessToken({
			oauth_verifier: <string>req.query.oauth_verifier,
			oauth_token: <string>req.query.oauth_token,
		});

		client = new TwitterLite({
			consumer_key,
			consumer_secret,
			access_token_key: response.oauth_token,
			access_token_secret: response.oauth_token_secret,
		});

		loginData = {
			userId: response.user_id,
			screenName: response.screen_name,
		};

		res.redirect('/');
	}

	export const router = Router();

	router.get('/login', login);
	router.get('/callback', callback);
	router.get('/tweets/home_timeline', homeTimeline);
}