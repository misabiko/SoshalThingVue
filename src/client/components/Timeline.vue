<template lang='pug'>
	.timeline
		.timelineHeader(@click.self='refresh')
			span {{ name }}
			button(@click='isOptionsOpen = !isOptionsOpen')
				FontAwesomeIcon(icon='ellipsis-v' inverse size='lg')

		b-collapse(:open='isOptionsOpen' animation='slide')
			.timelineOptions
				b-field(label='Name' custom-class='has-text-light')
					b-input(v-model='name')

				b-field(label='Endpoint' custom-class='has-text-light')
					b-select(placeholder='Select an endpoint' v-model='endpoint' required)
						option(
							v-for='ep in endpoints'
							:value='ep'
							:key='ep'
						) {{ ep }}

				TimelineSearchOptions(
					v-if="endpoint === 'search'"
					:options.sync='options'
				)

				.level
					.level-left: b-button.level-item(@click='clearPosts') Clear
					.level-right: b-button.level-item(@click='remove' type='is-danger') Remove

		.timelinePosts
			Post(
				v-for='post of posts'
				:key='post.id'
				:data='post'
				@update-data='updateData'
				@remove='removePost($event)'
			)
</template>

<script lang='ts'>
import Vue from 'vue';
import {PostData} from '../../core/PostData';
import Post from './Post.vue';
import {library} from '@fortawesome/fontawesome-svg-core';
import {faEllipsisV} from '@fortawesome/free-solid-svg-icons';
import TimelineSearchOptions from './TimelineSearchOptions.vue';

library.add(faEllipsisV);

//https://stackoverflow.com/a/57124645/2692695
function toURI(params : { [name : string] : any }) {
	return '?' + Object.entries(params)
		.map(
			([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`
		)
		.join('&');
}

export default Vue.component('Timeline', {
	props: ['initialData', 'endpoints'],
	data: function() {
		return {
			name: this.initialData.name,
			endpoint: this.initialData.endpoint,
			refreshRate: this.initialData.refreshRate || 90000,
			options: this.initialData.options,
			interval: undefined as number | undefined,
			posts: [] as PostData[],
			isOptionsOpen: !(this.initialData.name && this.initialData.endpoint),
		}
	},
	mounted() {
		if ((this as any).enabled)
			(this as any).resetAutoRefresh();
		//this.$root.visible(() => this.resetAutoRefresh());
	},
	beforeDestroy() {
		(this as any).disableAutoRefresh();
	},
	methods: {
		resetAutoRefresh() {
			//TODO Disable refreshing when not in focus
			window.clearInterval(this.interval);
			this.interval = window.setInterval(() => this.refresh(), this.refreshRate);

			this.refresh().then();
		},

		disableAutoRefresh() {
			window.clearInterval(this.interval);
			this.interval = undefined;
		},

		async refresh() {
			console.log(`refreshing... (enabled: ${this.enabled})`);
			if (!this.enabled)
				return;

			const response = await fetch('/twitter/tweets/' + this.endpoint + (this.options ? toURI(this.options) : ''));

			if (response.status == 401) {
				//TODO Alert the message
				console.error('Lost connection to Twitter');
				this.$store.commit('setLogin', {service: 'Twitter', login: false});
				return;
			}else if (!response.ok)
				throw new Error(`Timeline ${this.name}: Server error on refresh`);

			const newPostDatas = await response.json().then(newData =>
				newData.reverse().filter((a : PostData) => this.posts.findIndex((b : any) => b.id === a.id) < 0)
			);

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
		},

		removePost(id : string) {
			const index = this.posts.findIndex((post : PostData) => post.id === id);
			this.posts.splice(index, 1);
		},

		updateData(postData : PostData) {
			const index = this.posts.findIndex(oldData => oldData.id == postData.id);
			Object.assign(this.posts[index], postData);
			this.posts[index].creationTime = new Date(this.posts[index].creationTime);
		},

		clearPosts() {
			this.posts = [];
		},

		remove() {
			this.$emit('remove-timeline', this.initialData.id);
		}
	},
	computed: {
		enabled() {
			//TODO resolve data in computed
			return (this.$store.state as any).logins.Twitter &&
				!!(this as any).endpoint &&
				((this as any).endpoint !== 'search' || ((this as any).options && !!(this as any).options.q.length));
		}
	},
	watch: {
		enabled(newEnabled, _oldEnabled) {
			if (newEnabled)
				(this as any).resetAutoRefresh();
			else
				(this as any).disableAutoRefresh();
		},

		endpoint(newEndpoint, oldEndpoint) {
			if (newEndpoint === oldEndpoint)
				return;

			(this as any).clearPosts();
			(this as any).resetAutoRefresh();
		}
	},
	components: {
		Post,
		TimelineSearchOptions,
	},
})
</script>

<style scoped lang='sass'>
@use '../variables' as *

@include pretty-scrollbar

.timeline
	width: 500px
	min-width: 500px
	//TODO I don't know why this is needed
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
	display: flex
	justify-content: space-between
	cursor: pointer

	button
		@include borderless-button(0 1.6rem)
		height: 100%

.timelineOptions
	background-color: $container-color
	padding: 1rem

.timelinePosts
	overflow-y: scroll
	flex-grow: 1
</style>