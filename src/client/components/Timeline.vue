<template lang='pug'>
	.timeline
		.timelineHeader(@click.self='scrollTop')
			strong.has-text-white {{ name }}
			.timelineButtons
				button(@click='refresh(true)')
					FontAwesomeIcon(icon='sync-alt' inverse size='lg')
				button(@click='isOptionsOpen = !isOptionsOpen')
					FontAwesomeIcon(icon='ellipsis-v' inverse size='lg')

		b-collapse(:open='isOptionsOpen' animation='slide')
			.timelineOptions
				TimelineSettings.mb-4(
					:name='name'
					:endpoint='endpoint'
					:options='options'
					:endpoints='endpoints'
					@apply-settings='applySettings($event)'
				)

				.level
					.level-left: b-button.level-item(@click='clearPosts') Clear
					.level-right: b-button.level-item(@click='remove' type='is-danger') Remove

		.timelinePosts(ref='posts')
			Post(
				v-for='post of posts'
				:key='post.id'
				:data='post'
				@update-data='updateData'
				@remove='removePost($event)'
			)
</template>

<script lang='ts'>
import {Vue, Component, Prop, Watch, Ref} from 'vue-property-decorator';
import {PostData} from '../../core/PostData';
import Post from './Post.vue';
import TimelineSettings, {TimelineOptions} from './TimelineSettings';
import {library} from '@fortawesome/fontawesome-svg-core';
import {faEllipsisV, faSyncAlt} from '@fortawesome/free-solid-svg-icons';
import {SettingsData} from './TimelineSettings.vue';
import {TimelineData} from './TimelineContainer.vue';
import {State} from 'vuex-class';
import {Logins} from '../store';

library.add(faEllipsisV, faSyncAlt);

//https://stackoverflow.com/a/57124645/2692695
function toURI(params : { [name : string] : any }) {
	return '?' + Object.entries(params)
		.map(
			([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`
		)
		.join('&');
}

@Component({
	components: {Post, TimelineSettings}
})
export default class Timeline extends Vue {
	@Prop({type: Object, required: true})
	readonly initialData!: TimelineData;
	@Prop({type: Array, required: true})
	readonly endpoints!: string[];

	@Ref('posts') readonly timelinePosts!: HTMLDivElement;

	@State('logins') readonly logins!: Logins;

	name = this.initialData.name as string;
	endpoint = this.initialData.endpoint as string;
	refreshRate = this.initialData.refreshRate || 90000 as number;
	options = this.initialData.options || {} as TimelineOptions;
	interval = undefined as number | undefined;
	posts = [] as PostData[];
	isOptionsOpen = !(this.initialData.name && this.initialData.endpoint) as boolean;

	mounted() {
		if (this.enabled)
			this.resetAutoRefresh();
		//this.$root.visible(() => this.resetAutoRefresh());

		this.$el.scrollIntoView({
			behavior: 'smooth'
		});
	}

	beforeDestroy() {
		this.disableAutoRefresh();
	}

	resetAutoRefresh() {
		//TODO Disable refreshing when not in focus
		window.clearInterval(this.interval);
		this.interval = window.setInterval(() => this.refresh(), this.refreshRate);

		this.refresh().then();
	}

	disableAutoRefresh() {
		window.clearInterval(this.interval);
		this.interval = undefined;
	}

	async refresh(scrollTop = false) {
		console.log(`refreshing... (enabled: ${this.enabled})`);
		if (scrollTop)
			this.scrollTop();

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
	}

	addPost(postData : PostData) {
		this.posts.unshift(postData);
	}

	insertPost(postData : PostData, index : number) {
		this.posts.splice(index, 0, postData);
	}

	removePost(id : string) {
		const index = this.posts.findIndex((post : PostData) => post.id === id);
		this.posts.splice(index, 1);
	}

	updateData(postData : PostData) {
		const index = this.posts.findIndex(oldData => oldData.id == postData.id);
		Object.assign(this.posts[index], postData);
		this.posts[index].creationTime = new Date(this.posts[index].creationTime);
	}

	clearPosts() {
		this.posts = [];
	}

	remove() {
		this.$emit('remove-timeline', this.initialData.id);
	}

	applySettings(settings : SettingsData) {
		this.name = settings.name;
		this.endpoint = settings.endpoint;
		this.options = settings.options;
	}

	scrollTop() {
		this.timelinePosts.scroll({
			top: 0,
			left: 0,
			behavior: 'smooth',
		});
	}

	get enabled() {
		const query = this.options && this.options.q ? this.options.q : '';

		return this.logins.Twitter &&
			!!this.endpoint &&
			(this.endpoint !== 'search' || !!query.length);
	}

	@Watch('enabled')
	onEnabledChanged(newEnabled: string) {
		if (newEnabled)
			this.resetAutoRefresh();
		else
			this.disableAutoRefresh();
	}

	@Watch('endpoint')
	onEndpointChanged(newEndpoint: string, oldEndpoint: string) {
		if (newEndpoint === oldEndpoint)
			return;

		this.clearPosts();
		this.resetAutoRefresh();
	}
}
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
	//cursor: pointer

	strong
		vertical-align: middle

	button
		@include borderless-button(0 1.6rem)
		height: 100%

.timelineOptions
	background-color: $container-color
	padding: 1rem

.timelinePosts
	overflow-y: scroll
	overflow-x: hidden
	flex-grow: 1
</style>