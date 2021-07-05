import {Endpoint, Payload, Service} from '@/services/index'
import {Article, LazyMedia, MediaArticle, PlainMedia} from '@/data/articles'
import TweetComponent from '@/components/Articles/TweetArticle.vue'
import TweetArticle from '@/components/Articles/TweetArticle.vue'
import {Filters} from '@/composables/useFilters'
import {h, reactive} from 'vue'
import {parseRateLimits, parseResponse, TwitterAPIPayload} from '@/data/TwitterV2'
import {TwitterV1APIPayload, parseResponse as parseV1Response} from '@/data/TwitterV1'

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
			[UserTimelineV1Endpoint.name]: {
				factory({userId} : { userId : string }) {
					return new UserTimelineV1Endpoint(userId)
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
			[HomeTimelineEndpoint.name]: {
				factory() {
					return new HomeTimelineEndpoint()
				},
				optionComponent() {
					return null
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

interface UserTimelineCallOpt {

}

class UserTimelineEndpoint extends Endpoint<UserTimelineCallOpt> {
	rateLimitInfo = reactive({
		maxCalls: 900,
		remainingCalls: 1,
		secUntilNextReset: Date.now() / 1000 + 15 * 60,
	})

	constructor(readonly userId : string) {
		super('User Timeline ' + userId)
	}

	get ready() : boolean {
		return super.ready && !!this.rateLimitInfo.remainingCalls
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

		this.rateLimitInfo.remainingCalls--
		parseRateLimits(this, response)

		for (const id of payload.newArticles)
			if (!this.articles.includes(id))
				this.articles.push(id)

		return payload
	}

	getKeyOptions() {
		return {
			endpointType: this.constructor.name,
			userId: this.userId,
		}
	}
}

interface UserTimelineV1CallOpt {

}

class UserTimelineV1Endpoint extends Endpoint<UserTimelineCallOpt> {
	rateLimitInfo = reactive({
		maxCalls: 900,
		remainingCalls: 1,
		secUntilNextReset: Date.now() / 1000 + 15 * 60,
	})

	constructor(readonly userId : string) {
		super('User Timeline V1 ' + userId)
	}

	get ready() : boolean {
		return super.ready && !!this.rateLimitInfo.remainingCalls
	}

	async call(options : UserTimelineCallOpt) : Promise<Payload> {
		const params = new URLSearchParams()
		params.set('tweet_mode', 'extended')
		params.set('user_id', this.userId)

		const response : TwitterV1APIPayload = await fetch(`/twitter/v1/statuses/user_timeline?${params.toString()}`).then(r => r.json())
		console.dir(response)

		this.rateLimitInfo.remainingCalls--
		parseRateLimits(this, response)

		const payload = parseV1Response(response)

		for (const id of payload.newArticles)
			if (!this.articles.includes(id))
				this.articles.push(id)

		return payload
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
	rateLimitInfo = reactive({
		maxCalls: 15,
		remainingCalls: 1,
		secUntilNextReset: Date.now() / 1000 + 15 * 60,
	})

	constructor() {
		super('Home Timeline')
	}

	get ready() : boolean {
		return super.ready && !!this.rateLimitInfo.remainingCalls
	}

	async call(options : UserTimelineCallOpt) : Promise<Payload> {
		const params = new URLSearchParams()
		params.set('tweet_mode', 'extended')

		const response : TwitterV1APIPayload = await fetch(`/twitter/v1/statuses/home_timeline?${params.toString()}`).then(r => r.json())
		console.dir(response)

		this.rateLimitInfo.remainingCalls--
		parseRateLimits(this, response)

		const payload = parseV1Response(response)

		for (const id of payload.newArticles)
			if (!this.articles.includes(id))
				this.articles.push(id)

		return payload
	}

	getKeyOptions() {
		return {endpointType: this.constructor.name}
	}
}

interface SearchCallOpt {

}

class SearchEndpoint extends Endpoint<SearchCallOpt> {
	rateLimitInfo = reactive({
		maxCalls: 180,
		remainingCalls: 1,
		secUntilNextReset: Date.now() / 1000 + 15 * 60,
	})

	constructor(readonly query : string) {
		super('Search ' + query)
	}

	get ready() : boolean {
		return super.ready && !!this.rateLimitInfo.remainingCalls
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

		this.rateLimitInfo.remainingCalls--
		parseRateLimits(this, response)

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