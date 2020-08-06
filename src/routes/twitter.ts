import {NextFunction, Request, Response, Router} from 'express';
import TwitterLite from 'twitter-lite';
import {consumer_key, consumer_secret} from '../credentials.json';
import {PostData, RepostData} from '../PostData';

let client = new TwitterLite({consumer_key, consumer_secret});

let loginData : {
	userId : string,
	screenName : string,
}

export namespace Twitter {
	interface Tweet {
		created_at : string,
		id : number,
		id_str : string,
		text : string,
		truncated : boolean,
		entities : { hashtags : [], symbols : [], user_mentions : [], urls : [] },
		retweeted_status?: Tweet,
		source : string,
		in_reply_to_status_id: null,
		in_reply_to_status_id_str: null,
		in_reply_to_user_id: null,
		in_reply_to_user_id_str: null,
		in_reply_to_screen_name: null,
		user : User,
		geo : null,
		coordinates : null,
		place : null,
		contributors : null,
		is_quote_status : boolean,
		retweet_count : number,
		favorite_count : number,
		favorited : boolean,
		retweeted : boolean,
		possibly_sensitiv? : boolean,
		possibly_sensitive_appealable? : boolean,
		lang : string
	}

	interface User {
		id : number,
		id_str : string,
		name : string,
		screen_name : string,
		location : string,
		description : string,
		url : string,
		//entities: [Object],
		protected : boolean,
		followers_count : number,
		friends_count : number,
		listed_count : number,
		created_at : string,
		favourites_count : number,
		//utc_offset: null,
		//time_zone: null,
		geo_enabled : boolean,
		verified : boolean,
		statuses_count : number,
		//lang: null,
		contributors_enabled : boolean,
		is_translator : boolean,
		is_translation_enabled : boolean,
		profile_background_color : string,
		profile_background_image_url : string,
		profile_background_image_url_https : string,
		profile_background_tile : boolean,
		profile_image_url : string,
		profile_image_url_https : string,
		profile_banner_url : string,
		profile_link_color : string,
		profile_sidebar_border_color : string,
		profile_sidebar_fill_color : string,
		profile_text_color : string,
		profile_use_background_image : boolean,
		has_extended_profile : boolean,
		default_profile : boolean,
		default_profile_image : boolean,
		following : boolean,
		follow_request_sent : boolean,
		notifications : boolean,
		translator_type : string
	}

	function tweetToPostData(tweet : Tweet) : PostData {
		if ('retweeted_status' in tweet)
			return retweetToRepostData(tweet);
		else
			return {
				id: tweet.id_str,
				creationTime: new Date(tweet.created_at),
				authorName: tweet.user.name,
				authorHandle: tweet.user.screen_name,
				authorAvatar: tweet.user.profile_image_url_https,
				text: removeTextLink(tweet.text),
				//images? : string[],
				liked: tweet.favorited,
				reposted: tweet.retweeted,
			};
	}

	function retweetToRepostData(tweet : Tweet) : RepostData {
		return {
			reposterName : tweet.user.name,
			reposterHandle : tweet.user.screen_name,
			reposterAvatar : tweet.user.profile_image_url_https,
			...tweetToPostData(tweet.retweeted_status)
		};
	}

	export function removeTextLink(text : string) : string {
		const lastIndex = text.lastIndexOf('https://t.co');

		if (lastIndex >= 0)
			return text.substring(0, lastIndex - 1);
		else return text;
	}

	async function homeTimeline(req : Request, res : Response, next : NextFunction) {
		try {
			const response = await client.get('statuses/home_timeline');
			console.log(`${response.length - 1} tweets sent.`);

			console.log(`Rate: ${response._headers.get('x-rate-limit-remaining')} / ${response._headers.get('x-rate-limit-limit')}`);
			const delta = (response._headers.get('x-rate-limit-reset') * 1000) - Date.now()
			console.log(`Reset: ${Math.ceil(delta / 1000 / 60)} minutes`);

			const tweets = response.map(tweetToPostData);
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