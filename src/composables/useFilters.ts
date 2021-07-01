import {Article} from '@/data/articles'
import {h, Ref, ref} from 'vue'

export type Filters<ArticleType extends Article> = {
	[method : string] : {
		filter: (config : any) => (article : ArticleType) => boolean
		defaultConfig: FilterConfig
	}
}

type FilterConfig = {
	enabled : boolean,
	config : any,
	option : (filters : Ref<FilterConfigs>) => any
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
		config: {},
		option: () => null,
	},
	Interval: {
		enabled: false,
		config: {offset: 0, interval: 3, inverted: false},
		option: intervalOption,
	},
}

export function useFilters<ArticleType extends Article>(defaultFilters = defaultDefaultFilters, additionalFiters : Filters<ArticleType> = {}) {
	const filterMethods : Filters<ArticleType> = {
		Hidden: {
			filter: () => a => !a.hidden,
			defaultConfig: {
				enabled: true,
				config: {},
				option: () => null,
			}
		},
		Interval: {
			filter: ({offset, interval, inverted}) => a => (Math.max(a.index - offset, 0) % interval == 0) != inverted,
			defaultConfig: {
				enabled: false,
				config: {offset: 0, interval: 3, inverted: false},
				option: intervalOption,
			}
		},
		...additionalFiters,
	}

	const filters = ref<FilterConfigs>(defaultFilters)

	const newFilter = ref('Hidden')

	const filterOptions = () => [
		h('h4', 'Filters'),
		h('div', {class: 'field has-addons'}, [
			h('div', {class: 'control'},
				h('div', {class: 'select'},
					h('select', {
						onInput: (e : InputEvent) => newFilter.value = (e.target as HTMLInputElement).value,
					}, Object.keys(filterMethods).map(method => h('option', {value: method}, method)))
				)
			),
			h('div', {class: 'control'},
				h('button', {
					class: 'button',
					onClick: () => filters.value[newFilter.value] = filterMethods[newFilter.value].defaultConfig
				}, 'Add Filter')
			)
		]),
		...Object.entries(filters.value).map(([method, opts]) => h('div', {class: 'field'},
			[
				h('label', {class: 'label'}, method),
				h('div', {class: 'control'},
					h('button', {
						class: 'button',
						onClick: () => filters.value[method].enabled = !filters.value[method].enabled,
					}, filters.value[method].enabled ? 'On' : 'Off'),
				),
				filters.value[method].option(filters),
			])),
	]


	return {filterMethods, filters, filterOptions}
}