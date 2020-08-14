<template>
	<div id='timelineContainer'>
		<Timeline
			v-for='timeline of timelines'
			:key='timeline.id'
			:initial-data='timeline'
			:endpoints='endpoints'
		></Timeline>
	</div>
</template>

<script lang='ts'>
import Vue from 'vue';
import Timeline from "./Timeline";

export default Vue.component('TimelineContainer', {
	props: {
		//Not a fan of the container not owning its items :/
		timelines: {
			type: Array,
			required: true,
		},
	},
	data() {
		return {
			endpoints: ['home_timeline', 'search']
		};
	},
	components: {Timeline}
});
</script>

<style scoped lang='sass'>
@use '../variables' as *

@include pretty-scrollbar

#timelineContainer
	height: 100%
	overflow-x: scroll
	overflow-y: hidden
	display: flex
	flex-grow: 1
</style>