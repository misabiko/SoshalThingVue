<template>
	<Sidebar/>
	<div id='timelineContainer'>
		<Timeline
			v-for='(t, i) in timelines'
			:key='t.title'
			:timeline='t'
			@changeTimeline='changeTimelineData(i, $event)'
			@saveTimeline='updateLocalStorage()'
			@delete='deleteTimeline(i)'
		></Timeline>
	</div>
	<AddTimelineModal
		v-if='modal === "AddTimelineModal"'
		:timelines='timelines'
		@add='addTimeline($event)'
	/>
	<ArticleListManager
		v-if='modal === "ArticleListManager"'
	/>
	<TimelineManager
		v-if='modal === "TimelineManager"'
		:timelines='timelines'
		@changeTimelines='$event.length && (timelines = initTimelineDatas($event)) && updateLocalStorage()'
	/>
</template>

<script lang='ts'>
import {defineComponent, ref} from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import Timeline from '@/components/Timeline.vue'
import {TimelineData} from '@/data/timelines'
import {Service} from '@/services'
import AddTimelineModal from '@/components/Modals/AddTimelineModal.vue'
import ArticleListManager from '@/components/Modals/ArticleListManager.vue'
import {modal} from '@/composables/ModalManager'
import TimelineManager from '@/components/Modals/TimelineManager.vue'

export const LOCALSTORAGE_TIMELINE_TITLE = 'SoshalThing Timelines'

export default defineComponent({
	components: {ArticleListManager, AddTimelineModal, TimelineManager, Timeline, Sidebar},
	setup() {
		const timelineStorage : TimelineData[] = initTimelineDatas(JSON.parse(localStorage.getItem(LOCALSTORAGE_TIMELINE_TITLE) || '[]'))

		const timelines = ref<TimelineData[]>(timelineStorage)

		function initTimelineDatas(timelineDatas : TimelineData[]) : TimelineData[] {
			return timelineDatas.map((t : TimelineData) => {
				const copy : TimelineData = {...t}

				for (const {serviceName, endpointName} of t.endpoints) {
					const service = Service.instances[serviceName]
					if (!service.endpoints[endpointName]) {
						const options = JSON.parse(endpointName)
						if (!service.endpointTypes.hasOwnProperty(options.endpointType))
							console.error(`"${service.name}" doesn't have endpoint type "${options.endpointType}" from timeline "${t.title}"`)
						else
							service.addEndpoint(service.endpointTypes[options.endpointType].factory(options))
					}
				}

				return copy
			})
		}

		function updateLocalStorage() {
			localStorage.setItem(LOCALSTORAGE_TIMELINE_TITLE, JSON.stringify(timelines.value))
		}

		function addTimeline(data : TimelineData, serialize = true) {
			if (timelines.value.find(t => t.title === data.title)) {
				console.error(`Timeline "${data.title}" already exists.`)
				return
			}

			for (const {serviceName, endpointName} of data.endpoints) {
				const service = Service.instances[serviceName]
				if (service.endpoints.hasOwnProperty(endpointName))
					continue

				const options = JSON.parse(endpointName)
				service.addEndpoint(service.endpointTypes[options.endpointType].factory(options))
			}

			timelines.value.push(data)

			if (serialize)
				updateLocalStorage()
		}

		function changeTimelineData(timelineIndex : number, data : TimelineData) {
			if (timelines.value.find((t, i) => i != timelineIndex && t.title === data.title)) {
				console.error(`Timeline "${data.title}" already exists.`)
				return
			}

			for (const {serviceName, endpointName} of data.endpoints) {
				const service = Service.instances[serviceName]
				if (service.endpoints.hasOwnProperty(endpointName))
					continue

				const options = JSON.parse(endpointName)
				service.addEndpoint(service.endpointTypes[options.endpointType].factory(options))
			}

			timelines.value[timelineIndex] = {...data}

			updateLocalStorage()
		}

		function deleteTimeline(timelineIndex : number) {
			timelines.value.splice(timelineIndex, 1)
			updateLocalStorage()
		}

		const showAddTimeline = ref(false)
		const showArticleListManager = ref(false)

		if (!timelines.value.length) {
			for (const service of Object.values(Service.instances))
				for (const t of service.initialTimelines())
					addTimeline(t, false)

			updateLocalStorage()
		}

		return {
			timelines,
			showAddTimeline,
			showArticleListManager,
			modal,
			addTimeline,
			changeTimelineData,
			deleteTimeline,
			updateLocalStorage,
			initTimelineDatas,
		}
	},
})
</script>

<style lang='sass'>
@use '~@/sass/core' as *
@import "~bulma/bulma.sass"

@include pretty-scrollbar

.input.is-static
	color: $text

.icon
	color: $white-ter

html
	overflow-y: hidden

body
	margin: 0

#app
	height: 100vh
	display: flex
	-webkit-font-smoothing: antialiased
	-moz-osx-font-smoothing: grayscale
</style>

<style scoped lang='sass'>
@use '~@/sass/core' as *

#timelineContainer
	@include pretty-scrollbar

	height: 100%
	overflow-x: scroll
	display: flex
	flex-grow: 1
</style>