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
				@change-endpoint='t.endpointIndex = $event'
				@change-service='t.serviceIndex = $event'
				@hide-soshal='setViewMode("hidden")'
				@set-viewmode='setViewMode($event)'
				@add-timeline='showAddTimeline = true'
			></Timeline>
			<Timeline
				v-else
				:key='t.title'
				:timeline='t'
				@change-container='t.container = $event'
				@change-endpoint='t.endpointIndex = $event'
				@change-service='t.serviceIndex = $event'
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

		function addTimeline(data : TimelineData) {
			if (timelines.value.find(t => t.title === data.title)) {
				console.error(`Timeline "${data.title}" already exists.`)
				return
			}

			//I will regret this, setting endpointIndex to length + typeIndex so it can be created here
			const service = Service.instances[data.serviceIndex]
			if (data.endpointIndex !== undefined && data.endpointIndex >= service.endpoints.length) {
				service.endpoints.push(new (service.endpointTypes[data.endpointIndex - service.endpoints.length] as any)())
				data.endpointIndex -= service.endpoints.length
			}

			timelines.value.push(data)
		}

		const showAddTimeline = ref(false)

		for (let i = 0; i < Service.instances.length; i++)
			for (const t of Service.instances[i].initialTimelines(i))
				addTimeline(t)

		if (!timelines.value.length)
			console.warn('No timelines were initialized')

		const lastViewMode = computed(() => props.pageInfo.currentViewMode)
		const viewMode = ref(lastViewMode.value)

		function setViewMode(mode : string) {
			viewMode.value = mode
			props.pageInfo.setViewMode(mode)
		}

		return {timelines, showAddTimeline, addTimeline, lastViewMode, viewMode, setViewMode}
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