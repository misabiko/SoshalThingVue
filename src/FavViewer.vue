<template>
	<div id='timelineContainer'>
		<template v-for='(t, i) in timelines'>
			<Timeline
				v-if='!i'
				:key='t.title'
				:timeline='t'
				:view-mode='viewMode'
				:view-modes='Object.keys(pageInfo.viewModes)'
				main-timeline
				@change-container='t.container = $event'
				@change-endpoint='changeTimelineEndpoint(i, $event)'
				@change-service='t.serviceIndex = $event'
				@hide-soshal='setViewMode("hidden")'
				@set-viewmode='setViewMode($event)'
				@add-timeline='showAddTimeline = true'
				@delete='deleteTimeline(i)'
			></Timeline>
			<Timeline
				v-else
				:key='t.title'
				:timeline='t'
				@change-container='t.container = $event'
				@change-endpoint='changeTimelineEndpoint(i, $event)'
				@change-service='t.serviceIndex = $event'
				@delete='deleteTimeline(i)'
			></Timeline>
		</template>
	</div>
	<AddTimelineModal
		v-if='showAddTimeline'
		:timelines='timelines'
		@add='addTimeline($event)'
		@close='showAddTimeline = false'
	/>
	<teleport v-if='pageInfo && viewMode === "hidden"' :to='pageInfo.activatorSelector'>
		<component :is='pageInfo.activator' @click='setViewMode(lastViewMode)'></component>
	</teleport>
</template>

<script lang='ts'>
import {computed, defineComponent, PropType, ref} from 'vue'
import Timeline from '@/components/Timeline.vue'
import {TimelineData} from '@/data/timelines'
import {Service} from '@/services'
import {PageInfo} from '@/hostpages/pageinfo'
import AddTimelineModal from '@/components/Modals/AddTimelineModal.vue'

const LOCALSTORAGE_TIMELINE_TITLE = 'SoshalThing Timelines'

export default defineComponent({
	name: 'FavViewer',
	components: {AddTimelineModal, Timeline},
	props: {
		pageInfo: {
			type: Object as PropType<PageInfo>,
			required: true,
		}
	},
	setup(props) {
		const timelineStorage = localStorage.getItem(LOCALSTORAGE_TIMELINE_TITLE)
		const timelines = ref<TimelineData[]>(timelineStorage ? JSON.parse(timelineStorage) : [])

		function updateLocalStorage() {
			localStorage.setItem(LOCALSTORAGE_TIMELINE_TITLE, JSON.stringify(timelines.value))
		}

		function addTimeline(data : TimelineData & { newEndpointOptions? : any }, serialize = true) {
			if (timelines.value.find(t => t.title === data.title)) {
				console.error(`Timeline "${data.title}" already exists.`)
				return
			}

			const service = Service.instances[data.serviceIndex]
			if (data.newEndpointOptions !== undefined) {
				service.endpoints.push(service.endpointTypes[data.newEndpointOptions.endpointType].factory(data.newEndpointOptions))
				data.endpointIndex = service.endpoints.length - 1
			}

			delete data.newEndpointOptions
			timelines.value.push(data)

			if (serialize)
				updateLocalStorage()
		}

		function changeTimelineEndpoint(timelineIndex : number, options : { serviceIndex? : number, endpointType? : number } & any) {
			const timeline = timelines.value[timelineIndex]

			const service = Service.instances[options.serviceIndex ?? timeline.serviceIndex]

			let endpointConstructor : any
			if (options.endpointType === undefined) {
				if (timeline.endpointIndex === undefined) {
					console.warn('No endpoint chosen.')
					return
				}else
					endpointConstructor = service.endpointTypes[service.endpoints[timeline.endpointIndex].constructor.name]
			}else
				endpointConstructor = service.endpointTypes[options.endpointType]

			const endpoint = endpointConstructor(options)
			service.endpoints.push(endpoint)

			timelines.value[timelineIndex].endpointIndex = service.endpoints.length - 1

			updateLocalStorage()
		}

		function deleteTimeline(timelineIndex : number) {
			timelines.value.splice(timelineIndex, 1)
			updateLocalStorage()
		}

		const showAddTimeline = ref(false)

		if (!timelines.value.length) {
			for (let i = 0; i < Service.instances.length; i++)
				for (const t of Service.instances[i].initialTimelines(i))
					addTimeline(t, false)

			updateLocalStorage()
		}

		if (!timelines.value.length)
			console.warn('No timelines were initialized')

		const lastViewMode = computed(() => props.pageInfo.currentViewMode)
		const viewMode = ref(lastViewMode.value)

		function setViewMode(mode : string) {
			viewMode.value = mode
			props.pageInfo.setViewMode(mode)
		}

		return {timelines, showAddTimeline, addTimeline, changeTimelineEndpoint, deleteTimeline, lastViewMode, viewMode, setViewMode}
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