import {ArticleType, PostData, PostImageData, PostVideoData, RepostData} from '../../core/PostData';
import {TimelinePayload} from '../../core/ServerResponses';

export interface TwitterResponse {
	_headers : TwitterHeaders;
}

export interface TwitterHomeTimeline extends TwitterResponse {
	[index : number] : Tweet;
}

export interface TwitterSearchResponse extends TwitterResponse {
	statuses : Tweet[],
	search_metadata : {
		completed_in : number,
		max_id : number,
		max_id_str : string,
		next_results : string,
		query : string,
		refresh_url : string,
		count : number,
		since_id : number,
		since_id_str : string
	}
}

interface TwitterHeaders extends Headers {
	'cache-control' : []
	connection : []
	'content-disposition' : []
	'content-encoding' : []
	'content-length' : []
	'content-type' : []
	date : []
	expires : []
	'last-modified' : []
	pragma : []
	server : []
	'set-cookie' : []
	status : []
	'strict-transport-security' : []
	'x-access-level' : []
	'x-connection-hash' : []
	'x-content-type-options' : []
	'x-frame-options' : []
	'x-rate-limit-limit' : []
	'x-rate-limit-remaining' : []
	'x-rate-limit-reset' : []
	'x-response-time' : []
	'x-transaction' : []
	'x-twitter-response-tags' : []
	'x-xss-protection' : []
}

export interface Tweet {
	created_at : string
	id : number
	id_str : string
	//text : string
	full_text : string
	truncated : boolean
	entities : {
		hashtags : Hashtag[]
		symbols : []
		user_mentions : UserMention[]
		urls : TweetURL[]
		media? : Media[]
	}
	extended_entities? : {
		hashtags : Hashtag[]
		symbols : []
		user_mentions : UserMention[]
		urls : TweetURL[]
		media? : Media[]
	}
	source : string
	in_reply_to_status_id : null
	in_reply_to_status_id_str : null
	in_reply_to_user_id : null
	in_reply_to_user_id_str : null
	in_reply_to_screen_name : null
	user : User
	geo : null
	coordinates : null
	place : null
	contributors : null
	retweeted_status? : Tweet
	is_quote_status : boolean
	retweet_count : number
	favorite_count : number
	favorited : boolean
	retweeted : boolean
	possibly_sensitive? : boolean
	possibly_sensitive_appealable? : boolean
	lang : string
}

interface User {
	id : number
	id_str : string
	name : string
	screen_name : string
	location : string
	description : string
	url : string
	entities : {
		url : {
			urls : TweetURL[]
		}
		description : {
			urls : TweetURL[]
		}
	}
	protected : boolean
	followers_count : number
	friends_count : number
	listed_count : number
	created_at : string
	favourites_count : number
	//utc_offset: null
	//time_zone: null
	geo_enabled : boolean
	verified : boolean
	statuses_count : number
	//lang: null
	contributors_enabled : boolean
	is_translator : boolean
	is_translation_enabled : boolean
	profile_background_color : string
	profile_background_image_url : string
	profile_background_image_url_https : string
	profile_background_tile : boolean
	profile_image_url : string
	profile_image_url_https : string
	profile_banner_url : string
	profile_link_color : string
	profile_sidebar_border_color : string
	profile_sidebar_fill_color : string
	profile_text_color : string
	profile_use_background_image : boolean
	has_extended_profile : boolean
	default_profile : boolean
	default_profile_image : boolean
	following : boolean
	follow_request_sent : boolean
	notifications : boolean
	translator_type : string
}

interface TweetURL {
	url : string
	expanded_url : string
	display_url : string
	indices : number[]
}

interface Hashtag {
	text : string
	indices : number[]
}

interface UserMention {
	screen_name : string
	name : string
	id : number
	id_str : string
	indices : number[]
}

interface TweetURL {
	url : string
	expanded_url : string
	display_url : string
	indices : number[]
}

interface Media {
	id : number
	id_str : string
	indices : number[]
	media_url : string
	media_url_https : string
	url : string
	display_url : string
	expanded_url : string
	type : string
	sizes : {
		thumb : MediaSize
		large : MediaSize
		medium : MediaSize
		small : MediaSize
	}
	source_status_id : number
	source_status_id_str : string
	source_user_id : number
	source_user_id_str : string
	video_info?: {
		aspect_ratio: number[]
		duration_millis?: number
		variants: {
			bitrate?: number
			content_type: string
			url: string
		}[]
	}
	additional_media_info?: {
		title: string
		description: string
		embeddable: boolean
		monetizable: boolean
	}
}

interface MediaSize {
	w : number
	h : number
	resize : string
}

export function parseTweets(tweets : Tweet[]) : {posts: PostData[], reposts: RepostData[], timelinePosts : TimelinePayload} {
	const posts : PostData[] = [];
	const reposts : RepostData[] = [];
	const timelinePosts : TimelinePayload = {newArticles: []};

	tweets.reverse().map(tweet => {
		const {post, repost} = parseTweet(tweet)
		posts.push(post);

		if (repost) {
			reposts.push(repost);
			timelinePosts.newArticles.push({type: ArticleType.Repost, id: repost.id});
		}else
			timelinePosts.newArticles.push({type: ArticleType.Post, id: post.id});
	})

	return {posts, reposts, timelinePosts};
}

export function parseTweet(tweet : Tweet) : {post: PostData, repost?: RepostData} {
	return {
		post: tweetToPostData(tweet),
		repost: ('retweeted_status' in tweet) ? retweetToRepostData(tweet) : undefined,
	}
}

export function tweetToPostData(tweet : Tweet) : PostData {
	const {images, video} = parseEntities(tweet);

	return {
		id: tweet.id_str,
		creationTime: tweet.created_at,
		authorName: tweet.user.name,
		authorHandle: tweet.user.screen_name,
		authorAvatar: tweet.user.profile_image_url_https,
		text: removeTextLink(tweet.full_text),
		images,
		video,
		liked: tweet.favorited,
		reposted: tweet.retweeted,
		likeCount: tweet.favorite_count,
		repostCount: tweet.retweet_count,
	};
}

function retweetToRepostData(tweet : Tweet) : RepostData {
	if (!tweet.retweeted_status)
		throw new Error('Tweet doesn\'t include retweeted_status.');

	return {
		id: tweet.id_str,
		creationTime: tweet.created_at,
		reposterName: tweet.user.name,
		reposterHandle: tweet.user.screen_name,
		reposterAvatar: tweet.user.profile_image_url_https,
		repostedId: tweet.retweeted_status.id_str,
	};
}

function parseEntities(tweet : Tweet) : {images?: PostImageData[], video?: PostVideoData} {
	let images : PostImageData[] | undefined;
	let video : PostVideoData | undefined;

	if (tweet.extended_entities) {
		const medias = tweet.extended_entities.media;

		if (medias) {
			const media = medias[0];

			switch (media.type) {
				case 'photo':
					images = medias.map((media : Media) => {
						return {
							url: media.media_url_https,
							sizes: media.sizes,
						};
					});
					break;
				case 'video':
					if (media.video_info && media.video_info.variants) {
						video = {
							type: 'video',
							url: media.media_url_https,
							sizes: media.sizes,
							aspectRatio: media.video_info.aspect_ratio,
							durationMillis: media.video_info.duration_millis,
							variants: media.video_info.variants.map(variant => {
								return {
									url: variant.url,
									contentType: variant.content_type,
									bitrate: variant.bitrate as number,
								};
							}),
							autoplay: false,
						}
					}
					break;
				case 'animated_gif':
					if (media.video_info && media.video_info.variants) {
						video = {
							type: 'gif',
							url: media.media_url_https,
							sizes: media.sizes,
							aspectRatio: media.video_info.aspect_ratio,
							variants: media.video_info.variants.map(variant => {
								return {
									url: variant.url,
									contentType: variant.content_type,
									bitrate: variant.bitrate as number,
								};
							}),
							autoplay: true,
						}
					}
					break;
			}
		}
	}else
		images = tweet.entities && tweet.entities.media ?
			[{
				url: tweet.entities.media[0].media_url_https,
				sizes: tweet.entities.media[0].sizes,
			}] :
			undefined;

	return {images, video};
}

export function removeTextLink(text : string) : string {
	const lastIndex = text.lastIndexOf('https://t.co');

	if (lastIndex >= 0)
		return text.substring(0, lastIndex - 1);
	else return text;
}