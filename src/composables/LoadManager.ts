import {Ref} from 'vue'
import {Service, MediaService} from '@/services'
import {MediaLoadStatus} from '@/data/articles'

type GenericMedia = { status : MediaLoadStatus }

class LoadManager {
	autoLoad = true
	timeout? : number
	delay = 3000
	maxLoadCount = 4
	mountedArticles : {[title: string]: string[]} = {}

	get loadInProgress() {
		return this.timeout != undefined
	}

	getQueue(service: MediaService, mountedArticles = Object.values(this.mountedArticles).flat()) : {id: string, media: number}[] {
		return Object.values(service.articles)
			.filter(a => mountedArticles.includes(a.id))
			.flatMap(
				a => (a.media as GenericMedia[])
					.filter((m : GenericMedia) => m.status == MediaLoadStatus.Loading)
					.map((m : GenericMedia, i : number) => ({id: a.id, media: i}))
			)
	}

	loadRemainingData(service: MediaService, timedout = false) {
		console.debug('Loading?')
		if (!timedout && this.loadInProgress)
			return

		console.debug('Loading!')

		for (const el of document.getElementsByClassName('articleMediaLoading'))
			switch (el.tagName) {
				case 'VIDEO':
					if ((el as HTMLMediaElement).readyState >= 3) {
						const id = el?.parentElement?.getAttribute('articleid')
						const mediaIndex = el.getAttribute('mediaIndex')
						if (!id)
							console.error("Couldn't get id for video element.", el)
						else if (!mediaIndex)
							console.error("Couldn't get media index for video element.", el)
						else
							this.doneLoadingArticle(id, parseInt(mediaIndex), service)
					}
			}

		const flatMountedArticles = Object.values(this.mountedArticles).flat()
		const queue = this.getQueue(service, flatMountedArticles)

		for (const id of flatMountedArticles) {
			if (!service.articles.hasOwnProperty(id))
				continue

			for (const [i, media] of service.articles[id].media.entries()) {
				if (media.status != MediaLoadStatus.ReadyToLoad)
					continue

				if (queue.length >= this.maxLoadCount) {
					this.timeout = setTimeout(() => this.loadRemainingData(service, true), this.delay)

					console.log(`Loading full [${queue.toString()}]`)
					return
				}

				if (!queue.find(m => m.id === id && m.media === i)) {
					queue.push({id, media: i})
					this.startLoadingArticle(id, i, service, queue)
				}
			}
		}

		if (queue.length)
			console.log(`Loading [${queue.toString()}]`)
		else
			console.debug('Done loading.')

		this.timeout = undefined
	}

	startLoadingArticle(id : string, mediaIndex: number, service: MediaService, queue = this.getQueue(service)) {
		if (queue.length > this.maxLoadCount)
			return

		service.articles[id].media[mediaIndex].status = MediaLoadStatus.Loading
	}

	doneLoadingArticle(id : string, mediaIndex: number, service: MediaService) {
		service.articles[id].media[mediaIndex].status = MediaLoadStatus.FullyLoaded

		const flatMountedArticles = Object.values(this.mountedArticles).flat()
		const queue = this.getQueue(service, flatMountedArticles)

		for (const id of flatMountedArticles)
			if (service.articles.hasOwnProperty(id))
				for (const [i, media] of service.articles[id].media.entries())
					if (media.status == MediaLoadStatus.ReadyToLoad && !queue.find(m => m.id === id && m.media === i)) {
						queue.push({id, media: i})
						this.startLoadingArticle(id, i, service, queue)
					}
	}
}

export const loadManager = new LoadManager()

export function useLoadManagerTimeline(service : Ref<MediaService>, title: string, mountedArticles: Ref<string[]>) {
	const updateLoadings = function() {
		if (!service)
			return

		loadManager.mountedArticles[title] = mountedArticles.value

		if (loadManager.autoLoad)
			loadManager.loadRemainingData(service.value)
	}

	return {updateLoadings}
}