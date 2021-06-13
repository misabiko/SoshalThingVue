import {Ref} from 'vue'
import {Service} from '@/services'
import {MediaLoadStatus} from '@/data/articles'

class LoadManager {
	autoLoad = true
	timeout? : number
	delay = 3000
	maxLoadCount = 4
	mountedArticles : {[title: string]: string[]} = {}

	get loadInProgress() {
		return this.timeout != undefined
	}

	getQueue(service: Service, mountedArticles = Object.values(this.mountedArticles).flat()) {
		return Object.values(service.articles).filter(a => mountedArticles.includes(a.id) && a.media.status == MediaLoadStatus.Loading).map(a => a.id)
	}

	loadRemainingData(service: Service, timedout = false) {
		console.debug('Loading?')
		if (!timedout && this.loadInProgress)
			return

		console.debug('Loading!')

		for (const el of document.getElementsByClassName("articleMediaLoading"))
			switch (el.tagName) {
				case 'VIDEO':
					if ((el as HTMLMediaElement).readyState >= 3) {
						const id = el?.parentElement?.getAttribute("articleid")
						if (!id)
							console.error("Couldn't get id for video element.", el)
						else
							this.doneLoadingArticle(id, service)
					}
			}

		const flatMountedArticles = Object.values(this.mountedArticles).flat()
		const queue = this.getQueue(service, flatMountedArticles)

		for (const id of flatMountedArticles) {
			if (!service.articles.hasOwnProperty(id) || service.articles[id].media.status != MediaLoadStatus.ReadyToLoad)
				continue

			if (queue.length >= this.maxLoadCount) {
				this.timeout = setTimeout(() => this.loadRemainingData(service, true), this.delay)

				console.log(`Loading full [${queue.toString()}]`)
				//this.confirmQueue(service.articles)
				return
			}

			if (!queue.includes(id)) {
				queue.push(id)
				this.startLoadingArticle(id, service, queue)
			}
		}

		if (queue.length)
			console.log(`Loading [${queue.toString()}]`)
		else
			console.log('Done loading.')
		//this.confirmQueue(service.articles)

		this.timeout = undefined
	}

	startLoadingArticle(id : string, service: Service, queue = this.getQueue(service)) {
		if (queue.length > this.maxLoadCount)
			return

		service.articles[id].media.status = MediaLoadStatus.Loading
	}

	doneLoadingArticle(id : string, service: Service) {
		service.articles[id].media.status = MediaLoadStatus.FullyLoaded

		const flatMountedArticles = Object.values(this.mountedArticles).flat()
		const queue = this.getQueue(service, flatMountedArticles)
		for (const id of flatMountedArticles)
			if (service.articles.hasOwnProperty(id) && service.articles[id].media.status == MediaLoadStatus.ReadyToLoad && !queue.includes(id))
				this.startLoadingArticle(id, service, queue)
	}
}

export const loadManager = new LoadManager()

export function useLoadManagerTimeline(service : Ref<Service>, title: string, mountedArticles: Ref<string[]>) {
	const updateLoadings = function() {
		if (!service)
			return

		loadManager.mountedArticles[title] = mountedArticles.value

		if (loadManager.autoLoad)
			loadManager.loadRemainingData(service.value)
	}

	return {updateLoadings}
}

export function useLoadManagerArticle() {
	const startLoading = function(id: string, service : Service) {
		loadManager.startLoadingArticle(id, service)
	}

	const doneLoading = function(id: string, service : Service) {
		loadManager.doneLoadingArticle(id, service)
	}

	return {startLoading, doneLoading}
}