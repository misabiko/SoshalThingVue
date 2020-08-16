import {NextFunction, Request, Response, Router} from 'express';
import {Profile, Strategy as TwitterStrategy} from 'passport-twitter';
import TwitterLite from 'twitter-lite';
import {consumer_key, consumer_secret} from '../credentials.json';
import {tweetToPostData} from '../core/twitter';
import {PostData} from '../../core/PostData';
import passport from 'passport';
import {RateLimitStatus, StuffedResponse} from '../../core/ServerResponses';

let client = new TwitterLite({consumer_key, consumer_secret});

interface AuthUser {
	id : string,
	username : string,
}

let authUser : AuthUser;

function getRateLimits(response: any) : RateLimitStatus{
	return {
		remaining: parseInt(response._headers.get('x-rate-limit-remaining')),
		limit: parseInt(response._headers.get('x-rate-limit-limit')),
		reset: parseInt(response._headers.get('x-rate-limit-reset')),
	};
}

export namespace Twitter {
	function logRateLimit(response: any) {
		console.log(`Rate: ${response._headers.get('x-rate-limit-remaining')} / ${response._headers.get('x-rate-limit-limit')}`);
		const delta = (response._headers.get('x-rate-limit-reset') * 1000) - Date.now()
		console.log(`Reset: ${Math.ceil(delta / 1000 / 60)} minutes`);
	}

	function logTweets(response : any) {
		if ('search_metadata' in response)
			console.log(`${response.search_metadata.count} tweets sent.`);
		else
			console.log(`${response.length - 1} tweets sent.`);

		logRateLimit(response);
	}

	function parseQueryErrors(e : any, next : NextFunction) {
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

	async function homeTimeline(_req : Request, res : Response, next : NextFunction) {
		try {
			const response = await client.get('statuses/home_timeline');
			logTweets(response);

			const posts : PostData[] = response.map(tweetToPostData);

			await res.json({
				services: {Twitter: {home_timeline: getRateLimits(response)}},
				posts,
			} as StuffedResponse);
		}catch (e) {
			parseQueryErrors(e, next);
		}
	}

	async function search(req : Request, res : Response, next : NextFunction) {
		try {
			const response = await client.get('search/tweets', {q: req.query.q});
			logTweets(response);
			//TODO Add type of search response

			const posts : PostData[] = response.statuses.map(tweetToPostData);

			await res.json({
				services: {Twitter: {search: getRateLimits(response)}},
				posts,
			} as StuffedResponse);
		}catch (e) {
			parseQueryErrors(e, next);
		}
	}

	async function like(req : Request, res : Response, next : NextFunction) {
		try {
			const response = await client.post('favorites/create', {
				id: req.params.id,
			});

			await res.json({
				post: tweetToPostData(response),
			});
		}catch (e) {
			parseQueryErrors(e, next);
		}
	}

	async function unlike(req : Request, res : Response, next : NextFunction) {
		try {
			const response = await client.post('favorites/destroy', {
				id: req.params.id,
			});

			await res.json({
				post: tweetToPostData(response),
			});
		}catch (e) {
			parseQueryErrors(e, next);
		}
	}

	async function retweet(req : Request, res : Response, next : NextFunction) {
		try {
			const response = await client.post('statuses/retweet', {
				id: req.params.id,
			});

			await res.json({
				post: tweetToPostData(response),
			});
		}catch (e) {
			parseQueryErrors(e, next);
		}
	}

	export function checkLogin() : boolean {
		return !!authUser;
	}

	export const router = Router();

	passport.serializeUser(function(user : AuthUser, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function(id : string, done) {
		if (!checkLogin())
			done(new Error(`User login data hasn't been initialized.`));
		else if (id !== authUser.id)
			done(new Error(`"${id}" isn't a valid user id.`));
		else
			done(null, authUser);
	});

	passport.use(new TwitterStrategy({
			consumerKey: consumer_key,
			consumerSecret: consumer_secret,
			callbackURL: 'http://localhost:3000/twitter/callback',
		},
		function(access_token_key, access_token_secret, profile: Profile, done) {
			try {
				client = new TwitterLite({
					consumer_key,
					consumer_secret,
					access_token_key,
					access_token_secret,
				});

				authUser = {
					id: profile.id,
					username: profile.username,
				};

				done(null, authUser);
			}catch (e) {
				done(e);
			}
		}
	));

	function preventUnauthorized(req : Request, res : Response, next : NextFunction) {
		if (req.user)
			next();
		else
			res.sendStatus(401);
	}

	router.get('/login', passport.authenticate('twitter'));
	router.get('/callback', passport.authenticate('twitter', {
		successRedirect: '/',
		//failureRedirect: '/' TODO Have a way to signal failure
	}));
	router.get('/tweets/home_timeline', preventUnauthorized, homeTimeline);
	router.get('/tweets/search', preventUnauthorized, search);
	router.post('/like/:id', preventUnauthorized, like);
	router.post('/unlike/:id', preventUnauthorized, unlike);
	router.post('/retweet/:id', preventUnauthorized, retweet);
}