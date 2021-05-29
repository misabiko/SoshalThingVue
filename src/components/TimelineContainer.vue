<template>
	<div id='timelineContainer'>
		<Timeline :timeline='timelines[0]'></Timeline>
	</div>
</template>

<script lang="ts">
import Timeline from '@/components/Timeline.vue'
import {defineComponent} from 'vue'

export default defineComponent({
	components: {Timeline},
	props: {
		timelines: Array
	},
	setup(props) {

	}
})
</script>

<style scoped lang="sass">
</style>
