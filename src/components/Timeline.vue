<template>
	<div class='timeline' :class='{ mainTimeline }'>
		<div class='timelineHeader'>
			<div class='timelineLeftHeader'>
				<strong>{{ timeline.title }}</strong>
				<div class='timelineButtons' v-if='mainTimeline'>
					<button @click='$emit("hideSoshal")'>
						<HeaderFa icon='fa-eye-slash'></HeaderFa>
					</button>
				</div>
			</div>
			<div class='timelineButtons'>
				<button @click='getNewArticles()'>
					<HeaderFa icon='fa-arrow-down'></HeaderFa>
				</button>
				<button @click='showOptions = !showOptions'>
					<HeaderFa icon='fa-ellipsis-v'></HeaderFa>
				</button>
			</div>
		</div>
		<div class='timelineOptions' v-if='showOptions'>
			<div v-for='option in options' class='box'>
				<component :is='option'></component>
			</div>
		</div>
		<component
			:is='containers[timeline.container]'
			:service='service'
			:articles='articles'
			:column-count='columnCount'
			:right-to-left='rightToLeft'
			:on-article-click='onArticleClicks[onArticleClick]'
			@expand='modalArticle = $event'
			:update-queries='updateQueries'
			:update-loadings='updateLoadings'
			ref='containerEl'
		></component>
		<Modal
			v-if='modalArticle.length'
			:service='service'
			:article='service.articles[modalArticle]'
			:on-article-click='onArticleClicks[onArticleClick]'
			@close='modalArticle = ""'
		></Modal>
	</div>
</template>

<script lang='ts'>
import {
	computed,
	defineComponent,
	h,
	onBeforeMount,
	PropType,
	provide,
	reactive,
	Ref,
	ref,
	VNode,
	watch,
} from 'vue'
import {Service} from '@/services'
import {TimelineData} from '@/data/timelines'
import {useQueryManagerContainer} from '@/composables/QueryManager'
import {useLoadManagerTimeline} from '@/composables/LoadManager'
import ColumnContainer from '@/components/ColumnContainer.vue'
import Modal from '@/components/Modal.vue'
import usePages from '@/composables/usePages'
import {useAutoScroll} from '@/composables/useAutoScroll'
import {useSortMethods} from '@/composables/useSortMethods'
import {useFilters} from '@/composables/useFilters'
import RowContainer from '@/components/RowContainer.vue'
import MasonryContainer from '@/components/MasonryContainer.vue'

function headerFaIcon(props : any) {
	return h('span', {class: 'icon'}, [h('i', {class: `${props.icon} fas fa-lg`})])
}

export default defineComponent({
	props: {
		timeline: {
			type: Object as PropType<TimelineData>,
			required: true,
		},
		mainTimeline: Boolean,
	},
	components: {
		HeaderFa: headerFaIcon,
		Modal,
	},
	setup(props, {emit}) {
		const options : (() => VNode | VNode[])[] = []

		const service : Ref<Service> = ref(Service.instances[props.timeline.serviceIndex] as Service)
		const endpoint = computed(() => service.value.endpoints[props.timeline.endpointIndex])

		let endpointOptions = ref(endpoint.value.initOptions())
		const modifiedEndpointOptions = reactive<any>({})

		function resetModifiedEndpoints() {
			for (const key in modifiedEndpointOptions)
				if (modifiedEndpointOptions.hasOwnProperty(key))
					delete modifiedEndpointOptions[key]
		}

		const articleIds = computed<string[]>(() => {
			const instance = endpoint.value.instances[endpoint.value.optionsToInstance(endpointOptions.value)]
			if (!instance)
				throw "Instance not initiated"
			return instance.articles
		})

		watch(
			endpoint,
			(newEndpoint) => {
				console.debug('Changing endpoint options!')

				endpointOptions.value = newEndpoint.initOptions()
				resetModifiedEndpoints()

				if (!articleIds.value.length)
					getNewArticles()
			},
		)

		const sectionArticles = ref(false)
		const firstArticle = ref(0)
		const lastArticle = ref(30)

		const {
			sortMethods,
			sortMethod,
			sortReversed,
			sortOption,
		} = useSortMethods(service.value.defaultSortMethod, service.value.sortMethods)
		options.push(sortOption)

		const {filterMethods, filters, filterOptions} = useFilters()
		options.push(filterOptions)

		const articles = computed(() => {
				let unsorted = articleIds.value
					.map((id : string) => service.value.articles[id])
					.filter(a => !!a)	//Rerender happens before all of articleIds is added to service.articles

				for (const [method, opts] of Object.entries(filters.value))
					if (opts.enabled)
						unsorted = unsorted.filter(filterMethods[method](opts.config))

				let sorted = sortMethods[sortMethod.value](unsorted)
				if (sortReversed.value)
					sorted = sorted.reverse()

				if (sectionArticles.value)
					return sorted.slice(firstArticle.value, lastArticle.value)
				else
					return sorted
			},
		)

		const filteredArticleIds = computed(() => articles.value.map(a => a.id))

		const {
			getNewArticles,
			getRandomNewArticles,
			pagesOption,
		} = usePages(service, endpoint, endpointOptions, articleIds)
		options.push(pagesOption)

		onBeforeMount(() => getNewArticles())

		const showOptions = ref(false)

		const columnCount = ref(5)
		const rightToLeft = ref(props.timeline.defaults.rtl)

		const showArticle = (id : string) => {
			const el = document.querySelector('.article' + id)
			if (!el)
				return

			console.dir(el)
			el.scrollIntoView({behavior: 'smooth', block: 'center'})
		}

		const modalArticle = ref('')

		//https://stackoverflow.com/a/2450976
		function shuffle(array : any[]) {
			let currentIndex = array.length, temporaryValue, randomIndex

			// While there remain elements to shuffle...
			while (0 !== currentIndex) {

				// Pick a remaining element...
				randomIndex = Math.floor(Math.random() * currentIndex)
				currentIndex -= 1

				// And swap it with the current element.
				temporaryValue = array[currentIndex]
				array[currentIndex] = array[randomIndex]
				array[randomIndex] = temporaryValue
			}

			return array
		}

		const onArticleClicks : { [method : string] : (id : string) => void } = {
			Hide: (id : string) => service.value.toggleHideArticle(id),
			Log: (id : string) => console.dir(service.value.articles[id]),
			Expand: (id : string) => modalArticle.value = id,
		}

		const onArticleClick = ref('Hide')

		provide('service', service)

		options.push(() => [
			h('div', {class: 'field is-horizontal'}, [
				h('label', {class: 'field-label'}, 'Service'),
				h('div', {class: 'control'},
					h('div', {class: 'select'}, [
						h('select', {
							value: props.timeline.serviceIndex,
							onInput: (e : InputEvent) => {
								const value = parseInt((e.target as HTMLInputElement).value)
								if (value !== props.timeline.serviceIndex)
									emit('changeService', value)
							},
						}, Service.instances.map((s, i) =>
							h('option', {value: i, selected: props.timeline.serviceIndex == i}, s.name),
						)),
					]),
				),
			]),
			h('div', {class: 'field is-horizontal'}, [
				h('label', {class: 'field-label'}, 'Endpoint'),
				h('div', {class: 'control'},
					h('div', {class: 'select'}, [
						h('select', {
							value: props.timeline.endpointIndex,
							onInput: (e : InputEvent) => {
								const value = parseInt((e.target as HTMLInputElement).value)
								if (value !== props.timeline.endpointIndex)
									emit('changeEndpoint', value)
							},
						}, service.value.endpoints.map((e, i) =>
							h('option', {value: i, selected: props.timeline.endpointIndex == i}, e.name),
						)),
					]),
				),
			]),
			h('div', {class: 'endpointOptions'},
				[
					...Object.keys(endpointOptions.value).filter(key => !key.startsWith('_')).map((optionKey : string) => {
						let input : string | VNode
						try {
							input = endpointOptions.value[optionKey].constructor.name
						}catch (e) {
							console.error(`Failed to parse ${optionKey}'s contructor.`, e)
							return optionKey
						}

						switch (input) {
							case 'String':
								input = h('input', {
									class: 'input',
									type: 'text',
									value: modifiedEndpointOptions[optionKey] || endpointOptions.value[optionKey],
									onInput: (e : InputEvent) => modifiedEndpointOptions[optionKey] = (e.target as HTMLInputElement).value,
								})
								break
							case 'Array':
								input = h('input', {
									class: 'input',
									type: 'text',
									value: JSON.stringify(modifiedEndpointOptions[optionKey] || endpointOptions.value[optionKey]),
									onInput: (e : InputEvent) => {
										try {
											const parsed = JSON.parse((e.target as HTMLInputElement).value)
											modifiedEndpointOptions[optionKey] = parsed
										}catch (err) {
											//console.error("Parsing failure: " + (e.target as HTMLInputElement).value, err)
										}
									},
								})
								break
						}

						return h('div', {class: 'field'}, [
							h('label', {class: 'field-label'}, optionKey),
							h('div', {class: 'control'}, input),
						])
					}),
					h('div', {class: 'field is-grouped'}, [
						h('div', {class: 'control'},
							h('button', {
								class: 'button',
								onClick: () => {
									console.log('Apply!')
									endpointOptions.value = {...endpointOptions, ...modifiedEndpointOptions}
									resetModifiedEndpoints()
								},
							}, 'Apply'),
						),
						h('div', {class: 'control'},
							h('button', {
								class: 'button',
								onClick: () => resetModifiedEndpoints(),
							}, 'Reset'),
						),
					]),
				],
			),
		])

		options.push(() => [
			h('label', {class: 'field-label'}, 'On article click'),
			h('div', {class: 'select'}, [
				h('select', {
					value: onArticleClick.value,
					onInput: (e : InputEvent) => onArticleClick.value = (e.target as HTMLSelectElement).value,
				}, Object.keys(onArticleClicks).map(action =>
					h('option', {value: action, selected: onArticleClick.value === action}, action),
				)),
			]),
		])

		options.push(() => {
			const option = []
			if (sectionArticles.value)
				option.push(
					h('input', {
						class: 'input',
						type: 'number',
						value: firstArticle.value,
						onInput: (e : InputEvent) => firstArticle.value = parseInt((e.target as HTMLInputElement).value),
						min: 1,
						max: lastArticle.value,
					}),
					h('input', {
						class: 'input',
						type: 'number',
						value: lastArticle.value,
						onInput: (e : InputEvent) => lastArticle.value = parseInt((e.target as HTMLInputElement).value),
						min: firstArticle.value,
					}),
				)

			option.push(h('label', {class: 'checkbox'}, [
				h('input', {
					type: 'checkbox',
					checked: sectionArticles.value,
					onInput: (e : InputEvent) => sectionArticles.value = (e.target as HTMLInputElement).checked,
				}),
				'Section Articles',
			]))

			return option
		})

		const containerEl = ref()
		const {autoScroll, scrollOptions} = useAutoScroll(containerEl)
		options.push(scrollOptions)

		const containers : { [containerName : string] : any } = {
			ColumnContainer,
			RowContainer,
			MasonryContainer,
		}

		options.push(() => [h('div', {class: 'control'},
			Object.keys(containers).map(c => h('label', {class: 'radio'}, [
				h('input', {
					type: 'radio',
					value: c,
					onChange: ($event : Event) => emit('changeContainer', ($event.target as HTMLInputElement).value),
					checked: c === props.timeline.container,
				}),
				c,
			])),
		),
			h('label', {class: 'label'}, 'Column Count'),
			h('div', {class: 'control'},
				h('input', {
						class: 'input',
						type: 'number',
						value: columnCount.value,
						onInput: (e : InputEvent) => columnCount.value = parseInt((e.target as HTMLInputElement).value),
					},
				)),

			h('div', {class: 'control'},
				h('label', {class: 'checkbox'}, [
					h('input', {
							type: 'checkbox',
							onInput: (e : InputEvent) => rightToLeft.value = (e.target as HTMLInputElement).checked,
						},
					),
					'Right to left',
				]),
			),
		])

		const {updateQueries} = useQueryManagerContainer(service, props.timeline.title, filteredArticleIds)
		const {updateLoadings} = useLoadManagerTimeline(service, props.timeline.title, filteredArticleIds)

		return {
			shuffle,
			articleIds,
			sortMethod,
			autoScroll,
			getRandomNewArticles,
			getNewArticles,
			containers,
			service,
			articles,
			columnCount,
			rightToLeft,
			onArticleClicks,
			onArticleClick,
			updateQueries,
			updateLoadings,
			containerEl,
			modalArticle,
			showOptions,
			options,
		}
	},
})
</script>

<style lang='sass'>
@use '../sass/core' as *

.timeline
	@include pretty-scrollbar

	color: $text
	height: 100%
	padding: 0 5px
	box-sizing: border-box
	display: flex
	flex-flow: column

	&:first-child
		padding: 0

.timeline.mainTimeline
	flex-grow: 2

.timelineHeader
	height: 50px
	line-height: 50px
	padding-left: 25px
	background-color: $dark
	display: flex
	justify-content: space-between

	strong
		vertical-align: middle

	&.timelineInvalid
		background-color: $dark-error

.timelineLeftHeader
	display: flex

.timelineButtons > button
	@include borderless-button(0 1.6rem)
	height: 100%

.timelineOptions
	background-color: $scheme-main-ter
	padding: 1rem
	display: flex
	flex-flow: row wrap
	align-items: flex-start

	& input[type="number"]
		width: 200px
</style>
