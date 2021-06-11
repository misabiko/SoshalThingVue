import {Component, reactive} from 'vue'
import {Article} from '@/data/articles'
import {TimelineData} from '@/data/timelines'
import {PageInfo} from '@/hostpages/pageinfo'

export interface Payload<ArticleType = Article> {
	articles : ArticleType[],
	newArticles : string[]
}

export type ArticleCollection = { [id : string] : Article }

export interface LocalStorage {
	articles : ArticleCollection
}

export abstract class Service {
	static readonly instances : Service[] = []
	articles = reactive<ArticleCollection>({})
	endpoints : Endpoint<any, any>[] = []

	defaultSortMethod = 'Unsorted'
	sortMethods = {}

	protected constructor(
		public name : string,
		readonly articleComponent : Component,
	) {
	}

	initialTimelines(serviceIndex : number) : TimelineData[] {
		return []
	}

	async getNewArticles(endpoint : number | Endpoint<any, any>, options : object) {
		const actualEndpoint = endpoint instanceof Endpoint ? endpoint : this.endpoints[endpoint]
		const {articles, newArticles} = await actualEndpoint.call(options)

		for (const a of articles)
			this.updateArticle(a)

		await this.saveLocalStorage()
	}

	updateArticle(article : Article) {
		this.articles[article.id] = article
	}

	toggleHideArticle(id : string) {
		this.articles[id].hidden = !this.articles[id].hidden
		this.saveLocalStorage()
	}

	loadLocalStorage(storage : LocalStorage) : void {
		this.articles = storage.articles
	}

	async generateLocalStorage() : Promise<LocalStorage> {
		return {articles: this.articles}
	}

	static async initLocalStorage() {
		const rawStorage = localStorage.getItem('FavViewer')
		if (rawStorage) {
			const storage = JSON.parse(rawStorage)
			for (const serviceName in storage) {
				if (!storage.hasOwnProperty(serviceName))
					continue

				const serviceIndex = Service.instances.findIndex(service => service.name === serviceName)
				if (serviceIndex > -1)
					Service.instances[serviceIndex].loadLocalStorage(storage[serviceName])
			}
			return
		}

		console.log('Initializing local storage...')
		const storage : { [serviceName : string] : LocalStorage } = {}
		for (const service of Service.instances)
			storage[service.name] = await service.generateLocalStorage()
		localStorage.setItem('FavViewer', JSON.stringify(storage))
	}

	async saveLocalStorage() {
		console.log(`Saving local storage...`)

		const rawStorage = localStorage.getItem('FavViewer')
		if (!rawStorage)
			throw "Local storage isn't initialized"

		const storage = JSON.parse(rawStorage)
		storage[this.name] = await this.generateLocalStorage()
		localStorage.setItem('FavViewer', JSON.stringify(storage))
	}

	abstract getAPIArticleData(id: string): Promise<any>;

	abstract getExternalLink(id: string) : string
}

export interface HostPageService {
	pageInfo? : PageInfo
}

export abstract class Endpoint<InstanceOpt, CallOpt, InstanceInfo = { articles : string[] }> {
	instances : { [options : string] : InstanceInfo } = {}

	constructor(
		readonly name : string,
	) {}

	abstract call(options : CallOpt) : Promise<Payload>

	get ready() {
		return true
	}

	abstract optionsToInstance(options : InstanceOpt | CallOpt) : string

	abstract initOptions() : InstanceOpt

	abstract initInstance() : InstanceInfo
}

export interface PagedInstanceInfo {
	articles : string[],
	basePageNum : number,
	loadedPages : number[],
	lastPage : number
}

export type WrappedPayload = { payload : Payload, basePageNum : number, lastPage : number }

export abstract class PagedEndpoint<InstanceOpt = {},
	CallOpt extends { pageNum : number } = { pageNum : number },
	InstanceInfo extends PagedInstanceInfo = PagedInstanceInfo> extends Endpoint<InstanceOpt, CallOpt, InstanceInfo> {
	optionsToInstance(options : InstanceOpt | CallOpt) {
		const instanceOptions : { pageNum? : number } = {...options}
		delete instanceOptions.pageNum

		return JSON.stringify(instanceOptions)
	}

	updateInstance(options : CallOpt, wrappedPayload : WrappedPayload) {
		const key = this.optionsToInstance(options)
		const instance = this.instances[key]

		if (!instance)
			throw `Instance "${key}" isn't initiated`

		instance.articles.push(...wrappedPayload.payload.newArticles)
		instance.loadedPages.push(options.pageNum)
		instance.basePageNum = wrappedPayload.basePageNum
		instance.lastPage = wrappedPayload.lastPage
	}

	initInstance() : InstanceInfo {
		return {
			articles: reactive([]),
			loadedPages: [],
			basePageNum: 0,
			lastPage: 0,
		} as unknown as InstanceInfo
	}
}