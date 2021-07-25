import {EndpointTypeInfoGetter, HostPageService, PagedCallOpt, PagedEndpoint, Payload, Service} from '@/services'
import {PageInfo} from '@/hostpages/pageinfo'
import {PixivBookmarkPage, PixivFollowPage, PixivPage, PixivUserPage} from '@/hostpages/pixiv'
import PixivComponent from '@/components/Articles/PixivArticle.vue'
import {
	Article,
	getImageFormat,
	MediaData,
	LazyMedia,
	MediaArticle,
	MediaLoadStatus,
	MediaType,
	QueriedMedia,
} from '@/data/articles'
import {h} from 'vue'

export interface PixivArticle extends Article, MediaArticle {
	title : string
	media : (LazyMedia | QueriedMedia)[]
	liked : boolean
	bookmarked : boolean
}

export class PixivService extends Service<PixivArticle> implements HostPageService {
	pageInfo? : PixivPage
	csrfToken? : string

	constructor(pageInfoObj? : PageInfo) {
		super('Pixiv', [UserPageEndpoint.typeInfo], PixivComponent, true)

		if (pageInfoObj instanceof PixivPage)
			this.pageInfo = pageInfoObj

		if (this.pageInfo instanceof PixivFollowPage) {
			this.addEndpoint(new FollowPageEndpoint({pageInfo: this.pageInfo, r18: this.pageInfo.r18}))
			this.csrfToken = this.pageInfo.csrfToken
		}
		if (this.pageInfo instanceof PixivUserPage)
			this.addEndpoint(new UserPageEndpoint({pageInfo: this.pageInfo, userId: this.pageInfo.userId}))
		if (this.pageInfo instanceof PixivBookmarkPage)
			this.addEndpoint(new BookmarkPageEndpoint(this.pageInfo))
	}

	initialTimelines() {
		let endpointName
		switch (this.pageInfo?.constructor) {
			case PixivFollowPage:
				endpointName = JSON.stringify({
					endpointType: FollowPageEndpoint.name,
					r18: (this.pageInfo as PixivFollowPage).r18,
				})
				return [
					{
						title: 'Following',
						articleList: endpointName,
						serviceName: this.name,
						endpointName,
						container: 'MasonryContainer',
						columnCount: 5,
						filters: this.defaultFilters,
						sortConfig: {
							method: this.defaultSortMethod,
							reversed: false,
						},
						autoRefresh: false,
						compactArticles: false,
						articleSection: {
							enabled: true,
							start: 0,
							end: 100,
							expandStep: 50,
						},
					},
				]
			case PixivUserPage:
				endpointName = JSON.stringify({
					endpointType: UserPageEndpoint.name,
					userId: (this.pageInfo as PixivUserPage).userId,
				})
				return [
					{
						title: 'User',
						articleList: endpointName,
						serviceName: this.name,
						endpointName,
						container: 'MasonryContainer',
						columnCount: 5,
						filters: this.defaultFilters,
						sortConfig: {
							method: this.defaultSortMethod,
							reversed: false,
						},
						autoRefresh: false,
						compactArticles: false,
						articleSection: {
							enabled: true,
							start: 0,
							end: 100,
							expandStep: 50,
						},
					},
				]
			case PixivBookmarkPage:
				endpointName = JSON.stringify({
					endpointType: BookmarkPageEndpoint.name,
					priv: (this.pageInfo as PixivBookmarkPage).priv,
				})
				return [
					{
						title: 'Bookmarks',
						articleList: endpointName,
						serviceName: this.name,
						endpointName,
						container: 'MasonryContainer',
						columnCount: 5,
						filters: this.defaultFilters,
						sortConfig: {
							method: this.defaultSortMethod,
							reversed: false,
						},
						autoRefresh: false,
						compactArticles: false,
						articleSection: {
							enabled: true,
							start: 0,
							end: 100,
							expandStep: 50,
						},
					},
				]
			default:
				return []
		}
	}

	getAPIArticleData(id : string) : Promise<any> {
		return Promise.resolve(undefined)
	}

	getExternalLink(id : string) : string {
		return 'https://www.pixiv.net/en/artworks/' + id
	}

	async like(id : string) {
		if (!(this.pageInfo instanceof PixivFollowPage))
			return

		const response : LikeResponse = await fetch('https://www.pixiv.net/ajax/illusts/like', {
			method: "POST",
			credentials: "same-origin",
			cache: "no-cache",
			headers: {
				"Accept": "application/json",
				"Content-Type": "application/json",
				"Cache-Control": "no-cache",
				'X-CSRF-TOKEN': this.pageInfo.csrfToken,
			},
			body: JSON.stringify({illust_id: id}),
		}).then(r => r.json())

		console.dir(response)
		if (response.error) {
			console.error("Error during like: ", response)
			return
		}

		if (response.body.is_liked)
			console.log(id + ' was already liked.')
		else
			console.log('Liked ' + id)

		this.articles.value[id].liked = true
	}

	async bookmark(id : string, priv : boolean) {
		if (!(this.pageInfo instanceof PixivFollowPage))
			return

		const response : BookmarkResponse = await fetch('https://www.pixiv.net/ajax/illusts/bookmarks/add', {
			method: "POST",
			credentials: "same-origin",
			cache: "no-cache",
			headers: {
				"Accept": "application/json",
				"Content-Type": "application/json",
				"Cache-Control": "no-cache",
				'X-CSRF-TOKEN': this.pageInfo.csrfToken,
			},
			body: JSON.stringify({
				illust_id: id,
				restrict: priv ? 1 : 0,
				comment: "",
				tags: [],
			}),
		}).then(r => r.json())

		console.dir(response)
		if (response.error) {
			console.error("Error during bookmark: ", response)
			return
		}

		console.log('Bookmarked ' + id)

		this.articles.value[id].bookmarked = true
	}
}

type LikeResponse = {
	body : { is_liked : boolean }
	error : boolean
	message : string
}

type BookmarkResponse = {
	error : boolean,
	message : string,
	body : {
		last_bookmark_id : string,
		stacc_status_id : any
	}
}

type ThumbData = {
	id : string
	title : string
	thumbnail : MediaData
	bookmarked : boolean
}

interface MountPointData {
	url : string
	illustId : string
	illustTitle : string
	illustType : string
	pageCount : number
	tags : string[]
	width : number
	height : number
	userId : string
	userImage : any
	userName : string
	bookmarkCount : number
	isBookmarkable : boolean
	isBookmarked : boolean
	isPrivateBookmark : boolean
	responseCount : number
}

class FollowPageEndpoint extends PagedEndpoint {
	static defaultLastPage = 100

	readonly pageInfo : PixivFollowPage
	readonly r18 : boolean

	constructor(opts : { pageInfo : PixivFollowPage, r18 : boolean }) {
		super('Following', opts.pageInfo.pageNum, opts.pageInfo.lastPage)

		this.pageInfo = opts.pageInfo
		this.r18 = opts.r18
	}

	getKeyOptions() {
		return {
			...super.getKeyOptions(),
			r18: this.r18,
		}
	}

	async call(options : PagedCallOpt) {
		console.log('Loading page ' + options.pageNum)

		const wrappedPayload = {
			payload: options.pageNum === this.pageInfo?.pageNum ?
				FollowPageEndpoint.loadCurrentPageArticles() :
				await this.loadPageArticles(options.pageNum),
			basePageNum: this.pageInfo?.pageNum || 0,
			lastPage: FollowPageEndpoint.defaultLastPage,
		}

		this.updateInstance(options, wrappedPayload)

		return wrappedPayload.payload
	}

	private static loadCurrentPageArticles() {
		return FollowPageEndpoint.parsePageArticles(document)
	}

	private async loadPageArticles(pageNum : number) {
		let url = this.r18 ? 'https://www.pixiv.net/bookmark_new_illust_r18.php' : 'https://www.pixiv.net/bookmark_new_illust.php'
		if (pageNum)
			url += '?p=' + (pageNum + 1)

		const htmlEl = document.createElement('html')
		if (this.pageInfo)
			htmlEl.innerHTML = await fetch(url).then(response => response.text())
		else	//TODO if proxy server
			htmlEl.innerHTML = await fetch('/generic/redirect/' + url).then(response => response.text())

		return FollowPageEndpoint.parsePageArticles(htmlEl)
	}

	private static parsePageArticles(page : Document | HTMLHtmlElement) : Payload {
		const articles : PixivArticle[] = []
		const newArticles = []

		const currPageStr = page.querySelector('nav.column-order-menu .current')?.textContent
		if (!currPageStr)
			throw "Couldn't find paginator"

		const pageNum = parseInt(currPageStr) - 1

		const rawThumbs = page.querySelector("#js-mount-point-latest-following")?.getAttribute("data-items")
		if (!rawThumbs)
			throw "Couldn't find image datas"
		const thumbs : MountPointData[] = JSON.parse(rawThumbs)

		for (const [i, thumb] of thumbs.entries()) {
			let fullImageUrlSplit = thumb.url.split('/')
			fullImageUrlSplit.splice(3, 2)

			articles.push({
				id: thumb.illustId,
				title: thumb.illustTitle,
				index: pageNum * 20 + i,
				media: [
					{
						type: MediaType.Image,
						status: MediaLoadStatus.ReadyToLoad,
						thumbnail: {
							url: thumb.url,
							size: {width: thumb.width, height: thumb.height},
							format: getImageFormat(thumb.url),
						},
						content: {
							url: fullImageUrlSplit.join('/'),
							size: {width: thumb.width, height: thumb.height},
							format: getImageFormat(thumb.url),
						},
					},

				],
				read: false,
				hidden: false,
				queried: false,
				liked: false,
				bookmarked: thumb.isBookmarked || thumb.isPrivateBookmark,
			})
			newArticles.push(thumb.illustId)
		}

		console.log(`Loading ${articles.length} new articles with ${newArticles.length} in timeline.`)
		return {articles, newArticles}
	}
}

class UserPageEndpoint extends PagedEndpoint {
	static typeInfo : EndpointTypeInfoGetter = () => ({
		typeName: 'UserPageEndpoint',
		name: 'User Page Endpoint',
		factory(opts : { userId : string }) {
			return new UserPageEndpoint(opts)
		},
		optionComponent(props : any, {emit} : { emit : any }) {
			return h('div', {class: 'field'}, [
				h('label', {class: 'field-label'}, 'User Id'),
				h('div', {class: 'control'},
					h('input', {
						class: 'input',
						type: 'text',
						value: props.endpointOptions.userId,
						onInput: (e : InputEvent) => {
							props.endpointOptions.userId = (e.target as HTMLInputElement).value
							emit('changeOptions', props.endpointOptions)
						},
					}),
				),
			])
		},
	})

	static defaultLastPage = 100

	readonly userId : string
	readonly pageInfo? : PixivUserPage

	constructor(opts : { pageInfo? : PixivUserPage, userId : string }) {
		super('User ' + opts.userId, opts.pageInfo?.pageNum, opts.pageInfo?.lastPage)

		this.userId = opts.userId
		this.pageInfo = opts.pageInfo
	}

	getKeyOptions() {
		return {
			...super.getKeyOptions(),
			userId: this.userId,
		}
	}

	async call(options : PagedCallOpt) {
		console.log('Loading page ' + options.pageNum)

		const wrappedPayload = {
			payload: options.pageNum === (this.pageInfo?.pageNum ?? PixivUserPage.getPageNums().pageNum) ?
				UserPageEndpoint.parsePageArticles(document) :
				{articles: [], newArticles: []},
			basePageNum: this.pageInfo?.pageNum || 0,
			lastPage: UserPageEndpoint.defaultLastPage,
		}

		this.updateInstance(options, wrappedPayload)

		return wrappedPayload.payload
	}

	private static parsePageArticles(page : Document | HTMLHtmlElement) : Payload {
		console.log(page)
		const articles : PixivArticle[] = []
		const newArticles = []

		const {pageNum} = PixivUserPage.getPageNums(page)

		const rawThumbs = document.querySelector('#favviewer + div > div ul')?.children
		if (!rawThumbs)
			throw "Couldn't find thumbs"

		const thumbs : ThumbData[] = [...rawThumbs].map(t => {
			try {
				return this.parseThumb(t.firstElementChild as HTMLDivElement)
			}catch (err) {
				console.error('Failed to parse thumb', t, err)
				return undefined as unknown as ThumbData
			}
		}).filter(t => !!t)

		for (const [i, thumb] of thumbs.entries()) {
			articles.push({
				id: thumb.id,
				title: thumb.title,
				index: pageNum * 48 + i,
				media: [{
					type: MediaType.Image,
					status: MediaLoadStatus.ThumbnailOnly,
					thumbnail: thumb.thumbnail,
				}],
				read: false,
				hidden: false,
				queried: false,
				liked: false,
				bookmarked: thumb.bookmarked,
			})
			newArticles.push(thumb.id)
		}

		console.log(`Loading ${articles.length} new articles with ${newArticles.length} in timeline.`)
		return {articles, newArticles}
	}

	private static parseThumb(thumb : HTMLDivElement) : ThumbData {
		const anchor = thumb.firstElementChild?.firstElementChild?.firstElementChild
		if (!anchor)
			throw "Couldn't find thumb anchor"

		const id = anchor.getAttribute('data-gtm-value')
		if (!id)
			throw "Couldn't find id"

		const img = anchor.querySelector('img')
		if (!img)
			throw "Couldn't find thumb img for " + id

		const title = img.alt
		if (!title)
			throw "Couldn't find title for " + id

		const svg = thumb.querySelector('svg')
		if (!svg)
			throw "Couldn't find svg in thumb"

		return {
			id,
			title,
			thumbnail: {
				url: img.src,
				size: {width: 1, height: 1},
				format: getImageFormat(img.src),
			},
			bookmarked: getComputedStyle(svg).color === "rgb(255, 64, 96)",
		}
	}
}

class BookmarkPageEndpoint extends PagedEndpoint {
	priv : boolean

	constructor(readonly pageInfo : PixivBookmarkPage) {
		super('Bookmark', pageInfo.pageNum, pageInfo.lastPage)

		this.priv = pageInfo.priv
	}

	getKeyOptions() {
		return {
			...super.getKeyOptions(),
			priv: this.priv,
		}
	}

	async call(options : PagedCallOpt) {
		console.log('Loading page ' + options.pageNum)

		const wrappedPayload = {
			payload: options.pageNum === this.pageInfo?.pageNum ?
				BookmarkPageEndpoint.loadCurrentPageArticles(this.pageInfo.pageNum) :
				await BookmarkPageEndpoint.loadPageArticles(options.pageNum, this.priv),
			basePageNum: this.pageInfo?.pageNum || 0,
			lastPage: this.pageInfo?.lastPage || this.pageInfo?.pageNum || 0,
		}

		this.updateInstance(options, wrappedPayload)

		return wrappedPayload.payload
	}

	private static loadCurrentPageArticles(pageNum : number) {
		return BookmarkPageEndpoint.parsePageArticles(document, pageNum)
	}

	private static async loadPageArticles(pageNum : number, priv : boolean) {
		let url = new URL('https://www.pixiv.net/bookmark.php?rest=hide&order=desc')

		if (pageNum)
			url.searchParams.set('p', (pageNum + 1).toString())

		if (priv)
			url.searchParams.set('rest', 'hide')

		const htmlEl = document.createElement('html')
		htmlEl.innerHTML = await fetch(url.toString()).then(response => response.text())

		return BookmarkPageEndpoint.parsePageArticles(htmlEl, pageNum)
	}

	private static parsePageArticles(page : Document | HTMLHtmlElement, pageNum : number) : Payload {
		const articles : PixivArticle[] = []
		const newArticles = []

		const thumbs : ThumbData[] = [...page.querySelectorAll('.display_editable_works .image-item')].map(t => BookmarkPageEndpoint.parseThumb(t as HTMLLIElement))

		for (const [i, thumb] of thumbs.entries()) {
			let fullImageUrlSplit = thumb.thumbnail.url.split('/')
			fullImageUrlSplit.splice(3, 2)

			articles.push({
				id: thumb.id,
				title: thumb.title,
				index: pageNum * 20 + i,
				media: [{
					type: MediaType.Image,
					status: MediaLoadStatus.ReadyToLoad,
					thumbnail: thumb.thumbnail,
					content: {
						url: fullImageUrlSplit.join('/'),
						size: thumb.thumbnail.size,
						format: getImageFormat(thumb.thumbnail.url),
					},
				}],
				read: false,
				hidden: false,
				queried: false,
				liked: false,
				bookmarked: true,
			})
			newArticles.push(thumb.id)
		}

		console.log(`Loading ${articles.length} new articles with ${newArticles.length} in timeline.`)
		return {articles, newArticles}
	}

	private static parseThumb(thumb : HTMLLIElement) : ThumbData {
		const img = thumb.querySelector('img') as HTMLImageElement
		if (!img)
			throw "Couldn't find img"

		const id = img.getAttribute('data-id')
		if (!id)
			throw "Couldn't find id"

		const title = thumb.children[2].firstElementChild?.getAttribute('title')
		if (!title)
			throw "Couldn't find title for " + id

		const src = img.getAttribute('data-src')
		if (!src)
			throw "Couldn't find src"

		return {
			id,
			title,
			thumbnail: {
				url: src,
				size: {
					width: img.naturalWidth || img.clientWidth || 1,
					height: img.naturalWidth || img.clientWidth || 1,
				},
				format: getImageFormat(src),
			},
			bookmarked: true,
		}
	}
}