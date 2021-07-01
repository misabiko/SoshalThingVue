import {Article} from '@/data/articles'
import {h, ref} from 'vue'

export type SortMethods<ArticleType extends Article> = { [method : string] : (array : ArticleType[]) => ArticleType[] }

export function useSortMethods<ArticleType extends Article>(defaultSort = 'Unsorted', additionalMethods : SortMethods<ArticleType> = {}) {
	const sortMethods : SortMethods<ArticleType> = {
		...additionalMethods,
		Unsorted: (articles : ArticleType[]) => articles,
		Id: (articles : ArticleType[]) => articles.sort((a : ArticleType, b : ArticleType) => parseInt(b.id) - parseInt(a.id)),
	}

	const sortMethod = ref(defaultSort)

	const sortReversed = ref(false)

	const sortOption = () => h('div', {class: 'field is-horizontal'}, [
		h('div', {class: 'field-label'},
			h('label', {class: 'label'}, 'Sort Method'),
		),
		h('div', {class: 'field-body'}, [
				h('div', {class: 'field'}, [
					h('div', {class: 'control'},
						h('div', {class: 'select'},
							h('select', {
								value: sortMethod.value,
								onInput: (e : InputEvent) => sortMethod.value = (e.target as HTMLSelectElement).value,
							},
								Object.keys(sortMethods).map(method => h('option', {value: method}, method))
							),
						),
					),
				]),
				h('div', {class: 'field'}, [
					h('div', {class: 'control'},
						h('label', {class: 'checkbox'}, [
								h('input', {
									type: 'checkbox',
									value: sortReversed.value,
									onInput: (e : InputEvent) => sortReversed.value = (e.target as HTMLInputElement).checked,
								}),
								'Reversed',
							],
						),
					),
				]),
			],
		),
	])

	return {
		sortMethods,
		sortMethod,
		sortReversed,
		sortOption,
	}
}