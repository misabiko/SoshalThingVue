<template>
	<Sidebar v-if='showSidebar' @addTimeline='showAddTimeline = true' @showListManager='showArticleListManager = true'></Sidebar>
	<div id='timelineContainer'>
		<template v-for='(t, i) in timelines'>
			<Timeline
				v-if='!showSidebar && !i'
				:key='t.title'
				:timeline='t'
				:viewMode='viewMode'
				:viewModes='Object.keys(pageInfo.viewModes)'
				:mainTimeline='!showSidebar'
				@changeTimeline='changeTimelineData(i, $event)'
				@hideSoshal='setViewMode("hidden")'
				@setViewmode='setViewMode($event)'
				@addTimeline='showAddTimeline = true'
				@delete='deleteTimeline(i)'
				@showSidebar='showSidebar = !showSidebar'
			></Timeline>
			<Timeline
				v-else
				:key='t.title'
				:timeline='t'
				@changeTimeline='changeTimelineData(i, $event)'
				@delete='deleteTimeline(i)'
			></Timeline>
		</template>
	</div>
	<AddTimelineModal
		v-if='modal === "AddTimelineModal"'
		:timelines='timelines'
		@add='addTimeline($event)'
	/>
	<ArticleListManager
		v-if='modal === "ArticleListManager"'
	/>
	<teleport v-if='pageInfo && viewMode === "hidden"' :to='pageInfo.activatorSelector'>
		<component :is='pageInfo.activator' @click='setViewMode(lastViewMode)'/>
	</teleport>
</template>

<script lang='ts'>
import {computed, defineComponent, PropType, ref} from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import Timeline from '@/components/Timeline.vue'
import {TimelineData} from '@/data/timelines'
import {Service} from '@/services'
import {PageInfo} from '@/hostpages/pageinfo'
import AddTimelineModal from '@/components/Modals/AddTimelineModal.vue'
import ArticleListManager from '@/components/Modals/ArticleListManager.vue'
import {modal} from '@/composables/ModalManager'

export default defineComponent({
	name: 'FavViewer',
	components: {ArticleListManager, AddTimelineModal, Timeline, Sidebar},
	props: {
		pageInfo: {
			type: Object as PropType<PageInfo>,
			required: true,
		}
	},
	setup(props) {
		const timelines = ref<TimelineData[]>([])

		function addTimeline(data : TimelineData) {
			if (timelines.value.find(t => t.title === data.title)) {
				console.error(`Timeline "${data.title}" already exists.`)
				return
			}

			const service = Service.instances[data.serviceName]
			if (data.endpointOptions !== undefined) {
				service.addEndpoint(service.endpointTypes[data.endpointOptions.endpointType].factory(data.endpointOptions))
				data.endpointName = Object.keys(service.endpoints)[Object.keys(service.endpoints).length - 1]
			}

			delete data.endpointOptions
			timelines.value.push(data)
		}

		function changeTimelineData(timelineIndex : number, data : TimelineData) {
			if (timelines.value.find((t, i) => i != timelineIndex && t.title === data.title)) {
				console.error(`Timeline "${data.title}" already exists.`)
				return
			}

			const service = Service.instances[data.serviceName]
			if (data.endpointOptions !== undefined) {
				service.addEndpoint(service.endpointTypes[data.endpointOptions.endpointType].factory(data.endpointOptions))
				data.endpointName = Object.keys(service.endpoints)[Object.keys(service.endpoints).length - 1]
			}

			delete data.endpointOptions
			timelines.value[timelineIndex] = {...data}
		}

		function deleteTimeline(timelineIndex : number) {
			timelines.value.splice(timelineIndex, 1)
		}

		const showAddTimeline = ref(false)
		const showArticleListManager = ref(false)

		if (!timelines.value.length)
			for (const service of Object.values(Service.instances))
				for (const t of service.initialTimelines())
					addTimeline(t)

		if (!timelines.value.length)
			console.warn('No timelines were initialized')

		const showSidebar = ref(false)

		const lastViewMode = computed(() => props.pageInfo.currentViewMode)
		const viewMode = ref(lastViewMode.value)

		function setViewMode(mode : string) {
			viewMode.value = mode
			props.pageInfo.setViewMode(mode)
		}

		return {timelines, showAddTimeline, showArticleListManager, modal, addTimeline, changeTimelineData, deleteTimeline, showSidebar, lastViewMode, viewMode, setViewMode}
	}
})
</script>

<style lang='sass'>
@use 'sass/core' as *
@import "~bulma/sass/utilities/_all.sass"
@import "~bulma/sass/form/_all.sass"
@import "~bulma/sass/components/level.sass"
@import "~bulma/sass/components/modal.sass"
@import "~bulma/sass/components/dropdown.sass"
@import "~bulma/sass/components/card.sass"
@import "~bulma/sass/elements/button.sass"
@import "~bulma/sass/elements/icon.sass"
@import "~bulma/sass/elements/box.sass"

.icon
	color: $white-ter

.icon.darkIcon
	color: $black-ter

#favviewer
	width: 100vw
	height: 90vh
	display: flex
	-webkit-font-smoothing: antialiased
	-moz-osx-font-smoothing: grayscale
</style>

<style scoped lang='sass'>
@use 'sass/core' as *

#timelineContainer
	@include pretty-scrollbar

	height: 100%
	overflow-x: auto
	display: flex
	flex-grow: 1
</style>