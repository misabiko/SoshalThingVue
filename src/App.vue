<template>
	<Sidebar></Sidebar>
	<TimelineContainer timelines='[]'></TimelineContainer>
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import TimelineContainer from '@/components/TimelineContainer.vue'
import {TimelineData} from '@/components/Timeline.vue'

export default defineComponent({
	components: {TimelineContainer, Sidebar},
	setup() {
		return {
			timelines: ref<TimelineData[]>([
				{
					title: 'Home',
					serviceIndex: 0,
					endpointIndex: 0,
					container: 'ColumnContainer'
				}
			])
		}
	}
})
</script>

<style lang="sass">
@import "sass"

</style>
