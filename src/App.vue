<template>
	<Sidebar @add-timeline='showAddTimeline = true'></Sidebar>
	<div id='timelineContainer'>
		<Timeline
			v-for='(t, i) in timelines'
			:key='t.title'
			:timeline='t'
			@change-container='t.container = $event'
			@change-endpoint='changeTimelineEndpoint(i, $event)'
			@change-service='t.serviceIndex = $event'
		></Timeline>
	</div>
	<AddTimelineModal
		v-if='showAddTimeline'
		:timelines='timelines'
		@add='addTimeline($event)'
		@close='showAddTimeline = false'
	/>
</template>

<script lang='ts'>
import {defineComponent, ref} from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import Timeline from '@/components/Timeline.vue'
import {TimelineData} from '@/data/timelines'
import {Service} from '@/services'
import AddTimelineModal from '@/components/Modals/AddTimelineModal.vue'

export default defineComponent({
	components: {AddTimelineModal, Timeline, Sidebar},
	setup() {
		const timelines = ref<TimelineData[]>([])

		function addTimeline(data : {endpointType? : string, endpointOptions? : any} & TimelineData) {
			if (timelines.value.find(t => t.title === data.title)) {
				console.error(`Timeline "${data.title}" already exists.`)
				return
			}

			const service = Service.instances[data.serviceIndex]
			if (data.endpointType !== undefined) {
				service.endpoints.push(new (service.endpointTypes[data.endpointType] as any)(data.endpointOptions))
				data.endpointIndex = service.endpoints.length - 1
			}

			timelines.value.push(data)
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
		}

		const showAddTimeline = ref(false)

		for (let i = 0; i < Service.instances.length; i++)
			for (const t of Service.instances[i].initialTimelines(i))
				addTimeline(t)

		if (!timelines.value.length)
			console.warn('No timelines were initialized')

		return {timelines, showAddTimeline, addTimeline, changeTimelineEndpoint}
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