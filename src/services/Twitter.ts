import {Endpoint, Payload, Service, WrappedPayload} from '@/services/index'
import {Article, MediaLoadStatus} from '@/data/articles'
import TweetArticle from '@/components/Articles/TweetArticle.vue'
import {TimelineData} from '@/data/timelines'

export interface TwitterArticle extends Article {
	content : string
	authorName : string
	authorHandle : string
	authorAvatar : string
	liked : boolean
	reposted : boolean
	likeCount : number
	repostCount : number
}

export class TwitterService extends Service {
	articles! : { [id : string] : TwitterArticle }

	constructor() {
		super('Twitter', TweetArticle)

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
		return ''
	}

	getUserURL(handle : string) {
		return 'https://twitter.com/' + handle
	}
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
		params.set('tweet.fields', 'created_at,public_metrics,entities')
		params.set('expansions', 'author_id')
		params.set('user.fields', 'name,username,profile_image_url')

		const response = await fetch(`/twitter/users/${options.userId}?${params.toString()}`).then(r => r.json())
		console.dir(response)

		for (const tweet of response.data) {
			const user = response.includes.users.find((u : any) => u.id === tweet.author_id)

			payload.articles.push({
				id: tweet.id,
				content: tweet.text,
				index: 0,
				media: {
					status: MediaLoadStatus.NothingLoaded,
				},
				liked: false,
				likeCount: tweet.public_metrics.like_count,
				reposted: false,
				repostCount: tweet.public_metrics.retweet_count,
				authorAvatar: user.profile_image_url,
				authorHandle: user.username,
				authorName: user.name,
				hidden: false,
				queried: false,
			})
			payload.newArticles.push(tweet.id)
		}

		this.updateInstance(options, payload)

		return payload
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