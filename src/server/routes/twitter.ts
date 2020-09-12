import {NextFunction, Request, Response, Router} from 'express';
import {Profile, Strategy as TwitterStrategy} from 'passport-twitter';
import TwitterLite from 'twitter-lite';
import passport from 'passport';
import {RateLimitStatus, StuffedResponse} from '../../core/ServerResponses';
import {parseTweet, parseTweets} from '../twitter';
import {Tweet, TwitterResponse, TwitterSearchResponse} from '../twitter/types';
import {TimelineOptions} from '../../core/Timeline';
import * as fs from 'fs';
import * as path from 'path';

export namespace Twitter {
	async function loadConsumerCredentials() : Promise<{consumer_key: string, consumer_secret: string}> {
		if (process.env.SOSHAL_TWITTER_CONSUMER_KEY && process.env.SOSHAL_TWITTER_CONSUMER_SECRET) {
			return {
				consumer_key: process.env.SOSHAL_TWITTER_CONSUMER_KEY,
				consumer_secret: process.env.SOSHAL_TWITTER_CONSUMER_SECRET,
			};
		}else if (
			(process.env.SOSHAL_TWITTER_CONSUMER_KEY && !process.env.SOSHAL_TWITTER_CONSUMER_SECRET) ||
			(!process.env.SOSHAL_TWITTER_CONSUMER_KEY && process.env.SOSHAL_TWITTER_CONSUMER_SECRET)
		) {
			throw new Error('If using environment variables, both SOSHAL_TWITTER_CONSUMER_KEY and SOSHAL_TWITTER_CONSUMER_SECRET need to be set.');
		}else {
			const credentialPath = path.join(__dirname, 'credentials.json');
			try {
				const {consumer_key, consumer_secret} = JSON.parse(await fs.promises.readFile(credentialPath, 'utf-8'));

				return {consumer_key, consumer_secret};
			}catch (e) {
				throw new Error(`Couldn't load ${credentialPath}`);
			}
		}
	}

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

	async function respondTimelineUpdate(tweets : Tweet[], response : TwitterResponse, reverse: boolean, res : Response) {
		console.log(tweets.length + ' tweets received.')
		const {posts, reposts, quotes, timelinePosts} = parseTweets(tweets, reverse);
		console.log(`${timelinePosts.newArticles.length} tweets sent.`);

		await res.json({
			rateLimitStatus: getRateLimits(response),
			posts,
			reposts,
			quotes,
			timelinePosts,
		} as StuffedResponse);
	}

	async function respondRateOver(e : any, res : Response, next : NextFunction) {
		if (e.errors) {
			const error = e.errors.find((error : any) => error.code === 88);

			if (error) {
				console.log('Rate limit will reset on', new Date(e._headers.get('x-rate-limit-reset') * 1000));

				await res.json({
					rateLimitStatus: getRateLimits(e),
					posts: [],
					reposts: [],
					quotes: [],
					timelinePosts: {newArticles: []},
				} as StuffedResponse);
			}
		}else
			parseQueryErrors(e, next);
	}

	function parseTimelineOptions(query : any) : TimelineOptions {
		return {
			q: query.q,
			since: query.since,
			max: query.max,
			count: parseInt(query.count),
			userId: query.userId,
			userHandle: query.userHandle,
			listId: query.listId,
			listSlug: query.listSlug,
		}
	}

	export function checkLogin() : boolean {
		return !!authUser;
	}

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

	function preventUnauthorized(req : Request, res : Response, next : NextFunction) {
		if (req.user)
			next();
		else
			res.sendStatus(401);
	}

	export async function getRouter() : Promise<Router> {
		const {consumer_key, consumer_secret} = await loadConsumerCredentials();
		let  client = new TwitterLite({consumer_key, consumer_secret});

		async function homeTimeline(req : Request, res : Response, next : NextFunction) {
			try {
				const options = parseTimelineOptions(req.query);

				const response : TwitterResponse = await client.get('statuses/home_timeline', {
					...(options.since ? {since_id: options.since} : {}),
					...(options.max ? {max_id: options.max} : {}),
					...(options.count ? {count: options.count} : {}),
					tweet_mode: 'extended',
				});
				logRateLimit(response);

				await respondTimelineUpdate(response as any, response, !!options.since, res);
			}catch (e) {
				await respondRateOver(e, res, next);
			}
		}

		async function userTimeline(req : Request, res : Response, next : NextFunction) {
			try {
				const options = parseTimelineOptions(req.query);

				const response : TwitterResponse = await client.get('statuses/user_timeline', {
					...(options.since ? {since_id: options.since} : {}),
					...(options.max ? {max_id: options.max} : {}),
					...(options.count ? {count: options.count} : {}),
					...(options.userId ? {user_id: options.userId} : {}),
					...(options.userHandle ? {screen_name: options.userHandle} : {}),
					tweet_mode: 'extended',
				});
				logRateLimit(response);

				await respondTimelineUpdate(response as any, response, !!options.since, res);
			}catch (e) {
				await respondRateOver(e, res, next);
			}
		}

		async function mentionsTimeline(req : Request, res : Response, next : NextFunction) {
			try {
				const options = parseTimelineOptions(req.query);

				const response : TwitterResponse = await client.get('statuses/mentions_timeline', {
					...(options.since ? {since_id: options.since} : {}),
					...(options.max ? {max_id: options.max} : {}),
					...(options.count ? {count: options.count} : {}),
					tweet_mode: 'extended',
				});
				logRateLimit(response);

				await respondTimelineUpdate(response as any, response, !!options.since, res);
			}catch (e) {
				await respondRateOver(e, res, next);
			}
		}

		async function list(req : Request, res : Response, next : NextFunction) {
			try {
				const options = parseTimelineOptions(req.query);

				const response : TwitterResponse = await client.get('lists/statuses', {
					...(options.since ? {since_id: options.since} : {}),
					...(options.max ? {max_id: options.max} : {}),
					...(options.count ? {count: options.count} : {}),
					...(options.userId ? {owner_id: options.userId} : {}),
					...(options.userHandle ? {owner_screen_name: options.userHandle} : {}),
					...(options.listId ? {list_id: options.listId} : {}),
					...(options.listSlug ? {slug: options.listSlug} : {}),
					tweet_mode: 'extended',
				});
				logRateLimit(response);

				await respondTimelineUpdate(response as any, response, !!options.since, res);
			}catch (e) {
				await respondRateOver(e, res, next);
			}
		}

		async function likes(req : Request, res : Response, next : NextFunction) {
			try {
				const options = parseTimelineOptions(req.query);

				const response : TwitterResponse = await client.get('favorites/list', {
					...(options.since ? {since_id: options.since} : {}),
					...(options.max ? {max_id: options.max} : {}),
					...(options.count ? {count: options.count} : {}),
					...(options.userId ? {user_id: options.userId} : {}),
					...(options.userHandle ? {screen_name: options.userHandle} : {}),
					tweet_mode: 'extended',
				});
				logRateLimit(response);

				await respondTimelineUpdate(response as any, response, !!options.since, res);
			}catch (e) {
				await respondRateOver(e, res, next);
			}
		}

		async function search(req : Request, res : Response, next : NextFunction) {
			try {
				const options = parseTimelineOptions(req.query);

				const response : TwitterSearchResponse = await client.get('search/tweets', {
					...(options.since ? {since_id: options.since} : {}),
					...(options.max ? {max_id: options.max} : {}),
					...(options.count ? {count: options.count} : {}),
					q: options.q,
					result_type: 'recent',
					tweet_mode: 'extended',
				});
				logRateLimit(response);

				await respondTimelineUpdate(response.statuses, response, !!options.since, res);
			}catch (e) {
				if (e.errors && e.errors.find((error : { code : number, message : string }) => error.code === 25))
					return next(new Error('Twitter: ' + e.errors[0].message));
				else
					await respondRateOver(e, res, next);
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
					await respondRateOver(e, res, next);
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

		const router = Router();

		router.get('/login', passport.authenticate('twitter'));
		router.get('/callback', passport.authenticate('twitter', {
			successRedirect: '/',
			//failureRedirect: '/' TODO Have a way to signal failure
		}));
		router.get('/tweets/home_timeline', preventUnauthorized, homeTimeline);
		router.get('/tweets/user_timeline', preventUnauthorized, userTimeline);
		router.get('/tweets/mentions_timeline', preventUnauthorized, mentionsTimeline);
		router.get('/tweets/list', preventUnauthorized, list);
		router.get('/tweets/likes', preventUnauthorized, likes);
		router.get('/tweets/search', preventUnauthorized, search);
		router.get('/tweets/status/:id', preventUnauthorized, status);
		router.post('/like/:id', preventUnauthorized, like);
		router.post('/unlike/:id', preventUnauthorized, unlike);
		router.post('/retweet/:id', preventUnauthorized, retweet);

		if (process.env.NODE_ENV === 'development') {
			try {
				// @ts-ignore
				(await import('./testAccess'))(router, consumer_key, consumer_secret, (newClient : TwitterLite, newAuthUser : Twitter.AuthUser) => {
					client = newClient;
					authUser = newAuthUser;
				});
				console.log('testAccess.ts loaded.');
			}catch (e) {
				console.log('testAccess.ts not found, ignoring.');
			}
		}

		return router;
	}
}