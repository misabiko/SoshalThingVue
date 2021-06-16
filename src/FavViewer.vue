<template>
	<div id='timelineContainer'>
		<Timeline
			v-for='t in timelines'
			key='t.title'
			:timeline='t'
			:view-mode='viewMode'
			:view-modes='Object.keys(pageInfo.viewModes)'
			main-timeline='true'
			@change-container='t.container = $event'
			@change-endpoint='t.endpointIndex = $event'
			@change-service='t.serviceIndex = $event'
			@hide-soshal='setViewMode("hidden")'
			@set-viewmode='setViewMode($event)'
			@add-timeline='showAddTimeline = true'
		></Timeline>
	</div>
	<AddTimelineModal v-if='showAddTimeline' @add='addTimeline($event)' @close='showAddTimeline = false'/>
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
		const timelines = ref<TimelineData[]>([])
		const lastViewMode = computed(() => props.pageInfo.currentViewMode)
		const viewMode = ref(lastViewMode.value)

		for (let i = 0; i < Service.instances.length; i++)
			timelines.value.push(...Service.instances[i].initialTimelines(i))

		if (!timelines.value.length)
			console.warn('No timelines were initialized')

		function setViewMode(mode : string) {
			viewMode.value = mode
			props.pageInfo.setViewMode(mode)
		}

		const showAddTimeline = ref(false)

		function addTimeline(data : TimelineData) {

		}

		return {timelines, lastViewMode, viewMode, setViewMode, showAddTimeline, addTimeline}
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