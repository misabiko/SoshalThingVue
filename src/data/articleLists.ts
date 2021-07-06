import {ref} from 'vue'

const LOCALSTORAGE_LISTS_TITLE = 'SoshalThing ArticleLists'

export const articleLists = ref<{ [id : string] : { serviceIndex : number, articleId : string }[] }>(JSON.parse(localStorage.getItem(LOCALSTORAGE_LISTS_TITLE) || '{}'))

export function getNewId() {
	let id = 0
	while (articleLists.value.hasOwnProperty('generated' + id))
		id++

	return 'generated' + id
}

export function saveLists() {
	localStorage.setItem(LOCALSTORAGE_LISTS_TITLE, JSON.stringify(articleLists.value))
}