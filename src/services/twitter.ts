import {Endpoint, Payload, Service} from '@/services/index'
import {Article, getImageFormat, LazyMedia, MediaArticle, MediaLoadStatus, MediaType, PlainMedia} from '@/data/articles'
import TweetComponent from '@/components/Articles/TweetArticle.vue'
import TweetArticle from '@/components/Articles/TweetArticle.vue'
import {TimelineData} from '@/data/timelines'

export enum TwitterArticleType {
	Tweet,
	Retweet,
	Quote,
}

export interface TwitterUser {
	id : string
	name : string
	handle : string
	avatarURL : string
}

export interface TwitterArticle extends Article {
	type : TwitterArticleType
	creationDate : Date
	author : TwitterUser
}

export interface TweetArticle extends TwitterArticle, MediaArticle {
	type : TwitterArticleType.Tweet | TwitterArticleType.Quote
	text : string
	media : PlainMedia[] | [LazyMedia]
	liked : boolean
	reposted : boolean
	likeCount : number
	repostCount : number
}

export interface RetweetArticle extends TwitterArticle {
	type : TwitterArticleType.Retweet
	retweetedId : string
}

export interface QuoteArticle extends TweetArticle {
	type : TwitterArticleType.Quote
	quotedId : string
}

export class TwitterService extends Service<TwitterArticle> {
	constructor() {
		super('Twitter', TweetComponent, true)

		this.endpoints.push(new UserTimelineEndpoint())
	}

	initialTimelines(serviceIndex : number) : TimelineData[] {
		return [{
			title: 'Home',
			serviceIndex,
			endpointIndex: 0,
			container: 'ColumnContainer',
			defaults: {
				rtl: false,
			},
		}]
	}

	getAPIArticleData(id : string) : Promise<any> {
		return Promise.resolve(undefined)
	}

	getExternalLink(id : string) : string {
		const {id: tweetId, author} = this.articles[id]
		return `https://twitter.com/${author.handle}/status/${tweetId}`
	}

	getUserURL(handle : string) {
		return 'https://twitter.com/' + handle
	}
}

interface TwitterAPIPayload {
	data : APITweetData[]
	includes : {
		users : APIUserData[]
		tweets : APITweetData[]
		media: APIMediaData[]
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
		media_keys: string[]
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
		start: number
		end: number
		url: string
		expanded_url: string
		display_url: string
	}[]
}

type APIMediaData = {
	media_key: string
	type: 'photo'
	url: string
	width: number
	height: number
} | {
	media_key: string
	type: 'video'
	preview_image_url: string
	width: number
	height: number
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

function parseTweet(tweet : APITweetData, author : APIUserData, mediaData : APIMediaData[]): TweetArticle {
	const media: (PlainMedia | LazyMedia)[] = []
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
		hidden: false,
		queried: false,
	}
}

function parseRetweet(retweet : APITweetData, author : APIUserData, retweetedTweet : APITweetData, retweetedAuthor : APIUserData, retweetedMedia : APIMediaData[]) {
	const result : Payload<TwitterArticle> = {articles: [], newArticles: []}

	const retweetedArticle = parseTweet(retweetedTweet, retweetedAuthor, retweetedMedia)
	result.articles.push(retweetedArticle)

	result.articles.push(<RetweetArticle>{
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
		media: [],
		liked: false,
		likeCount: retweet.public_metrics.like_count,
		reposted: false,
		repostCount: retweet.public_metrics.retweet_count,
		hidden: false,
		queried: false,
	})
	result.newArticles.push(retweet.id)

	return result
}

interface UserTimelineInstanceOpt {
	userId : string
}

interface UserTimelineCallOpt extends UserTimelineInstanceOpt {

}

class UserTimelineEndpoint extends Endpoint<UserTimelineInstanceOpt, UserTimelineInstanceOpt> {
	constructor() {
		super('User Timeline')
	}

	async call(options : UserTimelineCallOpt) : Promise<Payload> {
		const payload : Payload<TwitterArticle> = {articles: [], newArticles: []}
		const params = new URLSearchParams()
		params.set('tweet.fields', 'created_at,public_metrics,referenced_tweets,entities,attachments')
		params.set('user.fields', 'name,username,profile_image_url')
		params.set('media.fields', 'width,height,preview_image_url,url')
		params.set('expansions', 'author_id,referenced_tweets.id,referenced_tweets.id.author_id,attachments.media_keys')

		const response : TwitterAPIPayload = await fetch(`/twitter/users/${options.userId}?${params.toString()}`).then(r => r.json())
		console.dir(response)

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
		}

		this.updateInstance(options, payload)

		return payload
	}

	updateInstance(options : UserTimelineCallOpt, payload : Payload) {
		const key = this.optionsToInstance(options)
		const instance = this.instances[key]

		if (!instance)
			throw `Instance "${key}" isn't initiated`

		for (const id of payload.newArticles)
			if (!instance.articles.includes(id))
				instance.articles.push(id)
	}

	optionsToInstance(options : UserTimelineInstanceOpt | UserTimelineCallOpt) : string {
		return JSON.stringify(options)
	}

	//TODO Enable to start without invalid options
	initOptions() : UserTimelineInstanceOpt {
		return {
			userId: '112543028',
		}
	}

	initInstance() : { articles : string[] } {
		return {
			articles: [],
		}
	}

}

interface HomeTimelineInstanceOpt {

}

interface HomeTimelineCallOpt extends HomeTimelineInstanceOpt {

}

class HomeTimelineEndpoint extends Endpoint<HomeTimelineInstanceOpt, HomeTimelineInstanceOpt> {
	constructor() {
		super('Home Timeline')
	}

	async call(options : HomeTimelineCallOpt) : Promise<Payload> {
		return {articles: [], newArticles: []}
	}

	optionsToInstance(options : HomeTimelineInstanceOpt | HomeTimelineCallOpt) : string {
		return JSON.stringify(options)
	}

	initOptions() : HomeTimelineInstanceOpt {
		return {}
	}

	initInstance() : { articles : string[] } {
		return {
			articles: [],
		}
	}
}