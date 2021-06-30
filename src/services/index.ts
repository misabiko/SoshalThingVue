import {Component, markRaw, reactive, ref} from 'vue'
import {Article, MediaArticle} from '@/data/articles'
import {TimelineData} from '@/data/timelines'
import {PageInfo} from '@/hostpages/pageinfo'
import {defaultDefaultFilters, FilterConfigs, Filters} from '@/composables/useFilters'

export interface Payload<ArticleType = Article> {
	articles : ArticleType[],
	newArticles : string[]
}

export interface LocalStorage {
	articles : { [id : string] : Article }
}

export type MediaService = Service<MediaArticle>

export abstract class Service<ArticleType extends Article = Article> {
	static readonly instances : Service[] = []
	articles = reactive<{ [id : string] : ArticleType }>({})
	readonly articleComponent : Component

	endpoints : Endpoint<any>[] = []

	defaultSortMethod = 'Unsorted'
	sortMethods = {}

	defaultFilters : FilterConfigs = defaultDefaultFilters
	filters : Filters<any> = {}

	protected constructor(
		public name : string,
		readonly endpointTypes : { [className : string] : Function },
		articleComponentRaw : Component,
		readonly hasMedia : boolean,	//TODO Check programatically
	) {
		this.articleComponent = markRaw(articleComponentRaw)
	}

	initialTimelines(serviceIndex : number) : TimelineData[] {
		return []
	}

	async getNewArticles(endpoint : number | Endpoint<any>, options : object) : Promise<string[]> {
		const actualEndpoint = endpoint instanceof Endpoint ? endpoint : this.endpoints[endpoint]
		const {articles, newArticles} = await actualEndpoint.call(options)

		for (const a of articles)
			this.updateArticle(a as ArticleType)

		await this.saveLocalStorage()

		return newArticles
	}

	updateArticle(article : ArticleType) {
		//TODO Remove ts=ignore
		// @ts-ignore
		this.articles[article.id] = article
	}

	toggleHideArticle(id : string) {
		this.articles[id].hidden = !this.articles[id].hidden
		this.saveLocalStorage()
	}

	loadLocalStorage(storage : LocalStorage) : void {
		//TODO Remove ts=ignore
		// @ts-ignore
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

	abstract getAPIArticleData(id : string) : Promise<any>;

	abstract getExternalLink(id : string) : string
}

export interface HostPageService {
	pageInfo? : PageInfo
}

export abstract class Endpoint<CallOpt> {
	articles : string[] = reactive([])
	calling = false

	protected constructor(readonly name : string) {
	}

	abstract call(options : CallOpt) : Promise<Payload>

	get ready() {
		return !this.calling
	}

	abstract getKeyOptions() : any

	setOptions(value : any) {
	}
}

export type WrappedPayload = { payload : Payload, basePageNum : number, lastPage : number }

export abstract class PagedEndpoint<CallOpt extends { pageNum : number } = { pageNum : number }> extends Endpoint<CallOpt> {
	loadedPages : number[] = []

	protected constructor(name : string, public basePageNum : number, public lastPage? : number) {
		super(name)
	}

	updateInstance(options : CallOpt, wrappedPayload : WrappedPayload) {
		for (const id of wrappedPayload.payload.newArticles)
			if (!this.articles.includes(id))
				this.articles.push(id)
		this.loadedPages.push(options.pageNum)
		this.basePageNum = wrappedPayload.basePageNum
		this.lastPage = wrappedPayload.lastPage
	}
}