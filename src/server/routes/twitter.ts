import {NextFunction, Request, Response, Router} from 'express';
import {Profile, Strategy as TwitterStrategy} from 'passport-twitter';
import TwitterLite from 'twitter-lite';
import {consumer_key, consumer_secret} from '../credentials.json';
import {tweetToPostData} from '../core/twitter';
import {PostData} from '../../core/PostData';
import passport from 'passport';

let client = new TwitterLite({consumer_key, consumer_secret});

interface AuthUser {
	id : string,
	username : string,
}

let authUser : AuthUser

export namespace Twitter {
	function logTweets(response : any) {
		console.log(`${response.length - 1} tweets sent.`);

		console.log(`Rate: ${response._headers.get('x-rate-limit-remaining')} / ${response._headers.get('x-rate-limit-limit')}`);
		const delta = (response._headers.get('x-rate-limit-reset') * 1000) - Date.now()
		console.log(`Reset: ${Math.ceil(delta / 1000 / 60)} minutes`);
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

			const tweets : PostData[] = response.map(tweetToPostData);

			await res.json(tweets);
		}catch (e) {
			parseQueryErrors(e, next);
		}
	}

	async function search(req : Request, res : Response, next : NextFunction) {
		try {
			const response = await client.get('search/tweets', {q: req.query.q});
			logTweets(response);

			console.dir(response);
			const tweets : PostData[] = response.statuses.map(tweetToPostData);

			await res.json(tweets);
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
}