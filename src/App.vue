<template>
	<div id='soshalThing'>
		<Sidebar @new-timeline='addTimeline'></Sidebar>
		<TimelineContainer :timelines='timelines'></TimelineContainer>
	</div>
</template>

<script lang='ts'>
import Vue from 'vue';
import TimelineContainer from "./components/TimelineContainer";
import Sidebar from "./components/Sidebar";

export default Vue.component('App', {
	data: function() {
		return {
			loggedIn: false,
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

			this.$logins.twitter = json.hasOwnProperty('twitter') && json.twitter;
			this.$logins.mastodon = json.hasOwnProperty('mastodon') && json.mastodon;
			this.$logins.pixiv = json.hasOwnProperty('pixiv') && json.pixiv;
		},
		addTimeline() {
			this.timelines.push({id: this.getUniqueId(), name: '', endpoint: ''});
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
@use 'variables' as *
@import '../node_modules/bulma/bulma.sass'

::-webkit-scrollbar
	width: 12px
	height: 12px

::-webkit-scrollbar-thumb
	border-radius: 0
	background-color: #2f3042

body
	background-color: $bg-color
	margin: 0
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif
	-webkit-font-smoothing: antialiased
	-moz-osx-font-smoothing: grayscale

#soshalThing
	color: white
	background-color: $bg-color
	height: 100vh
	display: flex
</style>