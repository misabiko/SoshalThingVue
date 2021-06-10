import {Service} from '@/services/index'
import {Article} from '@/data/articles'
import TweetArticle from '@/components/TweetArticle.vue'

export interface TwitterArticle extends Article {
	content: string
	authorName: string
	authorHandle: string
	authorAvatar: string
	liked: boolean
	reposted: boolean
	likeCount: number
	repostCount: number
}

export class TwitterService extends Service {
	constructor() {
		super('Twitter', TweetArticle);
	}

	getAPIArticleData(id : string) : Promise<any> {
		return Promise.resolve(undefined);
	}

	getExternalLink(id : string) : string {
		return '';
	}
}