import {getCurrentInstance, h, ref, Ref, toRaw, VNode} from 'vue'
import {Article, MediaLoadStatus} from '@/data/articles'
import {useQueryManagerArticle} from '@/composables/QueryManager'
import {Service} from '@/services'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import {library} from '@fortawesome/fontawesome-svg-core'
import {
	faDownload,
	faExpandArrowsAlt,
	faExternalLinkAlt,
	faSpinner,
	faTruckLoading,
	faEllipsisV
} from '@fortawesome/free-solid-svg-icons'

library.add(faDownload, faTruckLoading, faSpinner, faExternalLinkAlt, faExpandArrowsAlt, faEllipsisV)

export function useFavViewerButtons(service : Ref<Service>, article : Ref<Article>, addedTopButtons : (() => any)[] = [], addedBottomButtons : (() => any)[] = []) {
	const instance = getCurrentInstance()
	if (!instance)
		throw "No current instance"

	const {emit} = instance

	const showDropdown = ref(false)

	const {queryArticle} = useQueryManagerArticle(service)

	const holderBoxes = () => {
		const topButtons : VNode[] = addedTopButtons.map(b => b())
		const bottomButtons : VNode[] = addedBottomButtons.map(b => b())

		switch (article.value.media.status) {
			case MediaLoadStatus.ThumbnailOnly:
				topButtons.unshift(h('button', {
						class: 'button',
						onClick: () => {
							queryArticle(article.value.id)
						},
					}, [h('span', {class: 'icon darkIcon is-small'}, h(FontAwesomeIcon, {icon: 'download'}))]),
				)
				break
			case MediaLoadStatus.ReadyToLoad:
				topButtons.unshift(h('button', {
						class: 'button',
						title: 'Load',
						onClick: () => service.value.articles[article.value.id].media.status = MediaLoadStatus.Loading,
					}, [h('span', {class: 'icon darkIcon is-small'}, h(FontAwesomeIcon, {icon: 'truck-loading'}))]),
				)
				break
			case MediaLoadStatus.Loading:
				topButtons.unshift(h('button', {
						class: 'button',
						title: 'Loading...',
						onClick: () => console.log(`this.checkIfLoaded`),
					}, [h('span', {class: 'icon darkIcon is-small'}, h(FontAwesomeIcon, {icon: 'spinner'}))]),
				)
				break
			default:
		}

		topButtons.push(h('a', {
				class: 'button',
				title: 'External Link',
				href: service.value.getExternalLink(article.value.id),
			}, [h('span', {class: 'icon darkIcon is-small'}, h(FontAwesomeIcon, {icon: 'external-link-alt'}))],
		))

		topButtons.push(h('button', {
				class: 'button',
				onClick: () => emit('expand', article.value.id),
			}, [h('span', {class: 'icon darkIcon is-small'}, h(FontAwesomeIcon, {icon: 'expand-arrows-alt'}))],
		))

		topButtons.push(h('div', {class: 'dropdown is-right' + (showDropdown.value ? ' is-active' : '')}, [
			h('div', {class: 'dropdown-trigger'}, [
				h('button', {
						class: 'button',
						title: 'Article Menu',
						'aria-haspopup': true,
						'aria-controls': 'dropdown-menu',
						onClick: () => showDropdown.value = !showDropdown.value,
					}, [h('span', {class: 'icon darkIcon is-small'}, h(FontAwesomeIcon, {icon: 'ellipsis-v'}))],
				),
			]),
			h('div', {class: 'dropdown-menu'}, [
				h('div', {class: 'dropdown-content'}, [
					h('div', {
						class: 'dropdown-item',
						onClick: () => service.value.toggleHideArticle(article.value.id),
					}, ['Hide']),
					h('div', {
						class: 'dropdown-item',
						onClick: () => console.dir(toRaw(article.value)),
					}, ['Log']),
					h('div', {
						class: 'dropdown-item',
						onClick: async () => console.dir(await service.value.getAPIArticleData(article.value.id)),
					}, ['Get API Data']),
				]),
			]),
		]))

		return [
			h('div', {class: 'holderBox holderBoxTop'}, topButtons),
			h('div', {class: 'holderBox holderBoxBottom'}, bottomButtons),
		]
	}

	return {holderBoxes}
}