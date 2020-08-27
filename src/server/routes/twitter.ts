import {NextFunction, Request, Response, Router} from 'express';
import {Profile, Strategy as TwitterStrategy} from 'passport-twitter';
import TwitterLite from 'twitter-lite';
import {consumer_key, consumer_secret} from '../credentials.json';
import passport from 'passport';
import {RateLimitStatus, StuffedResponse} from '../../core/ServerResponses';
import {parseTweet, parseTweets} from '../twitter';
import {Tweet, TwitterResponse, TwitterSearchResponse} from '../twitter/types';

export namespace Twitter {
	let client = new TwitterLite({consumer_key, consumer_secret});

	export interface AuthUser {
		id : string,
		username : string,
	}

	let authUser : AuthUser;

	function getRateLimits(response : TwitterResponse) : RateLimitStatus {
		return {
			remaining: parseInt(response._headers.get('x-rate-limit-remaining') || ''),
			limit: parseInt(response._headers.get('x-rate-limit-limit') || ''),
			reset: parseInt(response._headers.get('x-rate-limit-reset') || ''),
		};
	}

	function logRateLimit(response : TwitterResponse) {
		console.log(`Rate: ${response._headers.get('x-rate-limit-remaining')} / ${response._headers.get('x-rate-limit-limit')}`);
		const reset = (<unknown>response._headers.get('x-rate-limit-reset')) as number;
		const delta = (reset * 1000) - Date.now();
		console.log(`Reset: ${Math.ceil(delta / 1000 / 60)} minutes`);
	}

	function parseQueryErrors(e : any, next : NextFunction) {
		if ('errors' in e) {
			for (const error of e.errors)
				console.error(error);
		}else
			console.error(e);

		next(e);
	}

	async function respondTimelineUpdate(tweets : Tweet[], response : TwitterResponse, endpoint : string, res : Response) {
		const {posts, reposts, quotes, timelinePosts} = parseTweets(tweets);

		await res.json({
			services: {Twitter: {[endpoint]: getRateLimits(response)}},
			posts,
			reposts,
			quotes,
			timelinePosts,
		} as StuffedResponse);
	}

	async function respondRateOver(e : any, endpoint : string, res : Response, next : NextFunction) {
		if (e.errors) {
			const error = e.errors.find((error : any) => error.code === 88);

			if (error) {
				console.log('Rate limit will reset on', new Date(e._headers.get('x-rate-limit-reset') * 1000));

				await res.json({
					services: {Twitter: {[endpoint]: getRateLimits(e)}},
					posts: [],
					reposts: [],
					quotes: [],
					timelinePosts: {newArticles: []},
				} as StuffedResponse);
			}
		}else
			parseQueryErrors(e, next);
	}

	async function homeTimeline(_req : Request, res : Response, next : NextFunction) {
		try {
			const response : TwitterResponse = await client.get('statuses/home_timeline', {tweet_mode: 'extended'});
			console.log(`${(response as any).length - 1} tweets sent.`);
			logRateLimit(response);

			await respondTimelineUpdate(response as any, response, 'home_timeline', res);
		}catch (e) {
			await respondRateOver(e, 'home_timeline', res, next);
		}
	}

	async function search(req : Request, res : Response, next : NextFunction) {
		try {
			const response : TwitterSearchResponse = await client.get('search/tweets', {
				q: req.query.q,
				tweet_mode: 'extended',
			});
			console.log(`${response.search_metadata.count} tweets sent.`);
			logRateLimit(response);

			await respondTimelineUpdate(response.statuses, response, 'search', res);
		}catch (e) {
			if (e.errors && e.errors.find((error : { code : number, message : string }) => error.code === 25))
				return next(new Error('Twitter: ' + e.errors[0].message));
			else
				await respondRateOver(e, 'search', res, next);
		}
	}

	async function status(req : Request, res : Response, next : NextFunction) {
		try {
			const response = await client.get('statuses/show', {
				id: req.params.id,
				tweet_mode: 'extended',
			});
			console.log(`1 tweet sent.`);
			logRateLimit(response);

			await res.json(parseTweet(response));
		}catch (e) {
			if (e.errors && e.errors.find((error : { code : number, message : string }) => error.code === 25))
				return next(new Error('Twitter: ' + e.errors[0].message));
			else
				await respondRateOver(e, 'status', res, next);
		}
	}

	async function like(req : Request, res : Response, next : NextFunction) {
		try {
			const response = await client.post('favorites/create', {
				id: req.params.id,
				tweet_mode: 'extended',
			});

			await res.json(parseTweet(response));
		}catch (e) {
			if (e.errors && e.errors.find((error : { code : number, message : string }) => error.code === 139)) {
				try {
					const response = await client.get('statuses/show', {
						id: req.params.id,
						tweet_mode: 'extended',
					});

					await res.json(parseTweet(response));
				}catch (showError) {
					parseQueryErrors(showError, next);
				}
			}else
				parseQueryErrors(e, next);
		}
	}

	async function unlike(req : Request, res : Response, next : NextFunction) {
		try {
			const response = await client.post('favorites/destroy', {
				id: req.params.id,
				tweet_mode: 'extended',
			});

			await res.json(parseTweet(response));
		}catch (e) {
			if (
				e.errors && e.errors.find((error : { code : number, message : string }) => error.code === 144) &&
				parseInt(req.params.id) > 1000
			) {
				try {
					const response = await client.get('statuses/show', {
						id: req.params.id,
						tweet_mode: 'extended',
					});

					await res.json(parseTweet(response));
				}catch (showError) {
					parseQueryErrors(showError, next);
				}
			}else
				parseQueryErrors(e, next);
		}
	}

	async function retweet(req : Request, res : Response, next : NextFunction) {
		try {
			const response = await client.post('statuses/retweet', {
				id: req.params.id,
				tweet_mode: 'extended',
			});

			await res.json(parseTweet(response));
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
		function(access_token_key, access_token_secret, profile : Profile, done) {
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
		},
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
	router.get('/tweets/status/:id', preventUnauthorized, status);
	router.post('/like/:id', preventUnauthorized, like);
	router.post('/unlike/:id', preventUnauthorized, unlike);
	router.post('/retweet/:id', preventUnauthorized, retweet);

	// @ts-ignore
	import('./testAccess')
		.then(obj => {
			obj.default(router, client, authUser);
			console.log('testAccess.ts loaded.');
		})
		.catch(error => {console.log('testAccess.ts not found, ignoring.')});
}