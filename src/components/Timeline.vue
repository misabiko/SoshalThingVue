<template>
	<div class='timeline'>
		<div
			class='timelineHeader'
			@click='refresh'
		>{{ name }}</div>
		<div class='timelinePosts'>

		</div>
	</div>
</template>

<script lang='ts'>
import Vue from 'vue';
import {PostData} from '../core/PostData';

//https://stackoverflow.com/a/57124645/2692695
//Formats object into RESTful URI parameters (?param1=boop&param2=bap)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function toURI(params : { [name : string] : any }) {
	return '?' + Object.entries(params)
		.map(
			([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`
		)
		.join('&');
}

export default Vue.component('Timeline', {
	props: {
		name: String,
		endpoint: String,
		refreshRate: {
			type: Number,
			default: 90000,
		},
		options: Object,
		enabled: {
			type: Boolean,
			default: false,
		},
	},
	data: function() {
		return {
			interval: (undefined as unknown) as number,
			posts: [] as PostData[],
		}
	},
	mounted() {
		//this.autoRefresh();
		//this.$root.visible(() => this.autoRefresh());
	},
	beforeDestroy() {
		//this.disableAutoRefresh();
	},
	methods: {
		/*autoRefresh() {
			console.log(`${this.name} reset refreshing`);

			//TODO Disable refreshing when not in focus
			clearInterval(this.interval);
			this.interval = window.setInterval(() => this.refresh(), this.refreshRate);

			this.refresh().then();
		},

		disableAutoRefresh() {
			clearInterval(this.interval);
			this.interval = undefined;
		},*/

		async refresh() {
			console.log(`refreshing... (enabled: ${this.enabled})`);
			if (!this.enabled)
				return;

			const newPostDatas = await fetch('/twitter/tweets/' + this.endpoint + (this.options ? toURI(this.options) : ''))
				.then(response => response.json())
				.then(newData => newData.reverse().filter((a : PostData) => this.posts.findIndex((b : any) => b.id === a.id) < 0));

			for (const newPostData of newPostDatas) {
				newPostData.creationTime = new Date(newPostData.creationTime);

				let added = false;
				for (let i = 0; i < this.posts.length && !added; i++)
					if (newPostData.creationTime.getTime() < this.posts[i].creationTime.getTime()) {
						this.insertPost(newPostData, i);
						added = true;
					}
				if (!added)
					this.addPost(newPostData);
			}
		},

		addPost(postData : PostData) {
			this.posts.unshift(postData);
		},

		insertPost(postData : PostData, index : number) {
			this.posts.splice(index, 0, postData);
		}
	}
})
</script>

<style lang='sass'>
//TODO add scoped css
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