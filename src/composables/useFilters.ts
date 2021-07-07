import {Article, MediaArticle} from '@/data/articles'
import {h, Ref, ref} from 'vue'

export type Filters<ArticleType extends Article> = {
	[method : string] : {
		filter : (inverted : boolean, config : any) => (article : ArticleType) => boolean
		option : (filters : Ref<FilterConfigs>) => any
		defaultConfig : FilterConfig
	}
}

type FilterConfig = {
	enabled : boolean,
	inverted : boolean,
	config : any,
}

export type FilterConfigs = {
	[method : string] : FilterConfig
}

const intervalOption = (filters : Ref<FilterConfigs>) => [
	h('label', {class: 'label'}, 'Offset'),
	h('div', {class: 'control'},
		h('input', {
			class: 'input',
			type: 'number',
			value: filters.value.Interval.config.offset,
			min: 0,
			onInput: (e : InputEvent) => filters.value.Interval.config.offset = parseInt((e.target as HTMLInputElement).value),
		}),
	),
	h('label', {class: 'label'}, 'Interval'),
	h('div', {class: 'control'},
		h('input', {
			class: 'input',
			type: 'number',
			value: filters.value.Interval.config.interval,
			min: 2,
			onInput: (e : InputEvent) => filters.value.Interval.config.interval = parseInt((e.target as HTMLInputElement).value),
		}),
	),
	h('div', {class: 'control'},
		h('label', {class: 'checkbox'}, [
			h('input', {
				type: 'checkbox',
				checked: filters.value.Interval.config.inverted,
				onInput: (e : InputEvent) => filters.value.Interval.config.inverted = (e.target as HTMLInputElement).checked,
			}),
			'Inverted',
		]),
	),
]

export const defaultDefaultFilters : FilterConfigs = {
	Hidden: {
		enabled: true,
		inverted: false,
		config: {},
	},
}

export function useFilters<ArticleType extends Article>(filters : Readonly<Ref<FilterConfigs>>, additionalFiters : Readonly<Ref<Filters<ArticleType>>>) {
	const filterMethods = ref<Filters<ArticleType>>({
		Hidden: {
			filter: (inverted) => a => !a.hidden != inverted,
			option: () => null,
			defaultConfig: {
				enabled: true,
				inverted: false,
				config: {},
			},
		},
		Interval: {
			filter: (inverted, {offset, interval}) => a => (Math.max(a.index - offset, 0) % interval == 0) != inverted,
			option: intervalOption,
			defaultConfig: {
				enabled: false,
				inverted: false,
				config: {offset: 0, interval: 3},
			},
		},
		HasMedia: {
			filter: (inverted) => a => !!(a as unknown as MediaArticle).media?.length != inverted,
			option: () => null,
			defaultConfig: {
				enabled: true,
				inverted: false,
				config: {},
			},
		},
		...additionalFiters.value,
	})

	const newFilter = ref('Hidden')

	const filterOptions = () => [
		h('h4', 'Filters'),
		h('div', {class: 'field has-addons'}, [
			h('div', {class: 'control'},
				h('div', {class: 'select'},
					h('select', {
						onInput: (e : InputEvent) => newFilter.value = (e.target as HTMLInputElement).value,
					}, Object.keys(filterMethods.value)
						.filter(method => !Object.keys(filters.value).includes(method))
						.map(method => h('option', {value: method}, method))),
				),
			),
			h('div', {class: 'control'},
				h('button', {
					class: 'button',
					onClick: () => filters.value[newFilter.value] = filterMethods.value[newFilter.value].defaultConfig,
				}, 'Add Filter'),
			),
		]),
		...Object.entries(filters.value).map(([method, opts]) => h('div', {class: 'field'},
			[
				h('label', {class: 'label'}, method),
				h('div', {class: 'control has-addons'}, [
					h('button', {
						class: 'button',
						onClick: () => filters.value[method].enabled = !filters.value[method].enabled,
					}, filters.value[method].enabled ? 'On' : 'Off'),
					h('button', {
						class: 'button',
						onClick: () => filters.value[method].inverted = !filters.value[method].inverted,
					}, filters.value[method].inverted ? 'Inverted' : 'Normal'),
				]),
				filterMethods.value[method].option(filters),
			])),
	]


	return {filterMethods, filterOptions}
}