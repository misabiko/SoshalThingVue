import {Endpoint, Payload, Service} from '@/services/index'
import {Article, LazyMedia, MediaArticle, PlainMedia} from '@/data/articles'
import TweetComponent from '@/components/Articles/TweetArticle.vue'
import TweetArticle from '@/components/Articles/TweetArticle.vue'
import {Filters} from '@/composables/useFilters'
import {h, reactive, toRaw} from 'vue'
import {parseRateLimits, parseResponse, TwitterAPIPayload, TwitterAuth} from '@/data/TwitterV2'
import {
	TwitterV1APIPayload,
	parseResponse as parseV1Response,
	parseGenericTweet,
	TwitterV1Tweet,
} from '@/data/TwitterV1'
import {SortMethods} from '@/composables/useSortMethods'

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
	authUser? : TwitterAuth

	sortMethods : SortMethods<TwitterArticle> = {
		RefId: (articles) => articles.sort(
			(a, b) => parseInt(this.actualTweet(b, true).id) - parseInt(this.actualTweet(a, true).id),
		),
		Likes: (articles) => articles.sort(
			(a, b) => (this.actualTweet(b, true).likeCount ?? 0) - (this.actualTweet(a, true).likeCount ?? 0)),
		Retweets: (articles) => articles.sort(
			(a, b) => (this.actualTweet(b, true).repostCount ?? 0) - (this.actualTweet(a, true).repostCount ?? 0),
		),
	}

	filters : Filters<TwitterArticle> = {
		Retweet: {
			filter: (inverted) => a => a.type === TwitterArticleType.Retweet != inverted,
			option: () => null,
			defaultConfig: {
				enabled: true,
				inverted: true,
				config: {},
			},
		},
		HasMedia: {
			filter: (inverted) => a => {
				return (!!(a as unknown as MediaArticle).media?.length || !!(this.actualTweet(a) as unknown as MediaArticle)?.media?.length) != inverted
			},
			option: () => null,
			defaultConfig: {
				enabled: true,
				inverted: false,
				config: {},
			},
		},
		Liked: {
			filter: (inverted) => a => (a.type !== TwitterArticleType.Retweet && (a as TweetArticle).liked) != inverted,
			option: () => null,
			defaultConfig: {
				enabled: true,
				inverted: false,
				config: {},
			},
		},
		Retweeted: {
			filter: (inverted) => a => (a.type !== TwitterArticleType.Retweet && (a as TweetArticle).reposted) != inverted,
			option: () => null,
			defaultConfig: {
				enabled: true,
				inverted: false,
				config: {},
			},
		},
	}

	constructor() {
		super('Twitter', {
			[UserTimelineEndpoint.name]: {
				name: 'User Timeline V2 Endpoint',
				factory({userId} : { userId : string }) {
					return new UserTimelineEndpoint(userId)
				},
				optionComponent(props : any, {emit} : { emit : any }) {
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
				name: 'User Timeline V1 Endpoint',
				factory({userId} : { userId : string }) {
					return new UserTimelineV1Endpoint(userId)
				},
				optionComponent(props : any, {emit} : { emit : any }) {
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
				name: 'Home Timeline V1 Endpoint',
				factory() {
					return new HomeTimelineEndpoint()
				},
				optionComponent() {
					return null
				},
			},
			[SearchEndpoint.name]: {
				name: 'Search V2 Endpoint',
				factory({query} : { query : string }) {
					return new SearchEndpoint(query)
				},
				optionComponent(props : any, {emit} : { emit : any }) {
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
			[LikesV1Endpoint.name]: {
				name: 'Likes V1 Endpoint',
				factory(opts : { userId? : string, handle? : string }) {
					return new LikesV1Endpoint(opts)
				},
				optionComponent(props : any, {emit} : { emit : any }) {
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
						h('label', {class: 'field-label'}, 'Handle'),
						h('div', {class: 'control'},
							h('input', {
								class: 'input',
								type: 'text',
								value: props.endpointOptions.handle,
								onInput: (e : InputEvent) => {
									props.endpointOptions.handle = (e.target as HTMLInputElement).value
									emit('changeOptions', props.endpointOptions)
								},
							}),
						),
					])
				},
			},
			[ListV1Endpoint.name]: {
				name: 'List V1 Endpoint',
				factory(opts : { listId? : string, slug? : string, ownerId? : string, ownerHandle? : string }) {
					return new ListV1Endpoint(opts)
				},
				optionComponent(props : any, {emit} : { emit : any }) {
					return h('div', {class: 'field'},
						[['List Id', 'listId'], ['Slug', 'slug'], ['Owner Id', 'ownerId'], ['Owner Handle', 'ownerHandle']]
							.flatMap(([label, field]) => [
								h('label', {class: 'field-label'}, label),
								h('div', {class: 'control'},
									h('input', {
										class: 'input',
										type: 'text',
										value: props.endpointOptions[field],
										onInput: (e : InputEvent) => {
											props.endpointOptions[field] = (e.target as HTMLInputElement).value
											emit('changeOptions', props.endpointOptions)
										},
									}),
								)]),
					)
				},
			},
		}, TweetComponent, true)
	}

	getAPIArticleData(id : string) : Promise<any> {
		return Promise.resolve(undefined)
	}

	getExternalLink(id : string) : string {
		const {id: tweetId, author} = this.articles.value[id]
		return `https://twitter.com/${author.handle}/status/${tweetId}`
	}

	getUserURL(handle : string) {
		return 'https://twitter.com/' + handle
	}

	async like(id : string) {
		const article = this.articles.value[id]
		if (!article || article.type == TwitterArticleType.Retweet)
			return

		const params = new URLSearchParams()
		params.set('id', id)
		params.set('tweet_mode', 'extended')

		const response = await Service.fetchProxy(`/twitter/v1/favorites/${(article as TweetArticle).liked ? 'destroy' : 'create'}?${params.toString()}`, {method: 'POST'})

		if (response.statuses) {
			const payload = parseV1Response(response)

			for (const a of payload.articles)
				this.updateArticle(a)
		}else if (response.errors?.find((e : { code : number }) => e.code == 139))	//tweet already liked
			(this.articles.value[id] as TweetArticle).liked = true
	}

	async retweet(id : string) {
		const article = this.articles.value[id]
		if (!article || article.type == TwitterArticleType.Retweet || (article as TweetArticle).reposted)
			return

		const params = new URLSearchParams()
		params.set('id', id)
		params.set('tweet_mode', 'extended')

		const response = await Service.fetchProxy(`/twitter/retweet?${params.toString()}`, {method: 'POST'})

		if ((response as TwitterV1Tweet).id_str) {
			const payload = parseGenericTweet(response)

			for (const a of payload.articles)
				this.updateArticle(a)
		}else if (response.errors?.find((e : { code : number }) => e.code == 327))	//tweet already retweeted
			(this.articles.value[id] as TweetArticle).reposted = true
	}

	logArticle(id : string) {
		const article = this.articles.value[id]
		switch (article.type) {
			case TwitterArticleType.Tweet:
				return super.logArticle(id)
			case TwitterArticleType.Retweet:
				return console.dir({
					article: toRaw(article),
					actualArticle: toRaw(this.articles.value[(article as RetweetArticle).retweetedId]),
				})
			case TwitterArticleType.Quote:
				return console.dir({
					article: toRaw(article),
					actualArticle: toRaw(this.articles.value[(article as QuoteArticle).quotedId]),
				})
		}
	}

	actualTweet(a : string | TwitterArticle, includeQuote = false) : TweetArticle {
		const article = (typeof a === 'object') ? a : this.articles.value[a]
		switch (article.type) {
			case TwitterArticleType.Tweet:
				return article as TweetArticle
			case TwitterArticleType.Retweet:
				return (this.articles.value)[(article as RetweetArticle).retweetedId] as TweetArticle
			case TwitterArticleType.Quote:
				if (includeQuote)
					return article as TweetArticle
				else
					return (this.articles.value)[(article as QuoteArticle).quotedId] as TweetArticle
		}
	}

	optionComponent = () => {
		if (this.authUser)
			return [['Name', this.authUser.screen_name], ['Handle', this.authUser.name], ['Id', this.authUser.id_str]]
				.map(([label, value]) =>
					h('div', {class: 'field is-horizontal'}, [
						h('div', {class: 'field-label is-normal'},
							h('label', {class: 'label'}, label),
						),
						h('div', {class: 'field-body'},
							h('div', {class: 'field'},
								h('p', {class: 'control'},
									h('input', {
										class: 'input is-static',
										readonly: true,
										value,
									}),
								),
							),
						),
					]),
				)
		else
			return h('div', {class: 'level'}, [
				h('div', {class: 'level-left'}),
				h('div', {class: 'level-right'},
					h('a', {
						class: 'button level-item',
						href: '/twitter/login',
					}, 'Login'),
				),
			])
	}

	loadStatus(status : any) {
		this.authUser = status.authUser
	}

	async fetchV1Status(id : string) {
		const params = new URLSearchParams()
		params.set('id', id)
		params.set('tweet_mode', 'extended')

		const response = await Service.fetchProxy(`/twitter/v1/statuses/show?${params.toString()}`)

		const payload = parseV1Response(response)

		for (const a of payload.articles)
			this.updateArticle(a)

		return response
	}
}

interface TwitterCallOpt {
	fromEnd : boolean
}

class UserTimelineEndpoint extends Endpoint<TwitterCallOpt> {
	rateLimitInfo = reactive({
		maxCalls: 900,
		remainingCalls: 900,
		secUntilNextReset: Date.now() / 1000 + 15 * 60,
	})

	constructor(readonly userId : string) {
		super('User Timeline ' + userId)
	}

	async call(options : TwitterCallOpt) : Promise<Payload> {
		const params = new URLSearchParams()
		params.set('tweet.fields', 'created_at,public_metrics,referenced_tweets,entities,attachments')
		params.set('user.fields', 'name,username,profile_image_url')
		params.set('media.fields', 'width,height,preview_image_url,url')
		params.set('expansions', 'author_id,referenced_tweets.id,referenced_tweets.id.author_id,attachments.media_keys')
		params.set('max_results', '100')
		if (options.fromEnd && this.articles.length)
			params.set('until_id', this.articles[this.articles.length - 1])

		const response : TwitterAPIPayload = await Service.fetchProxy(`/twitter/users/${this.userId}?${params.toString()}`)

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

export class UserTimelineV1Endpoint extends Endpoint<TwitterCallOpt> {
	rateLimitInfo = reactive({
		maxCalls: 900,
		remainingCalls: 900,
		secUntilNextReset: Date.now() / 1000 + 15 * 60,
	})

	constructor(readonly userId : string) {
		super('User Timeline V1 ' + userId)
	}

	async call(options : TwitterCallOpt) : Promise<Payload> {
		const params = new URLSearchParams()
		params.set('tweet_mode', 'extended')
		params.set('user_id', this.userId)
		params.set('count', '200')
		if (options.fromEnd && this.articles.length)
			params.set('max_id', this.articles[this.articles.length - 1])

		const response : TwitterV1APIPayload = await Service.fetchProxy(`/twitter/v1/statuses/user_timeline?${params.toString()}`)

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

class HomeTimelineEndpoint extends Endpoint<TwitterCallOpt> {
	rateLimitInfo = reactive({
		maxCalls: 15,
		remainingCalls: 15,
		secUntilNextReset: Date.now() / 1000 + 15 * 60,
	})

	constructor() {
		super('Home Timeline')
	}

	async call(options : TwitterCallOpt) : Promise<Payload> {
		const params = new URLSearchParams()
		params.set('count', '200')
		params.set('tweet_mode', 'extended')
		if (options.fromEnd && this.articles.length)
			params.set('max_id', this.articles[this.articles.length - 1])

		const response : TwitterV1APIPayload = await Service.fetchProxy(`/twitter/v1/statuses/home_timeline?${params.toString()}`)

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

class SearchEndpoint extends Endpoint<TwitterCallOpt> {
	rateLimitInfo = reactive({
		maxCalls: 180,
		remainingCalls: 180,
		secUntilNextReset: Date.now() / 1000 + 15 * 60,
	})

	constructor(readonly query : string) {
		super('Search ' + query)
	}

	async call(options : TwitterCallOpt) : Promise<Payload> {
		const params = new URLSearchParams()
		params.set('query', this.query)
		params.set('max_results', '100')
		params.set('tweet.fields', 'created_at,public_metrics,referenced_tweets,entities,attachments')
		params.set('user.fields', 'name,username,profile_image_url')
		params.set('media.fields', 'width,height,preview_image_url,url')
		params.set('expansions', 'author_id,referenced_tweets.id,referenced_tweets.id.author_id,attachments.media_keys')
		if (options.fromEnd && this.articles.length)
			params.set('until_id', this.articles[this.articles.length - 1])

		const response : TwitterAPIPayload = await Service.fetchProxy(`/twitter/search?${params.toString()}`)
			.catch(e => console.error('Failed to parse search response', e))

		this.rateLimitInfo.remainingCalls--
		parseRateLimits(this, response)

		const payload = parseResponse(response)

		for (const id of payload.newArticles)
			if (!this.articles.includes(id))
				this.articles.push(id)

		return payload
	}

	getKeyOptions() {
		return {
			endpointType: this.constructor.name,
			query: this.query,
		}
	}
}

class SearchV1Endpoint extends Endpoint<TwitterCallOpt> {
	rateLimitInfo = reactive({
		maxCalls: 180,
		remainingCalls: 180,
		secUntilNextReset: Date.now() / 1000 + 15 * 60,
	})

	constructor(readonly query : string) {
		super('Search V1 ' + query)
	}

	async call(options : TwitterCallOpt) : Promise<Payload> {
		const params = new URLSearchParams()
		params.set('tweet_mode', 'extended')
		params.set('result_type', 'recent')
		params.set('q', this.query)

		params.set('count', '100')
		if (options.fromEnd && this.articles.length)
			params.set('max_id', this.articles[this.articles.length - 1])

		const response : TwitterV1APIPayload = await Service.fetchProxy(`/twitter/v1/search/tweets?${params.toString()}`)

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
			query: this.query,
		}
	}
}

class LikesV1Endpoint extends Endpoint<TwitterCallOpt> {
	readonly userId? : string
	readonly handle? : string

	rateLimitInfo = reactive({
		maxCalls: 75,
		remainingCalls: 75,
		secUntilNextReset: Date.now() / 1000 + 15 * 60,
	})

	constructor({userId, handle} : { userId? : string, handle? : string }) {
		super('Likes ' + (handle || userId))

		this.userId = userId
		this.handle = handle
	}

	async call(options : TwitterCallOpt) : Promise<Payload> {
		const params = new URLSearchParams()
		params.set('tweet_mode', 'extended')
		if (this.handle)
			params.set('screen_name', this.handle)
		else if (this.userId)
			params.set('user_id', this.userId)
		params.set('count', '200')
		if (options.fromEnd && this.articles.length)
			params.set('max_id', this.articles[this.articles.length - 1])

		const response : TwitterV1APIPayload = await Service.fetchProxy(`/twitter/v1/statuses/user_timeline?${params.toString()}`)

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
			handle: this.handle,
		}
	}
}

interface ListCallOpt extends TwitterCallOpt {
	includeRetweets? : boolean
}

class ListV1Endpoint extends Endpoint<ListCallOpt> {
	readonly listId? : string
	readonly slug? : string
	readonly ownerId? : string
	readonly ownerHandle? : string

	rateLimitInfo = reactive({
		maxCalls: 900,
		remainingCalls: 900,
		secUntilNextReset: Date.now() / 1000 + 15 * 60,
	})

	constructor({
					listId,
					slug,
					ownerId,
					ownerHandle,
				} : { listId? : string, slug? : string, ownerId? : string, ownerHandle? : string }) {
		super('List ' + (listId || slug))

		this.listId = listId
		this.slug = slug
		this.ownerId = ownerId
		this.ownerHandle = ownerHandle
	}

	async call(options : ListCallOpt) : Promise<Payload> {
		const params = new URLSearchParams()
		params.set('tweet_mode', 'extended')
		if (this.listId)
			params.set('list_id', this.listId)
		else if (this.slug) {
			params.set('slug', this.slug)

			if (this.ownerId)
				params.set('owner_id', this.ownerId)
			else if (this.ownerHandle)
				params.set('owner_screen_name', this.ownerHandle)
		}
		params.set('count', '200')
		params.set('include_rts', options.includeRetweets ? 'true' : 'false')
		if (options.fromEnd && this.articles.length)
			params.set('max_id', this.articles[this.articles.length - 1])

		const response : TwitterV1APIPayload = await Service.fetchProxy(`/twitter/v1/lists/statuses?${params.toString()}`)

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
			listId: this.listId,
			slug: this.slug,
			ownerId: this.ownerId,
			ownerHandle: this.ownerHandle,
		}
	}
}