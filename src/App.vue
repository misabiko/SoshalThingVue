<template>
	<Sidebar @add-timeline='showAddTimeline = true'></Sidebar>
	<div id='timelineContainer'>
		<Timeline
			v-for='t in timelines'
			key='t.title'
			:timeline='t'
			@change-container='t.container = $event'
			@change-endpoint='t.endpointIndex = $event'
			@change-service='t.serviceIndex = $event'
		></Timeline>
	</div>
	<AddTimelineModal v-if='showAddTimeline' @add='addTimeline($event)' @close='showAddTimeline = false'/>
</template>

<script lang="ts">
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

		for (let i = 0; i < Service.instances.length; i++)
			timelines.value.push(...Service.instances[i].initialTimelines(i))

		if (!timelines.value.length)
			console.warn('No timelines were initialized')

		const showAddTimeline = ref(false)

		function addTimeline(data : TimelineData) {

		}

		return {timelines, showAddTimeline, addTimeline}
	}
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