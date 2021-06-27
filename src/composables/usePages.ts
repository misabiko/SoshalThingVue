import {PagedEndpoint, Service} from '@/services'
import {computed, ref, Ref, ComputedRef, h} from 'vue'

export default function usePages(
	service : Ref<Service>,
	endpoint : ComputedRef<PagedEndpoint<any>>,
	articleIds : Ref<string[]>,
) {
	const loadingPage = ref(false)

	const remainingPages = computed<number[]>(() => {
		const lastPage = endpoint.value.lastPage ?? 10
		const loadedPages = endpoint.value.loadedPages

		const remaining = []
		for (let i = 0; i <= lastPage; i++)
			if (!loadedPages.includes(i))
				remaining.push(i)

		return remaining
	})

	const newPage = ref(endpoint.value.basePageNum)

	const getNewArticles = async function(callOpts : object = {pageNum: newPage.value}) {
		if (loadingPage.value)
			return
		loadingPage.value = true

		const newArticles = await service.value.getNewArticles(endpoint.value, callOpts)

		for (const a of newArticles)
			if (!articleIds.value.includes(a))
				articleIds.value.push(a)

		const oldNewPage = newPage.value
		if (remainingPages.value.length)
			newPage.value = remainingPages.value.filter(p => p > oldNewPage)[0] || remainingPages.value[remainingPages.value.length - 1]

		loadingPage.value = false
	}

	const getRandomNewArticles = () => {
		if (remainingPages.value.length)
			return getNewArticles({pageNum: remainingPages.value[Math.floor(Math.random() * remainingPages.value.length)]})
	}

	const pagesOption = () => h('div', {class: 'field'}, [
		h('label', {class: 'label'}, "Pages"),
		h('div', {class: 'field is-grouped'}, [
			h('div', {class: 'select'},
				h('select', {
					value: newPage.value,
					onInput: (e : InputEvent) => newPage.value = parseInt((e.target as HTMLSelectElement).value),
				}, remainingPages.value.map(page => h('option', {value: page}, page))),
			),
			h('button', {class: 'button', disabled: loadingPage.value, onClick: () => getNewArticles({pageNum: newPage.value})}, 'Load Page'),
		]),
	])

	return {remainingPages, getNewArticles, getRandomNewArticles, pagesOption}
}