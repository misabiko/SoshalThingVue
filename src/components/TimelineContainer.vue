<template>
	<div id='timelineContainer'>
		<Timeline :title='timelines[0].title'></Timeline>
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

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
</style>
