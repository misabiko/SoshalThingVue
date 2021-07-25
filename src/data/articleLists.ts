import {ref} from 'vue'
import {Service} from '@/services'

const LOCALSTORAGE_LISTS_TITLE = 'SoshalThing ArticleLists'

export const articleLists = ref<{ [id : string] : { serviceName : string, articleId : string }[] }>(JSON.parse(localStorage.getItem(LOCALSTORAGE_LISTS_TITLE) || '{}'))

export function getNewId() {
	let id = 0
	while (articleLists.value.hasOwnProperty('generated' + id))
		id++

	return 'generated' + id
}

export function saveLists() {
	localStorage.setItem(LOCALSTORAGE_LISTS_TITLE, JSON.stringify(articleLists.value))
}

export function sortArticleList(sortMethod : (array : any[]) => any[], reversed : boolean, articleList : string) {
	const list = articleLists.value[articleList]
	const serviceName = list[0].serviceName	//TODO Will break with multi service timelines

	const unsorted = list
		.map(({
				  serviceName,
				  articleId,
			  } : { serviceName : string, articleId : string }) => Service.instances[serviceName].articles.value[articleId])

	let sorted = sortMethod(unsorted)
	if (reversed)
		sorted = sorted.reverse()

	articleLists.value[articleList] = sorted.map(a => ({serviceName, articleId : a.id}))
}