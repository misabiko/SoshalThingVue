import {Service} from '@/services/index'
import {Article} from '@/articles'

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
		super('Twitter');
	}
}