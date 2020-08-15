<template lang='pug'>
	#soshalThing.has-text-light
		Sidebar(@new-timeline='newTimeline')
		TimelineContainer(ref='timelineContainer')
</template>

<script lang='ts'>
import Vue from 'vue';
import TimelineContainer from './TimelineContainer';
import Sidebar from './Sidebar';

export default Vue.component('App', {
	mounted() {
		//TODO resolve methods in mounted
		(this as any).checkLogins();
	},
	methods: {
		async checkLogins() {
			const json = await fetch('/checkLogins')
				.then(response => response.json());

			this.$store.commit('updateLogins', json);
		},
		newTimeline() : void {
			//TODO resolve refs
			(this.$refs.timelineContainer as any).addTimeline();
		}
	},
	components: {
		TimelineContainer,
		Sidebar
	},
});
</script>

<style lang='sass'>
@use '../variables' as *
@import '~bulma'

#soshalThing
	height: 100vh
	display: flex
	background-color: $bg-color
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif
	-webkit-font-smoothing: antialiased
	-moz-osx-font-smoothing: grayscale
</style>