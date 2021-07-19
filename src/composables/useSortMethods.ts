import {Article} from '@/data/articles'
import {h, Ref, ref} from 'vue'

export type SortMethods<ArticleType extends Article> = { [method : string] : (array : ArticleType[]) => ArticleType[] }

export type SortConfig = {
	method : string
	reversed : boolean
}

export function useSortMethods<ArticleType extends Article>(sortConfig : Readonly<Ref<SortConfig>>, additionalMethods : Readonly<Ref<SortMethods<ArticleType>>>) {
	const sortMethods = ref<SortMethods<ArticleType>>({
		Unsorted: (articles : ArticleType[]) => articles,
		Id: (articles : ArticleType[]) => articles.sort((a : ArticleType, b : ArticleType) => parseInt(b.id) - parseInt(a.id)),
		...additionalMethods.value,
	})

	return {sortMethods}
}