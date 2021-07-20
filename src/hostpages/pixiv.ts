import {PageInfo} from './pageinfo'
import {h} from 'vue'

export abstract class PixivPage extends PageInfo {}

export class PixivFollowPage extends PixivPage {
	readonly r18 : boolean
	pageNum : number
	lastPage : number
	csrfToken : string

	activatorSelector = '.menu-items'

	constructor(css : string) {
		super(css, {
			default: `#js-mount-point-latest-following, nav.column-order-menu, nav.column-menu.folder-menu, footer._classic-footer, .ad-footer {display: none;} #wrapper, .layout-body, #wrapper #favviewer {width: 100%; height: 100%}`,
			fullscreen: `nav.column-menu, h1.column-title, div.extaraNavi {display: none;} #wrapper #favviewer {height: 93vh}`,
		})

		this.r18 = window.location.pathname.split('/')[1] === 'bookmark_new_illust_r18.php'

		const topPaginator = document.querySelector('nav.column-order-menu')
		if (!topPaginator)
			throw "Couldn't find the top paginator"

		this.pageNum = parseInt(topPaginator.querySelector('.page-list > li.current')?.textContent || '1') - 1
		this.lastPage = 100

		this.csrfToken = (globalThis as any).pixiv.context.token
	}

	inject() {
		const topPaginator = document.querySelector('nav.column-order-menu')
		if (!topPaginator)
			throw "Couldn't find the top paginator"

		topPaginator.after(this.rootDiv)
	}

	activator() {
		return h('li', super.activator())
	}
}

export class PixivUserPage extends PixivPage {
	pageNum! : number
	lastPage! : number
	readonly userId : string

	currentViewMode = 'fullscreen'
	activatorClassNames? : string
	activatorSelector = 'nav'

	constructor(css: string) {
		super(css, {
			default: `#favviewer {width: 100%; height: 50%}`,
			fullscreen: `#favviewer ~ div {display: none;`
		})

		this.userId = window.location.pathname.split('/').pop() ?? ''
		if (!this.userId)
			throw `Couldn't find userId in pathname "${window.location.pathname}"`
	}

	async waitUntilInjectable() : Promise<void> {
		if (document.readyState !== "complete")
			return new Promise((resolve, reject) => {
				document.addEventListener('DOMContentLoaded', () => resolve(), {once: true})
				document.addEventListener('load', () => resolve(), {once: true})
				window.setTimeout(() => {
					if (document.getElementsByTagName('nav')[0]) {
						console.warn("DOMContentLoaded timed out, but DOM is ready.")
						resolve()
					}
					else
						reject("DOMContentLoaded timed out.")
				}, 3000)
			})
	}

	inject() {
		const nav = document.getElementsByTagName('nav')[0]
		this.activatorClassNames = nav.lastElementChild?.className || ''

		const navGrandpa = nav.parentElement?.parentElement
		if (!navGrandpa)
			throw "Couldn't find the nav grand-parent."

		navGrandpa.after(this.rootDiv)

		const {pageNum, lastPage} = PixivUserPage.getPageNums(document)
		this.pageNum = pageNum
		this.lastPage = lastPage
	}

	static getPageNums(page : Document | HTMLHtmlElement = document) : { pageNum : number, lastPage : number } {
		const result = {pageNum: 0, lastPage: 0}

		const pageTab = page.querySelector('#favviewer')?.previousElementSibling?.querySelector('nav')
		const currentPageIndex = Array.from(pageTab?.children as HTMLCollection, (child: any) => child.ariaCurrent).findIndex((current: string) => current === 'page')
		if (currentPageIndex === undefined || currentPageIndex < 0)
			throw "Couldn't find the page tabs"
		else if (currentPageIndex == 0)
			return result

		const paginator = page.querySelector('#favviewer')?.nextElementSibling?.nextElementSibling
		if (!paginator)
			throw "Couldn't find paginator"

		const pageNumStr = paginator.querySelector('div')?.textContent
		if (!pageNumStr)
			throw "Couldn't parse pageNum"

		result.pageNum = parseInt(pageNumStr) - 1

		const lastPageStr = paginator.children[paginator.children.length - 2].textContent
		if (!lastPageStr)
			throw "Couldn't parse lastPage"

		result.lastPage = parseInt(lastPageStr) - 1

		return result
	}

	activator() {
		return h('a', {
			id: 'favvieweractivator',
			class: this.activatorClassNames,
		}, 'Activate Soshal')
	}
}

export class PixivBookmarkPage extends PixivPage {
	pageNum! : number
	lastPage! : number
	priv: boolean

	activatorSelector = '.column-order-menu > .menu-items'
	activator() {
		return h('li', super.activator())
	}

	constructor(css : string) {
		super(css, {
			default: `form._bookmark-settings {display: none;} #favviewer {width: 100%; height: 60vh}`,
			fullscreen: `#js-mount-point-header, nav.column-order-menu, footer.footer, .layout-column-1, .column-label, .column-menu, .display_editable_works, #illust-recommend, form._bookmark-settings {display: none;} #wrapper, .layout-a, #wrapper .layout-a .layout-column-2, #favviewer {width: 100%}`,
		})

		const currPage = document.querySelector('.column-order-menu li.current')
		if (!currPage || !currPage.textContent)
			throw "Couldn't find pageNum element"

		this.pageNum = parseInt(currPage.textContent) - 1

		const lastPage = currPage.parentElement?.lastElementChild?.firstElementChild?.textContent
		if (!lastPage)
			throw "Couldn't find lastPage element"

		this.lastPage = parseInt(lastPage) - 1

		this.priv = new URLSearchParams(window.location.search).get('rest') === 'hide'
	}

	inject() : void {
		const paginator = document.querySelector('.column-menu + .column-order-menu')
		if (!paginator)
			throw "Couldn't find paginator to inject after"

		paginator.after(this.rootDiv)
	}
}

export default [
	{
		pageInfo: PixivFollowPage,
		urlRegex: /https:\/\/.*pixiv\.net\/bookmark_new_illust.*\.php/,
		urlMatch: "https://*pixiv.net/bookmark_new_illust*.php*",
	},
	{
		pageInfo: PixivUserPage,
		urlRegex: /https:\/\/.*pixiv\.net\/.+\/users\/.+/,
		urlMatch: "https://*pixiv.net/*/users/*",
	},
	{
		pageInfo: PixivBookmarkPage,
		urlRegex: /https:\/\/.*pixiv\.net\/bookmark\.php/,
		urlMatch: "https://*pixiv.net/bookmark.php*",
	},
]