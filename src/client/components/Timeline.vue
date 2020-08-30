<template lang='pug'>
	.timeline
		.timelineHeader(@click.self='scrollTop')
			b-input(v-if='isOptionsOpen' v-model='nameEdit')
			strong(v-else) {{ timelineData.name }}

			.timelineButtons
				button.refreshTimeline(@click='refresh({scrollTop: true, resetTimer: true, count: articles.length ? 20 : 50})')
					FontAwesomeIcon(icon='sync-alt' inverse size='lg')
				button.openTimelineOptions(@click='isOptionsOpen = !isOptionsOpen')
					FontAwesomeIcon(icon='ellipsis-v' inverse size='lg')

		b-collapse(:open='isOptionsOpen' animation='slide')
			.timelineOptions
				TimelineSettings.mb-4(
					:timeline-data='timelineData'
					:changesOutside='outsideChanges'
					:service='service'
					@apply-settings='applySettings($event)'
				)

				.level
					.level-left: b-button.level-item(@click='clearPosts') Clear
					.level-right: b-button.level-item(@click='remove' type='is-danger') Remove

		.timelinePosts(ref='posts' @scroll='onScroll')
			ArticleGeneric(
				v-for='article in articles'
				:key='article.id'
				:article='article'
				:compact-media='timelineData.compactMedia'
				@remove='removeArticle($event)'
			)
</template>

<script lang='ts'>
import {Component, Prop, Ref, Vue, Watch} from 'vue-property-decorator';
import {Action, Getter} from 'vuex-class';
import {SettingsData} from './TimelineSettings.vue';
import ArticleGeneric from './ArticleGeneric.vue';
import TimelineSettings from './TimelineSettings.vue';
import {TimelinePayload} from '../../core/ServerResponses';
import {Article, ArticleData} from '../../core/PostData';
import {TimelineData, TimelineOptions} from '../../core/Timeline';
import {library} from '@fortawesome/fontawesome-svg-core';
import {faEllipsisV, faSyncAlt} from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import {Service} from '../services/service';

library.add(faEllipsisV, faSyncAlt);

@Component({components: {ArticleGeneric, TimelineSettings}})
export default class Timeline extends Vue {
	@Prop({type: Object, required: true})
	readonly timelineData! : TimelineData;
	@Prop({type: Boolean, required: true})
	readonly shouldScroll! : string[];

	@Ref('posts') readonly timelinePosts! : HTMLDivElement;

	@Getter readonly getArticleData! : (article : Article) => ArticleData;

	@Action refreshEndpoint! : (payload : { service : string, endpoint : string, options : TimelineOptions }) => Promise<TimelinePayload>;

	interval = undefined as number | undefined;
	articles = [] as Article[];
	isOptionsOpen = !(this.timelineData.name && this.timelineData.endpoint) as boolean;
	nameEdit = this.timelineData.name;
	lastBottomRefreshTime = moment();
	bottomRefreshCount = 20;

	mounted() {
		if (this.enabled)
			this.resetAutoRefresh();
		//this.$root.visible(() => this.resetAutoRefresh());

		if (this.shouldScroll)
			this.$el.scrollIntoView({
				behavior: 'smooth',
			});
	}

	beforeDestroy() {
		this.disableAutoRefresh();
	}

	resetAutoRefresh(refresh = true) {
		//TODO Disable refreshing when not in focus
		window.clearInterval(this.interval);
		this.interval = window.setInterval(() => this.refresh(), this.timelineData.refreshRate);

		if (refresh)
			this.refresh().then();
	}

	disableAutoRefresh() {
		window.clearInterval(this.interval);
		this.interval = undefined;
	}

	async refresh({scrollTop = false, bottom = false, resetTimer = false, count = 0} = {}) : Promise<number> {
		//TODO Replace with visual update queue
		//console.log(`refreshing... (enabled: ${this.enabled})`);
		if (scrollTop)
			this.scrollTop();

		if (!this.enabled)
			return 0;

		try {
			let options = this.timelineData.options;
			if (this.articles.length) {
				if (bottom)
					options = {
						...options,
						max: this.articles[this.articles.length - 1].id,
						count: count || this.bottomRefreshCount,
					};
				else
					options = {
						...options,
						since: this.articles[0].id,
						count: count || (this.articles.length < 10 ? 150 : 20),
					};
			}

			const payload : TimelinePayload = await this.refreshEndpoint({
				service: this.timelineData.service,
				endpoint: this.timelineData.endpoint,
				options,
			});

			const newArticles = payload.newArticles.filter((a : Article) =>
				this.articles.findIndex(
					(b : Article) => b.id === a.id
				) < 0
			);
			this.articles.push(...newArticles);

			this.articles.sort((a : Article, b : Article) => moment(this.getArticleData(a).creationTime).milliseconds() - moment(this.getArticleData(b).creationTime).milliseconds())

			if (resetTimer)
				this.resetAutoRefresh(false);

			return newArticles.length;
		}catch (e) {
			e.message = `Timeline ${this.timelineData.name}: ${e.message}`;
			throw e;
		}
	}

	removeArticle(id : string) {
		const index = this.articles.findIndex(article => article.id === id);
		this.articles.splice(index, 1);
	}

	clearPosts() {
		this.articles = [];
	}

	remove() {
		this.$emit('remove-timeline', this.timelineData.id);
	}

	applySettings(settings : SettingsData) {
		this.timelineData.endpoint = settings.endpoint;
		this.timelineData.enabled = settings.enabled;
		this.timelineData.autoRefresh = settings.autoRefresh;
		this.timelineData.compactMedia = settings.compactMedia;
		this.timelineData.options = settings.options;

		this.timelineData.name = this.nameEdit;

		this.$emit('update-data');
	}

	scrollTop() {
		this.timelinePosts.scroll({
			top: 0,
			left: 0,
			behavior: 'smooth',
		});
	}

	onScroll({target: {scrollTop, clientHeight, scrollHeight}} : { target : Element }) {
		if (scrollTop + clientHeight >= Math.max(0, scrollHeight - 5000)) {
			if (moment().diff(this.lastBottomRefreshTime) > 10000) {
				this.refresh({bottom: true, resetTimer: true})
					.then(articleCount => {
						if (articleCount)
							this.bottomRefreshCount = 20;
						else if (this.bottomRefreshCount < 200)
							this.bottomRefreshCount += this.bottomRefreshCount == 20 ? 30 : 50;
					});

				this.lastBottomRefreshTime = moment();
			}
		}
	}

	get service() : Service {
		return (this.$store.getters as any).getService(this.timelineData.service);
	}

	get enabled() {
		const query = this.timelineData.options.q ? this.timelineData.options.q : '';

		return this.service.loggedIn &&
			this.timelineData.enabled &&
			!!this.timelineData.endpoint &&
			(this.timelineData.endpoint !== 'search' || !!query.length);
	}

	get autoRefresh() {
		return this.timelineData.autoRefresh;
	}

	get outsideChanges() {
		return this.nameEdit !== this.timelineData.name;
	}

	@Watch('enabled')
	onEnabledChanged(enabled : boolean) {
		if (enabled && this.autoRefresh)
			this.resetAutoRefresh();
		else
			this.disableAutoRefresh();
	}

	@Watch('autoRefresh')
	onAutoRefreshChanged(autoRefresh : boolean) {
		if (autoRefresh && this.enabled)
			this.resetAutoRefresh();
		else
			this.disableAutoRefresh();
	}

	@Watch('endpoint')
	onEndpointChanged(newEndpoint : string, oldEndpoint : string) {
		if (newEndpoint === oldEndpoint)
			return;

		this.clearPosts();
		this.resetAutoRefresh();
	}

	@Watch('isOptionsOpen')
	onOptionsCollapseToggled(optionsOpened : boolean) {
		if (!optionsOpened)
			this.nameEdit = this.timelineData.name;
	}
}
</script>

<style scoped lang='sass'>
@use '../bulma_overrides' as *

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
	background-color: $dark
	display: flex
	justify-content: space-between
	//cursor: pointer

	strong
		vertical-align: middle

	button
		@include borderless-button(0 1.6rem)
		height: 100%

.timelineOptions
	background-color: $scheme-main-ter
	padding: 1rem

.timelinePosts
	overflow-y: scroll
	overflow-x: hidden
	flex-grow: 1
</style>