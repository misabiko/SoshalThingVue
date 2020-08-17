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
				v-for='postId of posts'
				:key='postId'
				:postId='postId'
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
import {State} from 'vuex-class';
import {Logins} from '../store';
import moment from 'moment';
import {TimelineData} from '../../core/Timeline';

library.add(faEllipsisV, faSyncAlt);

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
	@State('posts') readonly storePosts!: {[id: string] : PostData};

	name = this.initialData.name as string;
	service = this.initialData.service as string;
	endpoint = this.initialData.endpoint as string;
	refreshRate = this.initialData.refreshRate || 90000 as number;
	options = this.initialData.options || {} as TimelineOptions;
	interval = undefined as number | undefined;
	posts = [] as string[];
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
		//TODO Replace with visual update queue
		//console.log(`refreshing... (enabled: ${this.enabled})`);
		if (scrollTop)
			this.scrollTop();

		if (!this.enabled)
			return;

		try {
			const newPostIds : string[] = await this.$store.dispatch('refreshEndpoint', {
				service: this.service,
				endpoint: this.endpoint,
				options: this.options,
				timelinePosts: this.posts,
			});

			for (const id of newPostIds) {
				let added = false;
				for (let i = 0; i < this.posts.length && !added; i++)
					if (moment(this.storePosts[id].creationTime).isBefore(this.getPostData(i).creationTime)) {
						this.insertPost(id, i);
						added = true;
					}
				if (!added)
					this.addPost(id);
			}
		}catch (e) {
			e.message = `Timeline ${this.name}: ${e.message}`;
			throw e;
		}
	}

	getPostData(index : number) : PostData {
		return this.storePosts[this.posts[index]];
	}

	addPost(id : string) {
		this.posts.unshift(id);
	}

	insertPost(id : string, index : number) {
		this.posts.splice(index, 0, id);
	}

	removePost(id : string) {
		const index = this.posts.findIndex(postId => postId === id);
		this.posts.splice(index, 1);
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