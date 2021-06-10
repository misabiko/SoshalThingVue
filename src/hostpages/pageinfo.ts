//Shouldn't import service
//Can't import using @

import {h} from 'vue'

export interface CSSViewModes {
	[name: string]: string
}

export abstract class PageInfo {
	static viewModes = {
		hidden: '#favviewer {display: none;}'
	}
	defaultViewMode = 'default'

	protected viewModes : CSSViewModes
	protected rootDiv : HTMLDivElement
	protected styleElement : HTMLStyleElement
	searchParams : URLSearchParams
	pageNum? : number
	lastPage? : number

	activatorSelector = 'body'

	protected constructor(readonly css : string, viewModes : CSSViewModes) {
		this.viewModes = {
			...PageInfo.viewModes,
			...viewModes,
		}

		this.rootDiv = document.createElement('div')
		this.rootDiv.id = 'favviewer'

		const fa = document.createElement('script')
		fa.setAttribute('src', 'https://kit.fontawesome.com/67998b1eca.js')
		document.head.appendChild(fa)

		this.styleElement = document.createElement('style')
		this.styleElement.textContent = css + viewModes['default']
		this.styleElement.id = 'FavViewerCSS'
		document.head.appendChild(this.styleElement)

		this.searchParams = new URLSearchParams(window.location.href)
	}

	//by default do nothing
	async waitUntilInjectable() {}

	abstract inject() : void

	setViewMode(mode : string) {
		if (mode === 'hidden')
			this.styleElement.textContent = this.viewModes[mode]
		else
			this.styleElement.textContent = this.css + this.viewModes[mode]
	}

	activator() {
		return h('a', {
			id: 'favvieweractivator',
		}, 'Activate Soshal')
	}
}