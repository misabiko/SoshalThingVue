import {Endpoint, Payload, Service} from '@/services/index'
import {Article} from '@/data/articles'
import TweetArticle from '@/components/TweetArticle.vue'
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
	constructor() {
		super('Twitter', TweetArticle)

		this.endpoints.push(new HomeTimelineEndpoint())
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