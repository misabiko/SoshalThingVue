<template>
	<div class='timeline' :class='{ mainTimeline }'>
		<div class='timelineHeader'>
			<div class='timelineLeftHeader'>
				<strong>{{ timeline.title }}</strong>
				<div class='timelineButtons' v-if='mainTimeline'>
					<button @click='$emit("hideSoshal")'>
						<span class='icon'>
							<FontAwesomeIcon icon='eye-slash' size='lg'/>
						</span>
					</button>
					<button @click='$emit("addTimeline")'>
						<span class='icon'>
							<FontAwesomeIcon icon='plus' size='lg'/>
						</span>
					</button>
				</div>
			</div>
			<div class='timelineButtons'>
				<button @click='shuffle(articleIds), sortMethod = "Unsorted"'>
					<span class='icon'>
						<FontAwesomeIcon icon='random' size='lg'/>
					</span>
				</button>
				<button @click='autoScroll()'>
					<span class='icon'>
						<FontAwesomeIcon icon='scroll' size='lg'/>
					</span>
				</button>
				<button v-if='endpointPackage.type === EndpointPackageType.PagedEndpoint' @click='getRandomNewArticles()'>
					<span class='icon'>
						<FontAwesomeIcon icon='magic' size='lg'/>
					</span>
				</button>
				<button v-if='endpointPackage.type !== EndpointPackageType.NoEndpoint' @click='getNewArticles()'>
					<span class='icon'>
						<FontAwesomeIcon :icon='endpointPackage.type === EndpointPackageType.PagedEndpoint ? "arrow-down" : "sync-alt"' size='lg'/>
					</span>
				</button>
				<button @click='showOptions = !showOptions'>
					<span class='icon'>
						<FontAwesomeIcon icon='ellipsis-v' size='lg'/>
					</span>
				</button>
			</div>
		</div>
		<div class='timelineOptions' v-if='showOptions'>
			<template v-for='option in options'>
				<div v-if='option' class='box'>
					<component :is='option'></component>
				</div>
			</template>
		</div>
		<component
			class='articlesContainer'
			:is='containers[timeline.container]'
			:service='service'
			:articles='articles'
			:column-count='Math.min(articles.length, columnCount)'
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
	computed, ComputedRef,
	defineComponent,
	h,
	onBeforeMount,
	PropType,
	provide,
	reactive,
	Ref,
	ref, toRefs,
	VNode,
	watch,
} from 'vue'
import {Endpoint, MediaService, PagedEndpoint, Service} from '@/services'
import {TimelineData} from '@/data/timelines'
import {useQueryManagerContainer} from '@/composables/QueryManager'
import {useLoadManagerTimeline} from '@/composables/LoadManager'
import ColumnContainer from '@/components/Containers/ColumnContainer.vue'
import Modal from '@/components/Modals/ArticleModal.vue'
import {useAutoScroll} from '@/composables/useAutoScroll'
import {useSortMethods} from '@/composables/useSortMethods'
import {useFilters} from '@/composables/useFilters'
import RowContainer from '@/components/Containers/RowContainer.vue'
import MasonryContainer from '@/components/Containers/MasonryContainer.vue'
import {library} from '@fortawesome/fontawesome-svg-core'
import {
	faArrowDown,
	faEllipsisV,
	faEyeSlash,
	faMagic,
	faPlus,
	faRandom,
	faScroll,
	faSyncAlt,
} from '@fortawesome/free-solid-svg-icons'

library.add(faEllipsisV, faArrowDown, faSyncAlt, faEyeSlash, faRandom, faScroll, faMagic, faPlus)

enum EndpointPackageType {
	NoEndpoint,
	RefreshEndpoint,
	PagedEndpoint,
}

type EndpointPackage = {
	type: EndpointPackageType.NoEndpoint,
} | {
	type: EndpointPackageType.RefreshEndpoint,
} | {
	type: EndpointPackageType.PagedEndpoint,
	endpoint: ComputedRef<PagedEndpoint>,
	remainingPages: ComputedRef<number[]>,
	newPage: Ref<undefined | number>,
}

export default defineComponent({
	props: {
		timeline: {
			type: Object as PropType<TimelineData>,
			required: true,
		},
		mainTimeline: Boolean,
		viewMode: String,
		viewModes: Array as PropType<string[]>,
	},
	components: {Modal},
	setup(props, {emit}) {
		const {viewMode} = toRefs(props)
		const options : (() => VNode | VNode[] | undefined)[] = []

		const service = ref(Service.instances[props.timeline.serviceIndex] as Service)
		const endpoint = computed(() => props.timeline.endpointIndex === undefined ? undefined : service.value.endpoints[props.timeline.endpointIndex])

		const endpointOptions = computed(() => {
			if (modifiedEndpointOptions.serviceIndex !== undefined && modifiedEndpointOptions.serviceIndex !== props.timeline.serviceIndex)
				return Service.instances[modifiedEndpointOptions.serviceIndex].endpoints[modifiedEndpointOptions.endpointIndex ?? 0].getKeyOptions()
			else if (modifiedEndpointOptions.endpointIndex === undefined || modifiedEndpointOptions.endpointIndex === props.timeline.endpointIndex)
				return endpoint.value?.getKeyOptions() ?? {}
			else
				return service.value.endpoints[modifiedEndpointOptions.endpointIndex].getKeyOptions()
		})
		const modifiedEndpointOptions = reactive<any>({})

		const endpointPackage = computed<EndpointPackage>(() => {
			if (!endpoint.value)
				return {
					type: EndpointPackageType.NoEndpoint,
				}
			else if (endpoint.value instanceof PagedEndpoint)
				return {
					type: EndpointPackageType.PagedEndpoint,
					endpoint: endpoint as ComputedRef<PagedEndpoint>,
					remainingPages,
					newPage,
				}
			else
				return {
					type: EndpointPackageType.RefreshEndpoint,
				}
		})

		const getNewArticles = async function(callOpts : object = {pageNum: newPage.value}) {
			if (!endpoint.value?.ready)
				return
			endpoint.value.calling = true

			const newArticles = await service.value.getNewArticles(endpoint.value, callOpts)

			for (const a of newArticles)
				if (!articleIds.value.includes(a))
					articleIds.value.push(a)

			const oldNewPage = newPage.value ?? -1
			const pages = remainingPages.value
			if (pages?.length)
				newPage.value = pages.filter(p => p > oldNewPage)[0] || pages[pages.length - 1]

			endpoint.value.calling = false
		}

		const getRandomNewArticles = () => {
			const ePackage = endpointPackage.value
			const pages = remainingPages.value
			if (ePackage.type === EndpointPackageType.PagedEndpoint && pages?.length)
				return getNewArticles({pageNum: pages[Math.floor(Math.random() * pages.length)]})
		}

		const newPage = ref(endpoint.value instanceof PagedEndpoint ? endpoint.value.basePageNum : undefined)

		const remainingPages = computed<number[]>(() => {
			if (!endpoint.value || !(endpoint.value instanceof PagedEndpoint))
				return []

			const lastPage = endpoint.value.lastPage ?? 10
			const loadedPages = endpoint.value.loadedPages

			const remaining = []
			for (let i = 0; i <= lastPage; i++)
				if (!loadedPages.includes(i))
					remaining.push(i)

			return remaining
		})

		options.push(() => {
			if (endpoint.value && endpoint.value instanceof PagedEndpoint)
				return h('div', {class: 'field'}, [
					h('label', {class: 'label'}, "Pages"),
					h('div', {class: 'field is-grouped'}, [
						h('div', {class: 'select'},
							h('select', {
								value: newPage.value,
								onInput: (e : InputEvent) => newPage.value = parseInt((e.target as HTMLSelectElement).value),
							}, remainingPages.value?.map(page => h('option', {value: page}, page))),
						),
						h('button', {
							class: 'button',
							disabled: !endpoint.value?.ready,
							onClick: () => getNewArticles({pageNum: newPage.value}),
						}, 'Load Page'),
					]),
				])
		})

		function resetModifiedEndpoints() {
			for (const key in modifiedEndpointOptions)
				if (modifiedEndpointOptions.hasOwnProperty(key))
					delete modifiedEndpointOptions[key]
		}

		function initEndpoint() {
			if (endpoint.value && endpoint.value instanceof PagedEndpoint)
				newPage.value ??= endpoint.value.basePageNum
		}

		watch(
			endpoint,
			(newEndpoint, oldEndpoint) => {
				console.debug('Changing endpoint options!')

				articleIds.value = []

				//endpointOptions.value = newEndpoint.initOptions()
				initEndpoint()
				resetModifiedEndpoints()

				if (!articleIds.value.length && getNewArticles)
					getNewArticles()
			},
		)

		const articleIds = ref([...(endpoint.value?.articles || [])])

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

		const {filterMethods, filters, filterOptions} = useFilters(service.value.defaultFilters, service.value.filters)
		options.push(filterOptions)

		const articles = computed(() => {
				let unsorted = articleIds.value
					.map((id : string) => service.value.articles[id])
					.filter(a => !!a)	//Rerender happens before all of articleIds is added to service.articles

				for (const [method, opts] of Object.entries(filters.value))
					if (opts.enabled)
						unsorted = unsorted.filter(filterMethods[method].filter(opts.config))

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

		initEndpoint()

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
								modifiedEndpointOptions.serviceIndex = parseInt((e.target as HTMLInputElement).value)
							},
						}, Service.instances.map((s, i) =>
							h('option', {value: i, selected: props.timeline.serviceIndex == i}, s.name),
						)),
					]),
				),
			]),
			h('div', {class: 'endpointOptions'},
				[
					h('div', {class: 'field is-horizontal'}, [
						h('label', {class: 'field-label'}, 'Endpoint Type'),
						h('div', {class: 'control'},
							h('div', {class: 'select'}, [
								h('select', {
									value: endpoint.value?.constructor.name,
									onInput: (e : InputEvent) => {
										modifiedEndpointOptions.endpointType = (e.target as HTMLInputElement).value
									},
								}, Object.keys(service.value.endpointTypes).map(e =>
									h('option', {value: e}, e),
								)),
							]),
						),
					]),
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
									console.log('Apply!', modifiedEndpointOptions)
									emit('changeEndpoint', modifiedEndpointOptions)
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

		if (viewMode?.value)
			options.push(() => {
				if (viewMode?.value && props.viewModes)
					return [
						h('label', {class: 'field-label'}, 'View Mode'),
						h('div', {class: 'select'}, [
							h('select', {
								value: viewMode.value,
								onInput: (e : InputEvent) => emit('set-viewmode', (e.target as HTMLSelectElement).value),
							}, props.viewModes.map(mode =>
								h('option', {value: mode, selected: viewMode.value === mode}, mode),
							)),
						]),
					]
				else
					return []
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

		let mediaServiceReturns = {}
		if (service.value.hasMedia) {
			const {updateQueries} = useQueryManagerContainer(service as Ref<Service>, props.timeline.title, filteredArticleIds)
			const {updateLoadings} = useLoadManagerTimeline(service as unknown as Ref<MediaService>, props.timeline.title, filteredArticleIds)

			mediaServiceReturns = {
				updateQueries,
				updateLoadings,
			}
		}

		return {
			shuffle,
			articleIds,
			sortMethod,
			autoScroll,
			getRandomNewArticles,
			getNewArticles,
			EndpointPackageType,
			endpointPackage,
			containers,
			service,
			articles,
			columnCount,
			rightToLeft,
			onArticleClicks,
			onArticleClick,
			containerEl,
			modalArticle,
			showOptions,
			options,
			...mediaServiceReturns,
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
	width: 500px

	&:first-child
		padding: 0

.timeline.mainTimeline
	flex-grow: 2
	width: unset

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
	@include borderless-button(0 1rem)
	height: 100%

.timelineOptions
	background-color: $scheme-main-ter
	padding: 1rem
	display: flex
	flex-flow: row wrap
	align-items: flex-start

	& input[type="number"]
		width: 200px

.articlesContainer
	overflow-y: scroll
	overflow-x: hidden
	flex-grow: 1
	height: 100%
</style>
