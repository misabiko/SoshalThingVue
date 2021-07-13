import {Component, computed, markRaw, reactive, ref, toRaw} from 'vue'
import {Article, MediaArticle} from '@/data/articles'
import {TimelineData} from '@/data/timelines'
import {PageInfo} from '@/hostpages/pageinfo'
import {defaultDefaultFilters, FilterConfigs, Filters} from '@/composables/useFilters'

export interface Payload<ArticleType = Article> {
	articles : ArticleType[],
	newArticles : string[]
}

export interface ServiceLocalStorage {
	articles : { [id : string] : Article }
	//endpoints : any[]
}

const LOCALSTORAGE_TITLE = 'SoshalThing Services'

export type MediaService = Service<MediaArticle>

export abstract class Service<ArticleType extends Article = Article> {
	static readonly instances : { [name : string] : Service } = {}

	static addService(service : Service) : Service {
		return Service.instances[service.name] = service
	}

	addEndpoint(endpoint : Endpoint<any>) : Endpoint<any> {
		return this.endpoints[JSON.stringify(endpoint.getKeyOptions())] = endpoint
	}

	articles = ref<{ [id : string] : ArticleType }>({})
	readonly articleComponent : Component

	endpoints : { [name : string] : Endpoint<any> } = {}

	defaultSortMethod = 'Unsorted'
	sortMethods = {}

	defaultFilters : FilterConfigs = defaultDefaultFilters
	filters : Filters<any> = {}

	protected constructor(
		public name : string,
		readonly endpointTypes : { [className : string] : { name : string, factory : Function, optionComponent : Function } },	//TODO Move to static properties
		articleComponentRaw : Component,
		readonly hasMedia : boolean,	//TODO Check programatically
	) {
		this.articleComponent = markRaw(articleComponentRaw)
	}

	initialTimelines() : TimelineData[] {
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
		const oldArticle = this.articles.value[newArticle.id]
		if (!oldArticle) {
			// @ts-ignore
			this.articles.value[newArticle.id] = newArticle
		}else {
			//TODO Remove ts=ignore
			// @ts-ignore
			this.articles.value[newArticle.id] = {
				...newArticle,
				hidden: oldArticle.hidden,
				queried: oldArticle.queried || newArticle.queried,
			}
		}
	}

	toggleHideArticle(id : string) {
		this.articles.value[id].hidden = !this.articles.value[id].hidden
		this.saveLocalStorage()
	}

	loadLocalStorage(storage : ServiceLocalStorage) : void {
		//TODO Remove ts=ignore
		// @ts-ignore
		this.articles.value = storage.articles
	}

	async generateLocalStorage() : Promise<ServiceLocalStorage> {
		return {
			articles: this.articles.value,
			//endpoints: this.endpoints.map(e => e.serialize())
		}
	}

	static async initLocalStorage() {
		const rawStorage = localStorage.getItem(LOCALSTORAGE_TITLE)
		if (rawStorage) {
			const storage = JSON.parse(rawStorage)
			for (const serviceName in storage) {
				if (!storage.hasOwnProperty(serviceName))
					continue

				Service.instances[serviceName]?.loadLocalStorage(storage[serviceName])
			}
			return
		}

		console.log('Initializing local storage...')
		const storage : { [serviceName : string] : ServiceLocalStorage } = {}
		for (const service of Object.values(Service.instances))
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

	optionComponent(props : any) : any {
		return null
	}

	logArticle(id : string) {
		console.dir(toRaw(this.articles.value[id]))
	}

	static async fetchProxy(url : string, opts? : any) : Promise<any> {
		const response = await fetch(url, opts)
		const json = await response.json()

		console.dir(json)

		if (json.soshalServices)
			for (const [name, status] of Object.entries(json.soshalServices))
				Service.instances[name]?.loadStatus(status)

		return json
	}

	loadStatus(status : any) {
	}
}

export interface HostPageService {
	pageInfo? : PageInfo
}

export abstract class Endpoint<CallOpt> {
	articles : string[] = reactive([])
	//calling = false

	rateLimitInfo? : {
		maxCalls : number
		remainingCalls : number
		secUntilNextReset : number
	}

	protected constructor(readonly name : string) {
	}

	abstract call(options : CallOpt) : Promise<Payload>

	get ready() {
		if (this.rateLimitInfo) {
			if (this.rateLimitInfo.secUntilNextReset * 1000 < Date.now())
				this.rateLimitInfo.remainingCalls = this.rateLimitInfo.maxCalls
			else if (!this.rateLimitInfo.remainingCalls)
				return false
		}

		return true//!this.calling
	}

	abstract getKeyOptions() : { endpointType : string } & any

	serialize() : any {
	}

	deserialize(data : any) {
	}
}

export type WrappedPayload = { payload : Payload, basePageNum : number, lastPage : number }

export interface PagedCallOpt {
	pageNum : number
}

export abstract class PagedEndpoint<CallOpt extends PagedCallOpt = PagedCallOpt> extends Endpoint<CallOpt> {
	loadedPages = ref<{ [page : number] : string[] }>({})

	protected constructor(name : string, public basePageNum = 0, public lastPage? : number) {
		super(name)
	}

	updateInstance(options : CallOpt, wrappedPayload : WrappedPayload) {
		this.loadedPages.value[options.pageNum] ??= []

		for (const id of wrappedPayload.payload.newArticles)
			if (!this.articles.includes(id)) {
				this.articles.push(id)
				this.loadedPages.value[options.pageNum].push(id)
			}
		this.basePageNum = wrappedPayload.basePageNum
		this.lastPage = wrappedPayload.lastPage
	}

	remainingPages = computed<number[]>(() => {
		const lastPage = this.lastPage ?? 10

		const remaining = []
		for (let i = 0; i <= lastPage; i++)
			if (!this.loadedPages.value.hasOwnProperty(i))
				remaining.push(i)

		return remaining
	})

	serialize() {
		return {
			loadedPages: toRaw(this.loadedPages.value),
		}
	}

	deserialize(data : any) {
		this.loadedPages.value = {
			...this.loadedPages.value,
			...data.loadedPages,
		}
	}
}

/*
var stop = false;
(async () => {
for (let i = 2; i < 203 && !stop; i++) {
	console.log('Loading page ' + i)
	services[1].getNewArticles(0, {pageNum: i})
	await new Promise(r => setTimeout(r, 1000))
}
})()
*/