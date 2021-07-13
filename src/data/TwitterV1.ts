import {TwitterLitePayload} from '@/data/TwitterV2'
import {Payload} from '@/services'
import {QuoteArticle, RetweetArticle, TweetArticle, TwitterArticle, TwitterArticleType} from '@/services/twitter'
import {getImageFormat, MediaFormat, MediaLoadStatus, MediaType, PlainMedia} from '@/data/articles'

export interface TwitterV1APIPayload extends TwitterLitePayload {
	statuses: TwitterV1Tweet[]
}

export type TwitterV1Tweet = {
	created_at : string
	id : number
	id_str : string
	text? : string
	full_text : string
	source : string
	truncated : boolean
	display_text_range: TwitterV1Indices
	in_reply_to_status_id : number
	in_reply_to_status_id_str : string
	in_reply_to_user_id : number
	in_reply_to_user_id_str : string
	in_reply_to_screen_name : string
	user : TwitterV1User
	coordinates : TwitterV1Coordinates
	place : TwitterV1Place
	quoted_status_id : undefined
	quoted_status_id_str : undefined
	is_quote_status : false
	quoted_status : undefined
	retweeted_status : undefined
	quote_count? : number
	reply_count : number
	retweet_count : number
	favorite_count : number
	entities : TwitterV1Entities
	extended_entities? : TwitterV1Entities
	geo : null
	contributors : null
	favorited : boolean
	retweeted : boolean
	possibly_sensitive? : boolean
	possibly_sensitive_appealable? : boolean
	lang : string
} | {
	created_at : string
	id : number
	id_str : string
	text? : string
	full_text : string
	source : string
	truncated : boolean
	display_text_range: TwitterV1Indices
	in_reply_to_status_id : number
	in_reply_to_status_id_str : string
	in_reply_to_user_id : number
	in_reply_to_user_id_str : string
	in_reply_to_screen_name : string
	user : TwitterV1User
	coordinates : TwitterV1Coordinates
	place : TwitterV1Place
	quoted_status_id : undefined
	quoted_status_id_str : undefined
	is_quote_status : false
	quoted_status : undefined
	retweeted_status : TwitterV1Tweet
	quote_count? : number
	reply_count : number
	retweet_count : number
	favorite_count : number
	entities : TwitterV1Entities
	extended_entities? : TwitterV1Entities
	geo : null
	contributors : null
	favorited : boolean
	retweeted : boolean
	possibly_sensitive? : boolean
	possibly_sensitive_appealable? : boolean
	lang : string
} | {
	created_at : string
	id : number
	id_str : string
	text? : string
	full_text : string
	source : string
	truncated : boolean
	display_text_range: TwitterV1Indices
	in_reply_to_status_id : number
	in_reply_to_status_id_str : string
	in_reply_to_user_id : number
	in_reply_to_user_id_str : string
	in_reply_to_screen_name : string
	user : TwitterV1User
	coordinates : TwitterV1Coordinates
	place : TwitterV1Place
	quoted_status_id : number
	quoted_status_id_str : string
	is_quote_status : true
	quoted_status : TwitterV1Tweet
	retweeted_status : undefined
	quote_count? : number
	reply_count : number
	retweet_count : number
	favorite_count : number
	entities : TwitterV1Entities
	extended_entities? : TwitterV1Entities
	geo : null
	contributors : null
	favorited : boolean
	retweeted : boolean
	possibly_sensitive? : boolean
	possibly_sensitive_appealable? : boolean
	lang : string
}

interface TwitterV1User {
	id : number
	id_str : string
	name : string
	screen_name : string
	location : string
	description : string
	url : string
	entities : {
		url : {
			urls : TwitterV1TweetURL[]
		}
		description : {
			urls : TwitterV1TweetURL[]
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

interface TwitterV1Coordinates {
	geo : {
		type : string
		coordinates : number[]
	}
	coordinates : {
		type : string
		coordinates : number[]
	}
	place : TwitterV1Place
}

interface TwitterV1Place {
	id : string
	url : string
	place_type : string
	name : string
	fulle_name : string
	country_code : string
	country : string
	bounding_box : {
		coordinates : number[][][]
		type : string
	}
	attributes : object
}

interface TwitterV1Entities {
	hashtags : TwitterV1Hashtag[]
	symbols : []
	user_mentions : TwitterV1UserMention[]
	urls : TwitterV1TweetURL[]
	media? : TwitterV1Media[]
}

interface TwitterV1Hashtag {
	indices : TwitterV1Indices
	text : string
}

interface TwitterV1Media {
	display_url : string
	expanded_url : string
	id : number
	id_str : string
	indices : TwitterV1Indices
	media_url : string
	media_url_https : string
	sizes : {
		thumb : TwitterV1MediaSize
		large : TwitterV1MediaSize
		medium : TwitterV1MediaSize
		small : TwitterV1MediaSize
	}
	source_status_id : number
	source_status_id_str : string
	type : 'photo' | 'video' | 'animated_gif'
	url : string
	source_user_id : number
	source_user_id_str : string
	video_info? : {
		aspect_ratio : number[]
		duration_millis? : number
		variants : {
			bitrate? : number
			content_type : string
			url : string
		}[]
	}
	additional_media_info? : {
		title : string
		description : string
		embeddable : boolean
		monetizable : boolean
	}
}

interface TwitterV1MediaSize {
	w : number
	h : number
	resize : string
}

interface TwitterV1TweetURL {
	display_url : string
	expanded_url : string
	indices : TwitterV1Indices
	url : string
}

interface TwitterV1UserMention {
	id : number
	id_str : string
	indices : TwitterV1Indices
	name : string
	screen_name : string
}

interface TwitterV1Symbol {
	indices : TwitterV1Indices
	text : string
}

interface TwitterV1Poll {
	options : {
		position : number
		text : string
	}[]
	end_datetime : string
	duration_minutes : string
}

type TwitterV1Indices = [number, number]

function parseText(tweet : TwitterV1Tweet) : string {
	let text = tweet.full_text ?? tweet.text

	if (tweet.extended_entities?.media) {
		if (text.endsWith(tweet.extended_entities.media[0].url))
			text = text.replace(tweet.extended_entities.media[0].url, '')
	}

	return text.trim()
}

function parseEntities(tweet : TwitterV1Tweet) {
	const media : PlainMedia[] = []

	if (tweet.extended_entities) {
		for (const entitiesMedia of (tweet.extended_entities.media ?? [])) {
			switch (entitiesMedia.type) {
				case 'photo':
					media.push({
						type: MediaType.Image,
						status: MediaLoadStatus.Plain,
						content: {
							url: entitiesMedia.media_url_https,
							size: {width: entitiesMedia.sizes.large.w, height: entitiesMedia.sizes.large.h},
							format: getImageFormat(entitiesMedia.media_url_https),
						}
					})
					break
				case 'video':
				case 'animated_gif':
					const variant = entitiesMedia.video_info?.variants.find(v => v.content_type === 'video/mp4')
					if (variant) {
						media.push({
							type: MediaType.Video,
							status: MediaLoadStatus.Plain,
							content: {
								url: variant.url,
								size: {width: entitiesMedia.sizes.large.w, height: entitiesMedia.sizes.large.h},
								format: MediaFormat.MP4,
							}
						})
					}
					break
			}
		}
	}else if (tweet.entities?.media) {
		const entitiesMedia = tweet.entities.media[0]
		media.push({
			type: MediaType.Image,
			status: MediaLoadStatus.Plain,
			content: {
				url: entitiesMedia.media_url_https,
				size: {width: entitiesMedia.sizes.large.w, height: entitiesMedia.sizes.large.h},
				format: getImageFormat(entitiesMedia.media_url_https),
			},
		})
	}

	return media
}

function parseUser(user: TwitterV1User) {
	return {
		id : user.id_str,
		name : user.name,
		handle : user.screen_name,
		avatarURL : user.profile_image_url_https,
	}
}

function parseTweet(tweet: TwitterV1Tweet) : TweetArticle {
	return {
		type: TwitterArticleType.Tweet,
		id: tweet.id_str,
		creationDate: new Date(tweet.created_at),
		text: parseText(tweet),
		author: parseUser(tweet.user),
		media: parseEntities(tweet),
		liked: tweet.favorited,
		likeCount: tweet.favorite_count,
		reposted: tweet.retweeted,
		repostCount: tweet.retweet_count,
		index: 0,
		hidden: false,
		queried: true
	}
}

function parseRetweet(tweet: TwitterV1Tweet) {
	const result : Payload<TwitterArticle> = {articles: [], newArticles: []}

	if (!tweet.retweeted_status)
		return result

	const retweetArticle : RetweetArticle = {
		type: TwitterArticleType.Retweet,
		id: tweet.id_str,
		retweetedId: tweet.retweeted_status?.id_str,
		creationDate: new Date(tweet.created_at),
		author: parseUser(tweet.user),
		index: 0,
		hidden: false,
		queried: true,
	}
	result.articles.push(retweetArticle)
	result.newArticles.push(retweetArticle.id)

	result.articles.push(...parseGenericTweet(tweet.retweeted_status).articles)

	return result
}

function parseQuote(tweet: TwitterV1Tweet) {
	const result : Payload<TwitterArticle> = {articles: [], newArticles: []}

	if (!tweet.quoted_status)
		return result

	const quoteArticle : QuoteArticle = {
		type: TwitterArticleType.Quote,
		id: tweet.id_str,
		quotedId: tweet.quoted_status_id_str,
		creationDate: new Date(tweet.created_at),
		text: parseText(tweet),
		author: parseUser(tweet.user),
		media: parseEntities(tweet),
		liked: tweet.favorited,
		likeCount: tweet.favorite_count,
		reposted: tweet.retweeted,
		repostCount: tweet.retweet_count,
		index: 0,
		hidden: false,
		queried: true,
	}
	result.articles.push(quoteArticle)
	result.newArticles.push(quoteArticle.id)

	result.articles.push(...parseGenericTweet(tweet.quoted_status).articles)

	return result
}

export function parseGenericTweet(tweet : TwitterV1Tweet) {
	const result : Payload<TwitterArticle> = {articles: [], newArticles: []}
	if (tweet.retweeted_status) {
		const {
			articles,
			newArticles,
		} = parseRetweet(tweet)
		result.articles.push(...articles)
		result.newArticles.push(...newArticles)
	}else if (tweet.is_quote_status) {
		const {
			articles,
			newArticles,
		} = parseQuote(tweet)
		result.articles.push(...articles)
		result.newArticles.push(...newArticles)
	}else {
		const article = parseTweet(tweet)
		result.articles.push(article)
		result.newArticles.push(article.id)
	}

	return result
}

export function parseResponse(response : TwitterV1APIPayload) {
	const payload : Payload<TwitterArticle> = {articles: [], newArticles: []}

	for (const tweet of response.statuses) {
		const {articles, newArticles} = parseGenericTweet(tweet)
		payload.articles.push(...articles)
		payload.newArticles.push(...newArticles)
	}

	return payload
}