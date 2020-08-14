<template>
	<div class='timeline'>
		<div
			class='timelineHeader'
			@click.self='refresh'
		>
			<span>{{ name }}</span>
			<button @click='isOptionsOpen = !isOptionsOpen'>
				<FontAwesomeIcon icon='ellipsis-v' inverse size='lg'/>
			</button>
		</div>
		<b-collapse :open='isOptionsOpen' animation='slide'>
			<div class='timelineOptions'>
				<b-field label='Name' custom-class='has-text-light'>
					<b-input v-model='name'></b-input>
				</b-field>
				<b-field label='Endpoint' custom-class='has-text-light'>
					<b-select placeholder='Select an endpoint' v-model='endpoint' required>
						<option
							v-for='ep in endpoints'
							:value='ep'
							:key='ep'
						>
							{{ ep }}
						</option>
					</b-select>
				</b-field>
			</div>
		</b-collapse>
		<div class='timelinePosts'>
			<Post
				v-for='post of posts'
				:key='post.id'
				:data='post'
			></Post>
		</div>
	</div>
</template>

<script lang='ts'>
import Vue from 'vue';
import {PostData} from '../core/PostData';
import Post from './Post';
import {library} from '@fortawesome/fontawesome-svg-core';
import {faEllipsisV} from '@fortawesome/free-solid-svg-icons';

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
			interval: (undefined as unknown) as number,
			posts: [] as PostData[],
			isOptionsOpen: !(this.initialData.name && this.initialData.endpoint),
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
	},
	computed: {
		enabled() {
			//TODO resolve data in computed
			return this.$logins.Twitter && !!(this as any).endpoint;
		}
	},
	components: {
		Post,
	},
})
</script>

<style lang='sass'>
//TODO add scoped css
@use '../variables' as *

::-webkit-scrollbar
	width: 12px
	height: 12px

::-webkit-scrollbar-thumb
	border-radius: 0
	background-color: #2f3042

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