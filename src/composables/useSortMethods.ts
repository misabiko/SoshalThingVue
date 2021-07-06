import {Article} from '@/data/articles'
import {ComputedRef, h, ref} from 'vue'

export type SortMethods<ArticleType extends Article> = { [method : string] : (array : ArticleType[]) => ArticleType[] }

export type SortConfig = {
	method : string
	reversed : boolean
}

export function useSortMethods<ArticleType extends Article>(sortConfig : ComputedRef<SortConfig>, additionalMethods : ComputedRef<SortMethods<ArticleType>>) {
	const sortMethods = ref<SortMethods<ArticleType>>({
		Unsorted: (articles : ArticleType[]) => articles,
		Id: (articles : ArticleType[]) => articles.sort((a : ArticleType, b : ArticleType) => parseInt(b.id) - parseInt(a.id)),
		...additionalMethods.value,
	})

	const sortOption = () => h('div', {class: 'field is-horizontal'}, [
		h('div', {class: 'field-label'},
			h('label', {class: 'label'}, 'Sort Method'),
		),
		h('div', {class: 'field-body'}, [
				h('div', {class: 'field'}, [
					h('div', {class: 'control'},
						h('div', {class: 'select'},
							h('select', {
									value: sortConfig.value.method,
									onInput: (e : InputEvent) => sortConfig.value.method = (e.target as HTMLSelectElement).value,
								},
								Object.keys(sortMethods.value).map(method => h('option', {value: method}, method)),
							),
						),
					),
				]),
				h('div', {class: 'field'}, [
					h('div', {class: 'control'},
						h('label', {class: 'checkbox'}, [
								h('input', {
									type: 'checkbox',
									value: sortConfig.value.reversed,
									onInput: (e : InputEvent) => sortConfig.value.reversed = (e.target as HTMLInputElement).checked,
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
		sortOption,
	}
}