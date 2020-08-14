<template lang='pug'>
	#soshalThing.has-text-light
		Sidebar(@new-timeline='addTimeline')
		TimelineContainer(:timelines='timelines')
</template>

<script lang='ts'>
import Vue from 'vue';
import TimelineContainer from "./TimelineContainer";
import Sidebar from "./Sidebar";

export default Vue.component('App', {
	data: function() {
		return {
			timelines: [
				{id: 0, name: 'Home', endpoint: 'home_timeline'}
			],
		}
	},
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
		addTimeline() {
			const id = this.getUniqueId();
			this.timelines.push({id, name: 'Timeline #' + id, endpoint: ''});
		},
		getUniqueId() : number {
			//Feels clunky
			let id = 0;
			const ids = this.timelines.map(timeline => timeline.id);
			while (ids.includes(id))
				id++;

			return id;
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