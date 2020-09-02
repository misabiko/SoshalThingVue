<template lang='pug'>
	.timeline(:class='{simpleTimeline: columns === 1}' :style="{flex: '0 0 ' + (columnWidth * 500) + 'px', width: (columnWidth * 500) + 'px'}")
		.timelineHeader(@click.self='scrollTop')
			b-input(v-if='isOptionsOpen' v-model='nameEdit')
			strong(v-else) {{ timelineData.name }}

			.timelineButtons
				button.refreshTimeline(@click='refresh({scrollTop: true, resetTimer: true})')
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

				b-field(label='Columns')
					b-numberinput(v-model='columns' min='1')

				b-field(label='Width')
					b-numberinput(v-model='columnWidth' min='1')

				.level
					.level-left: b-button.level-item(@click='clearPosts') Clear
					.level-right
						b-button.level-item(@click='autoScrolling = true; isOptionsOpen = false;') AutoScroll
						b-button.level-item(@click='remove' type='is-danger') Remove

		TimelineArticles(
			ref='timelineArticles'
			:columns='columns'
			:articles='articles'
			:service='service'
			:compact-media='timelineData.compactMedia'
			:scrolling.sync='autoScrolling'
			@scroll='onScroll'
			@wheel='onWheel'
			@remove-article='removeArticle($event)'
		)
</template>

<script lang='ts'>
import {Component, Prop, Ref, Vue, Watch} from 'vue-property-decorator';
import {SettingsData} from './TimelineSettings.vue';
import ArticleGeneric from '../Articles/ArticleGeneric.vue';
import TimelineSettings from './TimelineSettings.vue';
import {TimelinePayload} from '../../../core/ServerResponses';
import {Article} from '../../../core/PostData';
import {TimelineData} from '../../../core/Timeline';
import {library} from '@fortawesome/fontawesome-svg-core';
import {faEllipsisV, faSyncAlt, faPlus, faMinus} from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import {Endpoint, Service} from '../../services/service';
import {SoshalState} from '../../store';
import TimelineArticles from './TimelineArticles.vue';

library.add(faEllipsisV, faSyncAlt, faPlus, faMinus);

@Component({components: {ArticleGeneric, TimelineSettings, TimelineArticles}})
export default class Timeline extends Vue {
	@Prop({type: Object, required: true})
	readonly timelineData! : TimelineData;
	@Prop({type: Boolean, required: true})
	readonly shouldScroll! : string[];

	@Ref('timelineArticles') readonly timelineArticles! : TimelineArticles;

	interval = undefined as number | undefined;
	timeout = undefined as number | undefined;
	articles = [] as Article[];
	isOptionsOpen = !(this.timelineData.name && this.timelineData.endpoint) as boolean;
	nameEdit = this.timelineData.name;
	lastBottomRefreshTime = moment();
	topRefreshCount = 20;
	bottomRefreshCount = 20;
	columns = 1;
	columnWidth = 1;	//Could use a better name
	autoScrolling = false;

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

	resetAutoRefresh({refresh = true, timeout = 0} = {}) {
		//TODO Disable refreshing when not in focus
		window.clearInterval(this.interval);
		window.clearTimeout(this.timeout);

		if (timeout)
			this.timeout = window.setTimeout(() => this.resetAutoRefresh(), timeout);
		else {
			this.interval = window.setInterval(() => this.refresh(), this.timelineData.refreshRate);

			if (refresh)
				this.refresh().then();
		}
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
			}else
				options = {
					...options,
					count: count || this.topRefreshCount,
				};

			const payload : TimelinePayload = await this.service.refreshEndpoint(
				this.timelineData.endpoint,
				options,
			);

			const newArticles = payload.newArticles.filter((a : Article) =>
				this.articles.findIndex(
					(b : Article) => b.id === a.id,
				) < 0,
			);

			if (newArticles.length) {
				this.topRefreshCount = 20;

				this.articles.push(...newArticles);

				this.articles.sort((a : Article, b : Article) =>
					moment(this.service.getArticleData(b).creationTime).diff(moment(this.service.getArticleData(a).creationTime)),
				);
			}else
				this.incrementCountTop();

			const untilReset = moment.duration(moment.unix(this.endpoint.rateLimitStatus.reset).diff(moment())).asMilliseconds();

			if (resetTimer)
				this.resetAutoRefresh({
					refresh: false,
					timeout: this.endpoint.rateLimitStatus.remaining ? 0 : untilReset + 1000,
				});
			else if (!this.endpoint.rateLimitStatus.remaining)
				this.resetAutoRefresh({
					refresh: false,
					timeout: untilReset + 1000,
				});

			return newArticles.length;
		}catch (e) {
			e.message = `Timeline ${this.timelineData.name}: ${e.message}`;
			throw e;
		}
	}

	incrementCountTop() {
		if (this.topRefreshCount < this.endpoint.maxCount)
			this.topRefreshCount += this.topRefreshCount == 20 ? 30 : 50;
	}

	incrementCountBottom() {
		if (this.bottomRefreshCount < this.endpoint.maxCount)
			this.bottomRefreshCount += this.bottomRefreshCount == 20 ? 30 : 50;
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
		this.timelineArticles.$el.scroll({
			top: 0,
			left: 0,
			behavior: 'smooth',
		});
	}

	onWheel({deltaY, currentTarget: {scrollTop, clientHeight, scrollHeight}} : { deltaY : number, currentTarget : Element }) {
		if (this.autoScrolling)
			return;

		//if no scrollbar or scrolled all the way down&& scrolling down
		//if there's a scrollbar, we let onScroll handle it
		if ((scrollTop === 0 || scrollTop + clientHeight === scrollHeight) && deltaY > 0)
			this.tryLoadMoreBottom();
	}

	onScroll({currentTarget: {scrollTop, clientHeight, scrollHeight}} : { currentTarget : Element }) {
		if (this.autoScrolling)
			return;

		if (scrollTop + clientHeight >= Math.max(0, scrollHeight - 5000))
			this.tryLoadMoreBottom();
	}

	tryLoadMoreBottom() {
		if (this.autoScrolling)
			return;

		if (moment().diff(this.lastBottomRefreshTime) > 10000) {
			this.refresh({bottom: true, resetTimer: true})
				.then(articleCount => {
					if (articleCount)
						this.bottomRefreshCount = 20;
					else
						this.incrementCountBottom();
				});

			this.lastBottomRefreshTime = moment();
		}
	}

	get service() : Service {
		return (this.$store.state as SoshalState).services[this.timelineData.service];
	}

	get endpoint() : Endpoint {
		return this.service.endpoints[this.timelineData.endpoint];
	}

	get enabled() {
		//if every of the endpoint's parameter sets is missing a parameter in timelineData, return false
		if (this.endpoint && this.endpoint.parameterSets.length)
			if (this.endpoint.parameterSets.every((parameterSet : string[]) =>
				parameterSet.some((parameter : string) => {
					const p = (this.timelineData.options as any)[parameter] as string;
					return !p || !p.length;
				}),
			))
				return false;

		return this.service.loggedIn && this.timelineData.enabled && !!this.timelineData.endpoint;
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

	@Watch('columns')
	onColumnChange(newColumnCount : number, oldColumnCount : number) {
		if (newColumnCount < oldColumnCount) {
			if (this.columnWidth)
				this.columnWidth--;
		}else if (newColumnCount > oldColumnCount)
			this.columnWidth++;
	}
}
</script>

<style scoped lang='sass'>
@use '../../bulma_overrides' as *

@include pretty-scrollbar

.timeline
	height: 100%
	padding: 0 5px
	box-sizing: border-box

.simpleTimeline
	//TODO I don't know why this is needed
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
</style>