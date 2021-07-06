import {Component, h, markRaw, reactive, Ref, ref, toRaw} from 'vue'
import {Article, MediaArticle} from '@/data/articles'
import {TimelineData} from '@/data/timelines'
import {PageInfo} from '@/hostpages/pageinfo'
import {defaultDefaultFilters, FilterConfigs, Filters} from '@/composables/useFilters'
import {saveLists} from '@/data/articleLists'

export interface Payload<ArticleType = Article> {
	articles : ArticleType[],
	newArticles : string[]
}

export interface ServiceLocalStorage {
	articles : { [id : string] : Article }
}

const LOCALSTORAGE_TITLE = 'SoshalThing Services'

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
		readonly endpointTypes : { [className : string] : { factory : Function, optionComponent : Function } },
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

		try {
			const {articles, newArticles} = await actualEndpoint.call(options)

			for (const a of articles)
				this.updateArticle(a as ArticleType)

			await this.saveLocalStorage()

			return newArticles
		}catch (e) {
			console.error('Failed to use endpoint ' + actualEndpoint.name, e)
			return []
		}
	}

	updateArticle(newArticle : ArticleType) {
		const oldArticle = this.articles[newArticle.id]
		//TODO Remove ts=ignore
		// @ts-ignore
		this.articles[article.id] = {
			...newArticle,
			hidden: oldArticle.hidden,
			queried: oldArticle.queried || newArticle.queried,
		}
	}

	toggleHideArticle(id : string) {
		this.articles[id].hidden = !this.articles[id].hidden
		this.saveLocalStorage()
	}

	loadLocalStorage(storage : ServiceLocalStorage) : void {
		//TODO Remove ts=ignore
		// @ts-ignore
		this.articles = storage.articles
	}

	async generateLocalStorage() : Promise<ServiceLocalStorage> {
		return {articles: this.articles}
	}

	static async initLocalStorage() {
		const rawStorage = localStorage.getItem(LOCALSTORAGE_TITLE)
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
		const storage : { [serviceName : string] : ServiceLocalStorage } = {}
		for (const service of Service.instances)
			storage[service.name] = await service.generateLocalStorage()
		localStorage.setItem(LOCALSTORAGE_TITLE, JSON.stringify(storage))
	}

	async saveLocalStorage() {
		console.log(`Saving local storage...`)

		const rawStorage = localStorage.getItem(LOCALSTORAGE_TITLE)
		if (!rawStorage)
			throw "Local storage isn't initialized"

		const storage : { [serviceName : string] : ServiceLocalStorage } = JSON.parse(rawStorage)
		storage[this.name] = await this.generateLocalStorage()
		localStorage.setItem(LOCALSTORAGE_TITLE, JSON.stringify(storage))
	}

	abstract getAPIArticleData(id : string) : Promise<any>;

	abstract getExternalLink(id : string) : string

	optionComponent(props: any): any {
		return null
	}

	logArticle(id : string) {
		console.dir(toRaw(this.articles[id]))
	}
}

export interface HostPageService {
	pageInfo? : PageInfo
}

export abstract class Endpoint<CallOpt> {
	articles : string[] = reactive([])
	calling = false

	rateLimitInfo? : {
		maxCalls: number
		remainingCalls: number
		secUntilNextReset: number
	}

	protected constructor(readonly name : string) {
	}

	abstract call(options : CallOpt) : Promise<Payload>

	get ready() {
		if (this.rateLimitInfo && this.rateLimitInfo.secUntilNextReset * 1000 < Date.now())
			this.rateLimitInfo.remainingCalls = this.rateLimitInfo.maxCalls

		return !this.calling
	}

	abstract getKeyOptions() : { endpointType : string } & any

	setOptions(value : any) {
	}
}

export type WrappedPayload = { payload : Payload, basePageNum : number, lastPage : number }

export abstract class PagedEndpoint<CallOpt extends { pageNum : number } = { pageNum : number }> extends Endpoint<CallOpt> {
	loadedPages : { [page: number]: string[] } = {}

	protected constructor(name : string, public basePageNum : number, public lastPage? : number) {
		super(name)
	}

	updateInstance(options : CallOpt, wrappedPayload : WrappedPayload) {
		this.loadedPages[options.pageNum] ??= []

		for (const id of wrappedPayload.payload.newArticles)
			if (!this.articles.includes(id)) {
				this.articles.push(id)
				this.loadedPages[options.pageNum].push(id)
			}
		this.basePageNum = wrappedPayload.basePageNum
		this.lastPage = wrappedPayload.lastPage
	}
}