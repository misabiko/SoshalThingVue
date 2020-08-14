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
			console.log('Logged in: ', this.$logins);
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

#soshalThing
	color: white
	background-color: $bg-color
	height: 100vh
	overflow-x: scroll
	overflow-y: hidden
</style>