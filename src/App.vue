<template>
	<Sidebar @addTimeline='showAddTimeline = true' @showListManager='showArticleListManager = true'></Sidebar>
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
		v-if='showAddTimeline'
		:timelines='timelines'
		@add='addTimeline($event)'
		@close='showAddTimeline = false'
	/>
	<ArticleListManager
		v-if='showArticleListManager'
		@close='showArticleListManager = false'
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

export const LOCALSTORAGE_TIMELINE_TITLE = 'SoshalThing Timelines'

export default defineComponent({
	components: {ArticleListManager, AddTimelineModal, Timeline, Sidebar},
	setup() {
		const timelineStorage : TimelineData[] = JSON.parse(localStorage.getItem(LOCALSTORAGE_TIMELINE_TITLE) || '[]')
			.map((t : TimelineData) => {
				const copy = {...t}
				if (t.endpointOptions) {
					const service = Service.instances[t.serviceIndex]
					service.endpoints.push(service.endpointTypes[t.endpointOptions.endpointType].factory(t.endpointOptions))
					copy.endpointIndex = service.endpoints.length - 1
				}

				delete copy.endpointOptions
				return copy
			})

		const timelines = ref<TimelineData[]>(timelineStorage)

		function updateLocalStorage() {
			localStorage.setItem(LOCALSTORAGE_TIMELINE_TITLE, JSON.stringify(timelines.value.map(t => {
				const copy : TimelineData = {...t}
				if (copy.endpointIndex !== undefined) {
					const service = Service.instances[copy.serviceIndex]
					copy.endpointOptions = service.endpoints[copy.endpointIndex].getKeyOptions()
				}

				delete copy.endpointIndex
				return copy
			})))
		}

		function addTimeline(data : TimelineData, serialize = true) {
			if (timelines.value.find(t => t.title === data.title)) {
				console.error(`Timeline "${data.title}" already exists.`)
				return
			}

			const service = Service.instances[data.serviceIndex]
			if (data.endpointOptions !== undefined) {
				service.endpoints.push(service.endpointTypes[data.endpointOptions.endpointType].factory(data.endpointOptions))
				data.endpointIndex = service.endpoints.length - 1
			}

			delete data.endpointOptions
			timelines.value.push(data)

			if (serialize)
				updateLocalStorage()
		}

		function changeTimelineData(timelineIndex : number, data : TimelineData) {
			if (timelines.value.find((t, i) => i != timelineIndex && t.title === data.title)) {
				console.error(`Timeline "${data.title}" already exists.`)
				return
			}

			const service = Service.instances[data.serviceIndex]
			if (data.endpointOptions !== undefined) {
				service.endpoints.push(service.endpointTypes[data.endpointOptions.endpointType].factory(data.endpointOptions))
				data.endpointIndex = service.endpoints.length - 1
			}

			delete data.endpointOptions
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
			for (let i = 0; i < Service.instances.length; i++)
				for (const t of Service.instances[i].initialTimelines(i))
					addTimeline(t, false)

			updateLocalStorage()
		}

		if (!timelines.value.length)
			console.warn('No timelines were initialized')

		return {timelines, showAddTimeline, showArticleListManager, addTimeline, changeTimelineData, deleteTimeline, updateLocalStorage}
	},
})
</script>

<style lang='sass'>
@use 'sass/core' as *
@import "~bulma/bulma.sass"

@include pretty-scrollbar

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
@use 'sass/core' as *

#timelineContainer
	@include pretty-scrollbar

	height: 100%
	overflow-x: auto
	display: flex
	flex-grow: 1
</style>