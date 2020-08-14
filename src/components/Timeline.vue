<template>
	<div class='timeline'>
		<div
			class='timelineHeader'
			@click='refresh'
		>{{ name }}</div>
		<div class='timelinePosts'></div>
	</div>
</template>

<script>
export default {
	props: {
		name: String,
		endpoint: String,
		refreshRate: {
			type: Number,
			default: 90000,
		},
	},
	data: function() {
		return {
			interval: undefined,
			//posts: Post,
		}
	},
	mounted() {
		this.resetRefreshing();
		//this.$root.visible(() => this.resetRefreshing());
	},
	beforeDestroy() {
		clearInterval(this.interval);
	},
	methods: {
		resetRefreshing() {
			console.log(`${this.name} reset refreshing`);

			clearInterval(this.interval);
			//TODO Disable refreshing when logged out
			//TODO Disable refreshing when not in focus
			//if (this.$root.loggedIn && this.$root.visible()) {
				this.interval = window.setInterval(() => this.refresh(), this.refreshRate);

				this.refresh().then();
			//}else this.interval = undefined;
		},
		async refresh() {
			/*const newPostDatas = await fetch('/twitter/tweets/' + this.endpoint + (this.options ? toURI(this.options) : ''))
				.then(response => response.json())
				.then(newData => newData.reverse().filter((a : PostData) => this.posts.findIndex(b => b.data.id === a.id) < 0));

			for (const newPostData of newPostDatas) {
				newPostData.creationTime = new Date(newPostData.creationTime);

				let added = false;
				for (let i = 0; i < this.posts.length && !added; i++)
					if (newPostData.creationTime.getTime() < this.posts[i].data.creationTime.getTime()) {
						this.insertPost(newPostData, i);
						added = true;
					}
				if (!added)
					this.addPost(newPostData);
			}*/

			console.log(`${this.name} refreshing...`);
		}
	}
}
</script>

<style lang='sass'>
@use '../variables' as *

.timeline
	width: 500px
	min-width: 500px //TODO I don't know why this is needed
	height: 100%
	padding: 0 5px
	box-sizing: border-box
	display: flex
	flex-flow: column

.timelineHeader
	height: 50px
	line-height: 50px
	padding-left: 25px
	background-color: $element-color

.timelinePosts
	overflow-y: scroll
	flex-grow: 1
</style>