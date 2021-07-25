import {Article, ArticlePacket} from '@/data/articles'
import {h, Ref, ref} from 'vue'

export type SortMethods<ArticleType extends Article> = { [method : string] : (array : ArticlePacket<ArticleType>[]) => ArticlePacket<ArticleType>[] }

export type SortConfig = {
	method : string
	reversed : boolean
}

export function useSortMethods<ArticleType extends Article>(sortConfig : Readonly<Ref<SortConfig>>, additionalMethods : Readonly<Ref<SortMethods<ArticleType>>>) {
	const sortMethods = ref<SortMethods<ArticleType>>({
		Unsorted: (articles) => articles,
		Id: (articles) => articles.sort((a, b) => parseInt(b.article.id) - parseInt(a.article.id)),
		...additionalMethods.value,
	})

	return {sortMethods}
}