<template>
	<div class='timeline' :class='{ mainTimeline }' :style='size > 1 ? {width: (size * 500) + "px"} : {}'>
		<div class='timelineHeader'>
			<div class='timelineLeftHeader'>
				<strong>{{ timeline.title }}</strong>
				<div class='timelineButtons' v-if='mainTimeline'>
					<button @click='$emit("showSidebar")'>
						<span class='icon'>
							<FontAwesomeIcon icon='ellipsis-v' size='lg'/>
						</span>
					</button>
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
				<template v-if='endpointPackage.type !== EndpointPackageType.NoEndpoint'>
					<button @click='getNewArticles({fromTop: true, pageNum: refreshPageNum})'>
						<span class='icon'>
							<FontAwesomeIcon icon='sync-alt' size='lg'/>
						</span>
					</button>
					<button @click='getNewArticles({fromEnd: true, pageNum: newPage})'>
						<span class='icon'>
							<FontAwesomeIcon icon='arrow-down' size='lg'/>
						</span>
					</button>
				</template>
				<button @click='showOptions = !showOptions'>
					<span class='icon'>
						<FontAwesomeIcon icon='ellipsis-v' size='lg'/>
					</span>
				</button>
			</div>
		</div>
		<div class='timelineOptions' v-if='showOptions'>
			<div class='box'>
				<EndpointSelection v-model='modifiedTimelineData'/>
				<div class='field is-grouped'>
					<div class='control'>
						<button class='button' @click='$emit("changeTimeline", modifiedTimelineData)'>
							Apply
						</button>
					</div>
					<div class='control'>
						<button class='button' @click='modifiedTimelineData = {...timeline}'>
							Reset
						</button>
					</div>
				</div>
			</div>
			<div class='box'>
				<div class='field'>
					<label class='label'>Article List</label>
					<div class='control'>
						<div class='select'>
							<select v-model='timeline.articleList' @input='$emit("saveTimeline")'>
								<option v-for='(list, listName) in articleLists' :value='listName'>
									{{ listName }}
								</option>
							</select>
						</div>
					</div>
				</div>
			</div>
			<template v-for='option in options'>
				<div v-if='option' class='box'>
					<component :is='option'></component>
				</div>
			</template>
			<div class='box'>
				<button class='button' @click='$emit("delete")'>
					Delete Timeline
				</button>
			</div>
		</div>
		<component
			class='articlesContainer'
			:is='containers[timeline.container]'
			:service='service'
			:articles='articles'
			:columnCount='Math.min(articles.length, columnCount)'
			:rightToLeft='rightToLeft'
			:onArticleClick='onArticleClicks[onArticleClick]'
			@expand='modalArticle = $event'
			:updateQueries='updateQueries'
			:updateLoadings='updateLoadings'
			ref='containerEl'
		></component>
		<Modal
			v-if='modalArticle.length'
			:service='service'
			:article='service.articles.value[modalArticle]'
			:onArticleClick='onArticleClicks[onArticleClick]'
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
	Ref,
	ref, toRefs,
	VNode,
	watch,
} from 'vue'
import {MediaService, PagedEndpoint, Service} from '@/services'
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
import EndpointSelection from '@/components/EndpointSelection.vue'
import {articleLists, saveLists} from '@/data/articleLists'

library.add(faEllipsisV, faArrowDown, faSyncAlt, faEyeSlash, faRandom, faScroll, faMagic, faPlus)

enum EndpointPackageType {
	NoEndpoint,
	RefreshEndpoint,
	PagedEndpoint,
}

type EndpointPackage = {
	type: EndpointPackageType.NoEndpoint,
	ready: false,
} | {
	type: EndpointPackageType.RefreshEndpoint,
	ready: boolean,
} | {
	type: EndpointPackageType.PagedEndpoint,
	ready: boolean,
	endpoint: Readonly<Ref<PagedEndpoint>>,
	remainingPages: Readonly<Ref<number[]>>,
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
	components: {EndpointSelection, Modal},
	setup(props, {emit}) {
		const {viewMode} = toRefs(props)
		const options : (() => VNode | VNode[] | undefined)[] = []

		const service = computed(() => Service.instances[props.timeline.serviceName] as Service)
		const endpoint = computed(() => props.timeline.endpointName === undefined ? undefined : service.value.endpoints[props.timeline.endpointName])

		const modifiedTimelineData = ref<TimelineData>({
			...props.timeline
		})

		const endpointPackage = computed<EndpointPackage>(() => {
			if (!endpoint.value)
				return {
					type: EndpointPackageType.NoEndpoint,
					ready: false,
				}
			else if (endpoint.value instanceof PagedEndpoint)
				return {
					type: EndpointPackageType.PagedEndpoint,
					get ready() {return endpoint.value?.ready ?? false},
					endpoint: endpoint as unknown as Readonly<Ref<PagedEndpoint>>,
					remainingPages,
					newPage,
				}
			else
				return {
					type: EndpointPackageType.RefreshEndpoint,
					get ready() {return endpoint.value?.ready ?? false},
				}
		})

		const getNewArticles = async function(callOpts : any = {pageNum: newPage.value ?? refreshPageNum.value}) {
			if (!endpoint.value?.ready) {
				if (endpoint.value)
					console.debug(`${endpoint.value.name} isn't ready.`)
				return
			}
			//endpoint.value.calling = true

			try {
				const newArticles = await service.value.getNewArticles(endpoint.value, callOpts)

				if (callOpts.fromTop) {
					for (const id of newArticles.reverse())
						if (!articleIds.value.find(listA => listA.articleId === id))
							articleIds.value.unshift({serviceName: props.timeline.serviceName, articleId: id})
				}else {
					for (const id of newArticles)
						if (!articleIds.value.find(listA => listA.articleId === id))
							articleIds.value.push({serviceName: props.timeline.serviceName, articleId: id})
				}

				saveLists()

				const oldNewPage = newPage.value ?? -1
				const pages = remainingPages.value
				if (pages?.length)
					newPage.value = pages.filter(p => p > oldNewPage)[0] || pages[pages.length - 1]
			}finally {
				//endpoint.value.calling = false
			}
		}

		const getRandomNewArticles = () => {
			const ePackage = endpointPackage.value
			const pages = remainingPages.value
			if (ePackage.type === EndpointPackageType.PagedEndpoint && pages?.length)
				return getNewArticles({pageNum: pages[Math.floor(Math.random() * pages.length)]})
		}

		const newPage = ref(endpoint.value instanceof PagedEndpoint ? endpoint.value.basePageNum : undefined)
		const refreshPageNum = computed(() => {
			const e = endpoint.value
			if (e instanceof PagedEndpoint)
				return (e.loadedPages.value && parseInt(Object.keys(e.loadedPages.value)[0])) || 0
			else
				return undefined
		})

		const remainingPages = computed<number[]>(() => {
			if (!endpoint.value || !(endpoint.value instanceof PagedEndpoint))
				return []

			return endpoint.value.remainingPages.value
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

		function initEndpoint() {
			if (endpoint.value && endpoint.value instanceof PagedEndpoint)
				newPage.value ??= endpoint.value.basePageNum
		}

		watch(
			endpoint,
			(newEndpoint, oldEndpoint) => {
				console.debug('Changing endpoint options!')

				articleLists.value[props.timeline.articleList] = []

				initEndpoint()

				if (!articleIds.value.length && getNewArticles)
					getNewArticles()
			},
		)

		const articleIds = computed(() => {
			articleLists.value[props.timeline.articleList] ??= []
			return articleLists.value[props.timeline.articleList]
		})

		const sectionArticles = ref(false)
		const firstArticle = ref(0)
		const lastArticle = ref(30)

		const sortConfig = computed(() => props.timeline.sortConfig)

		watch(sortConfig, () => emit('saveTimeline'))

		const serviceSortMethods = computed(() => service.value.sortMethods)
		const {
			sortMethods,
			sortOption,
		} = useSortMethods(sortConfig, serviceSortMethods)
		options.push(sortOption)

		const filters = computed(() => props.timeline.filters)

		watch(filters, () => emit('saveTimeline'), {deep: true})

		const serviceFilters = computed(() => service.value.filters)
		const {filterMethods, filterOptions} = useFilters(filters, serviceFilters)
		options.push(filterOptions)

		const articles = computed(() => {
				let unsorted = articleIds.value
					.map(({serviceName, articleId}: {serviceName: string, articleId: string}) => Service.instances[serviceName].articles.value[articleId])
					.filter(a => !!a)	//Rerender happens before all of articleIds is added to service.articles

				for (const [method, opts] of Object.entries(filters.value))
					if (opts.enabled)
						unsorted = unsorted.filter(filterMethods.value[method].filter(opts.inverted, opts.config))

				let sorted = sortMethods.value[sortConfig.value.method](unsorted)
				if (sortConfig.value.reversed)
					sorted = sorted.reverse()

				if (sectionArticles.value)
					return sorted.slice(firstArticle.value, lastArticle.value)
				else
					return sorted
			},
		)

		const filteredArticleIds = computed(() => articles.value.map(a => a.id))

		initEndpoint()

		onBeforeMount(() => {
			if (!endpoint.value?.rateLimitInfo || endpoint.value.rateLimitInfo.remainingCalls > 100)
				getNewArticles()
		})

		const showOptions = ref(false)

		const columnCount = computed({
			get: () => modifiedTimelineData.value.columnCount ?? 2,
			set: val => {
				modifiedTimelineData.value.columnCount = val
				emit('changeTimeline', modifiedTimelineData.value)
			},
		})
		const rightToLeft = computed({
			get: () => modifiedTimelineData.value.rtl ?? false,
			set: val => {
				modifiedTimelineData.value.rtl = val
				emit('changeTimeline', modifiedTimelineData.value)
			},
		})
		const size = computed({
			get: () => modifiedTimelineData.value.size ?? 1,
			set: val => {
				modifiedTimelineData.value.size = val
				emit('changeTimeline', modifiedTimelineData.value)
			},
		})

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
			Log: (id : string) => console.dir(service.value.articles.value[id]),
			Expand: (id : string) => modalArticle.value = id,
		}

		const onArticleClick = ref('Hide')

		provide('service', service)

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
					onChange: ($event : Event) => {
						const target = ($event.target as HTMLInputElement)
						if (!target.checked)
							return

						modifiedTimelineData.value.container = target.value
						emit('changeTimeline', modifiedTimelineData.value)
					},
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
						min: '1',
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
			h('label', {class: 'label'}, 'Width'),
			h('div', {class: 'control'},
				h('input', {
						class: 'input',
						type: 'number',
						value: size.value,
						min: '1',
						onInput: (e : InputEvent) => size.value = parseInt((e.target as HTMLInputElement).value),
					},
				)),
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
			autoScroll,
			getRandomNewArticles,
			getNewArticles,
			EndpointPackageType,
			endpoint,
			endpointPackage,
			containers,
			service,
			articles,
			columnCount,
			rightToLeft,
			size,
			onArticleClicks,
			onArticleClick,
			containerEl,
			modalArticle,
			showOptions,
			options,
			...mediaServiceReturns,
			modifiedTimelineData,
			newPage,
			refreshPageNum,
			articleLists,
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
	flex-shrink: 0

	&:first-child
		padding: 0

.timeline.mainTimeline
	flex-grow: 2
	width: unset
	max-width: 100%

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
	flex-shrink: 8

.timelineButtons
	display: flex
	flex-wrap: nowrap

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
