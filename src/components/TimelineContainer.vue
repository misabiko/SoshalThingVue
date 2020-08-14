<template>
	<div id='timelineContainer'>
		<Timeline
			v-for='timeline of timelines'
			:key='timeline.id'
			:name='timeline.name'
			:endpoint='timeline.endpoint'
			:refresh-rate='timeline.refreshRate'
		></Timeline>
	</div>
</template>

<script lang='ts'>
import Vue from 'vue';
import Timeline from "./Timeline";

export default Vue.component('TimelineContainer', {
	data() {
		return {
			timelines: [
				{id: 0, name: 'Home', endpoint: 'home_timeline'},
			],
		}
	},
	components: {Timeline}
});
</script>

<style lang='sass'>
	#timelineContainer
		width: 100%
		height: 100%
		padding-left: 60px
		display: flex
		flex-wrap: nowrap
</style>