import {ref, Ref} from 'vue'
import {Service} from '@/services'
import {MediaArticle} from '@/data/articles'

export interface Queryable {
	articles : Ref<{[id : string] : MediaArticle}>
	getData : (id : string) => void
	onDoneQuerying : () => void
}

export function castQueryable(object : any) : Queryable | undefined {
	if ('onDoneQuerying' in object)
		return object as Queryable
}

class QueryManager {
	queue = ref<Set<string>>(new Set())
	autoQuery = true
	timeout? : number
	delay = 3000
	maxQueryCount = 10
	mountedArticles : {[title: string]: string[]} = {}

	get queryInProgress() {
		return this.timeout != undefined
	}

	confirmQueue(queryable : Queryable) {
		for (const queryingId of this.queue.value)
			if (queryable.articles.value[queryingId].queried) {
				console.debug(`Deleting ${queryingId} from queue.`)
				this.queue.value.delete(queryingId)
			}
	}

	queryRemainingData(queryable : Queryable, timedout = false) {
		console.debug('Querying?')
		if (!timedout && this.queryInProgress)
			return

		console.debug('Querying!')

		const flatMountedArticles = Object.values(this.mountedArticles).flat()

		for (const id of flatMountedArticles) {
			if (!queryable.articles.value.hasOwnProperty(id) || queryable.articles.value[id].queried)
				continue

			if (this.queue.value.size >= this.maxQueryCount) {
				this.timeout = setTimeout(() => this.queryRemainingData(queryable, true), this.delay)

				console.log(`Querying full [${this.queue.value ? Array.from(this.queue.value).toString() : 'undefined'}]`)
				this.confirmQueue(queryable)
				return
			}

			if (!this.queue.value.has(id))
				this.queryArticleData(id, queryable).then()
		}

		if (this.queue.value.size)
			console.log(`Querying [${this.queue.value ? Array.from(this.queue.value).toString() : 'undefined'}]`)
		else
			console.debug('Done querying.')
		this.confirmQueue(queryable)

		this.timeout = undefined

		queryable.onDoneQuerying()
	}

	async queryArticleData(id : string, queryable : Queryable) {
		this.queue.value.add(id)
		console.debug('Querying ' + id)

		await queryable.getData(id)

		this.queue.value.delete(id)

		if (this.timeout === undefined && !this.queue.value.size) {
			console.debug('Done querying.')
			await queryable.onDoneQuerying()
		}

		if (this.autoQuery && this.queue.value.size < this.maxQueryCount)
			this.queryRemainingData(queryable)
	}
}

export const queryManager = new QueryManager()

export function useQueryManagerContainer(service : Ref<Service>, title: string, mountedArticles : Ref<string[]>) {
	const updateQueries = function() {
		const queryable = castQueryable(service.value)
		if (!queryable)
			return

		queryManager.mountedArticles[title] = mountedArticles.value;

		if (queryManager.autoQuery)
			queryManager.queryRemainingData(queryable)
	}

	const queryArticle = function(id : string) {
		const queryable = castQueryable(service.value)
		if (!queryable) {
			console.error("Service not queryable", service.value)
			return
		}

		return queryManager.queryArticleData(id, queryable)
	}

	return {updateQueries, queryArticle}
}

export function useQueryManagerArticle(service : Ref<Service>) {
	const queryArticle = function(id : string) {
		const queryable = castQueryable(service.value)
		if (!queryable) {
			console.error("Service not queryable", service.value)
			return
		}

		return queryManager.queryArticleData(id, queryable)
	}

	return {queryArticle}
}