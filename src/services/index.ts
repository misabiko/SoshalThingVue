import {reactive} from 'vue'
import {Article} from '@/articles'

export interface Payload<ArticleType = Article> {
	articles : ArticleType[],
	newArticles : string[]
}

type ArticleCollection = { [id : string] : Article }

export abstract class Service {
	static readonly instances : Service[] = []
	articles = reactive<ArticleCollection>({})
	protected endpoints : Endpoint[] = []

	protected constructor(public name : string) {}

	async getNewArticles(endpointIndex : number, options : object) : Promise<string[]> {
		const {articles, newArticles} = await this.endpoints[endpointIndex].call(options)

		for (const a of articles)
			this.updateArticle(a)

		return newArticles
	}

	updateArticle(article: Article) {
		this.articles[article.id] = article
	}

	toggleHideArticle(id: string) {
		this.articles[id].hidden = !this.articles[id].hidden
	}
}

export interface Endpoint {
	name : string
	call : (options : any) => Promise<Payload>
	ready : boolean
}