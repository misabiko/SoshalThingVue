import {getImageFormat, LazyMedia, MediaLoadStatus, MediaType, PlainMedia} from '@/data/articles'
import {Endpoint, Payload} from '@/services'
import {RetweetArticle, TweetArticle, TwitterArticle, TwitterArticleType} from '@/services/twitter'

export interface TwitterAuth {
	id_str : string
	name : string
	screen_name : string
}

export interface TwitterLitePayload {
	_headers : {
		'x-rate-limit-limit' : string,
		'x-rate-limit-remaining' : string,
		'x-rate-limit-reset' : string,
	},
	soshalServices : { Twitter : { authUser? : TwitterAuth } }
}

export interface TwitterAPIPayload extends TwitterLitePayload {
	data : APITweetData[]
	includes : {
		users : APIUserData[]
		tweets : APITweetData[]
		media : APIMediaData[]
	}
	meta : {
		oldest_id : string
		newest_id : string
		result_count : number
		next_token : string
	}
}

interface APIUserData {
	username : string
	id : string
	profile_image_url : string
	name : string
}

interface APITweetData {
	id : string
	created_at : string
	text : string
	author_id : string
	entities? : APIEntities
	attachments? : {
		media_keys : string[]
	}
	public_metrics : {
		retweet_count : number
		reply_count : number
		like_count : number
		quote_count : number
	}
	referenced_tweets? : {
		type : 'retweeted' | 'quoted' | 'replied_to'
		id : string
	}[]
}

interface APIEntities {
	urls : {
		start : number
		end : number
		url : string
		expanded_url : string
		display_url : string
	}[]
}

type APIMediaData = {
	media_key : string
	type : 'photo'
	url : string
	width : number
	height : number
} | {
	media_key : string
	type : 'video'
	preview_image_url : string
	width : number
	height : number
}

function parseTweetText(rawText : string, entities? : APIEntities) {
	if (!entities)
		return rawText

	let copyText = rawText

	if (entities.urls)
		for (const url of entities.urls)
			copyText = copyText.replaceAll(url.url, '')

	return copyText.trim()
}

function parseTweet(tweet : APITweetData, author : APIUserData, mediaData : APIMediaData[]) : TweetArticle {
	const media : (PlainMedia | LazyMedia)[] = []
	for (const data of mediaData)
		switch (data.type) {
			case 'photo':
				media.push({
					type: MediaType.Image,
					status: MediaLoadStatus.Plain,
					content: {
						url: data.url,
						size: {width: data.width, height: data.height},
						format: getImageFormat(data.url),
					},
				})
				break
			case 'video':
				media.push({
					type: MediaType.Image,
					status: MediaLoadStatus.ThumbnailOnly,
					thumbnail: {
						url: data.preview_image_url,
						size: {width: data.width, height: data.height},
						format: getImageFormat(data.preview_image_url),
					},
				})
				break
		}

	return {
		type: TwitterArticleType.Tweet,
		id: tweet.id,
		creationDate: new Date(tweet.created_at),
		text: parseTweetText(tweet.text, tweet.entities),
		author: {
			id: author.id,
			handle: author.username,
			name: author.name,
			avatarURL: author.profile_image_url,
		},
		index: 0,
		media: media as PlainMedia[] | [LazyMedia],
		liked: false,
		likeCount: tweet.public_metrics.like_count,
		reposted: false,
		repostCount: tweet.public_metrics.retweet_count,
		read: false,
		hidden: false,
		queried: false,
	}
}

function parseRetweet(retweet : APITweetData, author : APIUserData, retweetedTweet : APITweetData, retweetedAuthor : APIUserData, retweetedMedia : APIMediaData[]) {
	const result : Payload<TwitterArticle> = {articles: [], newArticles: []}

	const retweetedArticle = parseTweet(retweetedTweet, retweetedAuthor, retweetedMedia)
	result.articles.push(retweetedArticle)

	const retweetArticle : RetweetArticle = {
		type: TwitterArticleType.Retweet,
		id: retweet.id,
		creationDate: new Date(retweet.created_at),
		retweetedId: retweetedTweet.id,
		author: {
			id: author.id,
			handle: author.username,
			name: author.name,
			avatarURL: author.profile_image_url,
		},
		index: 0,
		read: false,
		hidden: false,
		queried: false,
	}
	result.articles.push(retweetArticle)
	result.newArticles.push(retweet.id)

	return result
}

export function parseResponse(response : TwitterAPIPayload) {
	const payload : Payload<TwitterArticle> = {articles: [], newArticles: []}

	dataTweetLoop: for (const tweet of response.data) {
		const user = response.includes.users.find((u : APIUserData) => u.id === tweet.author_id)
		if (!user) {
			console.error(`Couldn't find user ${tweet.author_id} for article ${tweet.id}`)
			continue
		}

		if (tweet.referenced_tweets)
			for (const referencedTweet of tweet.referenced_tweets)
				switch (referencedTweet.type) {
					case 'retweeted':
						const retweetedTweet = response.includes.tweets.find((t : APITweetData) => t.id === referencedTweet.id)
						if (!retweetedTweet) {
							console.error(`Couldn't find retweeted article ${referencedTweet.id} for retweet ${tweet.id}`)
							continue dataTweetLoop
						}

						const retweetedTweetAuthor = response.includes.users.find((u : APIUserData) => u.id === retweetedTweet.author_id)
						if (!retweetedTweetAuthor) {
							console.error(`Couldn't find retweeted article author ${retweetedTweet.author_id} for retweet ${tweet.id}`)
							continue dataTweetLoop
						}

						const retweetedMedia = []
						if (retweetedTweet.attachments?.media_keys)
							for (const mediaKey of retweetedTweet.attachments.media_keys) {
								const media = response.includes.media.find(m => m.media_key === mediaKey)
								if (media)
									retweetedMedia.push(media)
							}

						const {
							articles,
							newArticles,
						} = parseRetweet(tweet, user, retweetedTweet, retweetedTweetAuthor, retweetedMedia)
						payload.articles.push(...articles)
						payload.newArticles.push(...newArticles)
						break
					default:
						console.warn(`Reference tweet type "${referencedTweet.type}"`)
				}
		else {
			const tweetMedia = []
			if (tweet.attachments?.media_keys)
				for (const mediaKey of tweet.attachments.media_keys) {
					const media = response.includes.media.find(m => m.media_key === mediaKey)
					if (media)
						tweetMedia.push(media)
				}

			const parsed = parseTweet(tweet, user, tweetMedia)
			payload.articles.push(parsed)
			payload.newArticles.push(parsed.id)
		}
	}

	return payload
}

export function parseRateLimits(endpoint : Endpoint<any>, response : TwitterLitePayload) {
	if (!endpoint.rateLimitInfo.value)
		return

	endpoint.rateLimitInfo.value.maxCalls = parseInt(response._headers['x-rate-limit-limit'])
	endpoint.rateLimitInfo.value.remainingCalls = parseInt(response._headers['x-rate-limit-remaining'])
	endpoint.rateLimitInfo.value.secUntilNextReset = parseInt(response._headers['x-rate-limit-reset'])
}