import {Endpoint, Payload, Service} from '@/services/index'
import {Article, getImageFormat, LazyMedia, MediaArticle, MediaLoadStatus, MediaType, PlainMedia} from '@/data/articles'
import TweetComponent from '@/components/Articles/TweetArticle.vue'
import TweetArticle from '@/components/Articles/TweetArticle.vue'
import {TimelineData} from '@/data/timelines'
import {Filters} from '@/composables/useFilters'
import {h} from 'vue'

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
	filters : Filters<TwitterArticle> = {
		Retweet: {
			filter: () => a => a.type !== TwitterArticleType.Retweet,
			defaultConfig: {
				enabled: true,
				config: {},
				option: () => null,
			},
		},
	}

	constructor() {
		super('Twitter', {
			[UserTimelineEndpoint.name]: {
				factory({userId} : { userId : string }) {
					return new UserTimelineEndpoint(userId)
				},
				optionComponent(props : any, {emit}: {emit: any}) {
					return h('div', {class: 'field'}, [
						h('label', {class: 'field-label'}, 'User Id'),
						h('div', {class: 'control'},
							h('input', {
								class: 'input',
								type: 'text',
								value: props.endpointOptions.userId,
								onInput: (e : InputEvent) => {
									props.endpointOptions.userId = (e.target as HTMLInputElement).value
									emit('changeOptions', props.endpointOptions)
								},
							}),
						),
					])
				},
			},
			[SearchEndpoint.name]: {
				factory({query} : { query : string }) {
					return new SearchEndpoint(query)
				},
				optionComponent(props : any, {emit}: {emit: any}) {
					return h('div', {class: 'field'}, [
						h('label', {class: 'field-label'}, 'Query'),
						h('div', {class: 'control'},
							h('input', {
								class: 'input',
								type: 'text',
								value: props.endpointOptions.query,
								onInput: (e : InputEvent) => {
									props.endpointOptions.query = (e.target as HTMLInputElement).value
									emit('changeOptions', props.endpointOptions)
								},
							}),
						),
					])
				},
			},
		}, TweetComponent, true)

		//this.endpoints.push(new SearchEndpoint('-is:retweet #深夜の真剣お絵描き60分一本勝負 OR -is:retweet #東方の90分お絵描き OR -is:retweet #東方ワンドロバトル'))
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

function parseResponse(response : TwitterAPIPayload) {
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

interface UserTimelineCallOpt {

}

class UserTimelineEndpoint extends Endpoint<UserTimelineCallOpt> {
	constructor(readonly userId : string) {
		super('User Timeline ' + userId)
	}

	async call(options : UserTimelineCallOpt) : Promise<Payload> {
		const params = new URLSearchParams()
		params.set('tweet.fields', 'created_at,public_metrics,referenced_tweets,entities,attachments')
		params.set('user.fields', 'name,username,profile_image_url')
		params.set('media.fields', 'width,height,preview_image_url,url')
		params.set('expansions', 'author_id,referenced_tweets.id,referenced_tweets.id.author_id,attachments.media_keys')

		const response : TwitterAPIPayload = await fetch(`/twitter/users/${this.userId}?${params.toString()}`).then(r => r.json())
		console.dir(response)

		const payload = parseResponse(response)

		this.updateInstance(options, payload)

		return payload
	}

	updateInstance(options : UserTimelineCallOpt, payload : Payload) {
		for (const id of payload.newArticles)
			if (!this.articles.includes(id))
				this.articles.push(id)
	}

	getKeyOptions() {
		return {
			endpointType: this.constructor.name,
			userId: this.userId,
		}
	}
}

interface HomeTimelineCallOpt {}

class HomeTimelineEndpoint extends Endpoint<HomeTimelineCallOpt> {
	constructor() {
		super('Home Timeline')
	}

	async call(options : HomeTimelineCallOpt) : Promise<Payload> {
		return {articles: [], newArticles: []}
	}

	getKeyOptions() {
		return {endpointType: this.constructor.name}
	}
}

interface SearchCallOpt {

}

class SearchEndpoint extends Endpoint<SearchCallOpt> {
	constructor(readonly query : string) {
		super('Search ' + query)
	}

	async call(options : SearchCallOpt) : Promise<Payload> {
		const params = new URLSearchParams()
		params.set('query', this.query)
		params.set('max_results', '100')
		params.set('tweet.fields', 'created_at,public_metrics,referenced_tweets,entities,attachments')
		params.set('user.fields', 'name,username,profile_image_url')
		params.set('media.fields', 'width,height,preview_image_url,url')
		params.set('expansions', 'author_id,referenced_tweets.id,referenced_tweets.id.author_id,attachments.media_keys')

		const response : TwitterAPIPayload = await fetch(`/twitter/search?${params.toString()}`)
			.then(r => r.json())
			.catch(e => console.error('Failed to parse search response', e))
		console.dir(response)

		const payload = parseResponse(response)

		this.updateInstance(options, payload)

		return payload
	}

	updateInstance(options : SearchCallOpt, payload : Payload) {
		for (const id of payload.newArticles)
			if (!this.articles.includes(id))
				this.articles.push(id)
	}

	getKeyOptions() {
		return {
			endpointType: this.constructor.name,
			query: this.query,
		}
	}
}