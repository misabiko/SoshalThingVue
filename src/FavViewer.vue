<template>
	<div id='timelineContainer'>
		<Timeline
			v-for='t in timelines'
			key='t.title'
			:timeline='t'
			main-timeline='true'
			@change-container='t.container = $event'
			@change-endpoint='t.endpointIndex = $event'
			@change-service='t.serviceIndex = $event'
			@hide-soshal='setViewMode("hidden")'
			@set-viewmode='setViewMode($event)'
		></Timeline>
	</div>
	<teleport v-if='pageInfo && viewMode === "hidden"' :to='pageInfo.activatorSelector'>
		<component :is='pageInfo.activator()' @click='pageInfo.setViewMode("default")'></component>
	</teleport>
</template>

<script lang='ts'>
import {defineComponent, getCurrentInstance, PropType, ref} from 'vue'
import Timeline from '@/components/Timeline.vue'
import {Service} from '@/services'
import {PageInfo} from '@/hostpages/pageinfo'
import {TimelineData} from '@/data/timelines'

export default defineComponent({
	name: 'App',
	components: {
		Timeline,
	},
	props: {
		pageInfo: {
			type: Object as PropType<PageInfo>,
		}
	},
	setup(props) {
		const timelines = ref<TimelineData[]>([])
		const viewMode = ref(props?.pageInfo?.defaultViewMode || 'default')

		for (let i = 0; i < Service.instances.length; i++)
			timelines.value.push(...Service.instances[i].initialTimelines(i))

		function setViewMode(mode: string) {
			viewMode.value = mode
			props?.pageInfo?.setViewMode(mode)
		}

		return {timelines, setViewMode, viewMode}
	}
})
</script>

<style lang='sass'>
@import "sass"

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