<template>
	<div id='soshalThing'>
		<Sidebar></Sidebar>
		<TimelineContainer></TimelineContainer>
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
		}
	},
	mounted() {
		this.checkLogins();
	},
	methods: {
		async checkLogins() {
			const json = await fetch('/checkLogins')
				.then(response => response.json());

			this.$logins.twitter = json.hasOwnProperty('twitter') && json.twitter;
			this.$logins.mastodon = json.hasOwnProperty('mastodon') && json.mastodon;
			this.$logins.pixiv = json.hasOwnProperty('pixiv') && json.pixiv;
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
	overflow-x: scroll
	overflow-y: hidden
	display: flex
</style>