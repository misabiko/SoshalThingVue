import {Endpoint, Payload, Service} from '@/services/index'
import {Article, MediaLoadStatus} from '@/data/articles'
import TweetComponent from '@/components/Articles/TweetArticle.vue'
import {TimelineData} from '@/data/timelines'
import TweetArticle from '@/components/Articles/TweetArticle.vue'

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

export interface TweetArticle extends TwitterArticle {
	type : TwitterArticleType.Tweet | TwitterArticleType.Quote
	text : string
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

export class TwitterService extends Service {
	articles! : { [id : string] : TwitterArticle }

	constructor() {
		super('Twitter', TweetComponent)

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
	data : APIPayloadTweetData[]
	includes : {
		users: APIUserData[]
		tweets: APITweetData[]
	}
	meta : {
		oldest_id: string
		newest_id: string
		result_count: number
		next_token: string
	}
}

interface APIUserData {
	username: string
	id: string
	profile_image_url: string
	name: string
}

interface APITweetData {
	id : string
	created_at: string
	text : string
	author_id : string
	public_metrics: {
		retweet_count: number
		reply_count: number
		like_count: number
		quote_count: number
	}
}

interface APIPayloadTweetData extends APITweetData {
	referenced_tweets: {
		type: "retweeted"
		id : string
	}[]
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
		params.set('tweet.fields', 'created_at,public_metrics,entities,referenced_tweets')
		params.set('expansions', 'author_id,referenced_tweets.id,referenced_tweets.id.author_id')
		params.set('user.fields', 'name,username,profile_image_url')

		const response : TwitterAPIPayload = await fetch(`/twitter/users/${options.userId}?${params.toString()}`).then(r => r.json())
		console.dir(response)

		dataTweetLoop: for (const tweet of response.data) {
			const user = response.includes.users.find((u : APIUserData) => u.id === tweet.author_id)
			if (!user) {
				console.error(`Couldn't find user ${tweet.author_id} for article ${tweet.id}`)
				continue
			}

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

						const {articles, newArticles} = this.parseRetweet(tweet, user, retweetedTweet, retweetedTweetAuthor)
						payload.articles.push(...articles)
						payload.newArticles.push(...newArticles)
						break;
					default:
						console.warn(`Reference tweet type "${referencedTweet.type}"`)
				}
		}

		this.updateInstance(options, payload)

		return payload
	}

	parseRetweet(retweet : APIPayloadTweetData, author : APIUserData, retweetedTweet : APITweetData, retweetedAuthor : APIUserData) {
		const result : Payload<TwitterArticle> = {articles: [], newArticles: []}

		result.articles.push(<TweetArticle>{
			type: TwitterArticleType.Tweet,
			id: retweetedTweet.id,
			creationDate: new Date(retweetedTweet.created_at),
			text: retweetedTweet.text,
			author: {
				id: retweetedAuthor.id,
				handle: retweetedAuthor.username,
				name: retweetedAuthor.name,
				avatarURL: retweetedAuthor.profile_image_url,
			},
			index: 0,
			media: {
				status: MediaLoadStatus.NothingLoaded,
			},
			liked: false,
			likeCount: retweetedTweet.public_metrics.like_count,
			reposted: false,
			repostCount: retweetedTweet.public_metrics.retweet_count,
			hidden: false,
			queried: false,
		})

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
			media: {
				status: MediaLoadStatus.NothingLoaded,
			},
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

	updateInstance(options : UserTimelineCallOpt, payload : Payload) {
		const key = this.optionsToInstance(options)
		const instance = this.instances[key]

		if (!instance)
			throw `Instance "${key}" isn't initiated`

		instance.articles.push(...payload.newArticles)
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