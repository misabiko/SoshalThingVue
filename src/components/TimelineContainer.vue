<template>
	<div id='timelineContainer'>
		<Timeline
			v-for='timeline of timelines'
			:key='timeline.id'
			:tid='timeline.id'
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
	props: {
		//Not a fan of the container not owning its items :/
		timelines: {
			type: Array,
			required: true,
		},
	},
	data() {
		return {
		};
	},
	components: {Timeline}
});
</script>

<style lang='sass'>
#timelineContainer
	height: 100%
	overflow-x: scroll
	overflow-y: hidden
	display: flex
	flex-grow: 1
</style>