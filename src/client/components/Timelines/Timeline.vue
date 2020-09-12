<template lang='pug'>
	.timeline(:class='{simpleTimeline: timelineData.columns === 1}' :style="{flex: '0 0 ' + (timelineData.columnWidth * 500) + 'px', width: (timelineData.columnWidth * 500) + 'px'}")
		.timelineHeader(@click.self='scrollTop' :class='{timelineInvalid: !endpoint.ready}')
			b-input(v-if='isOptionsOpen' v-model='nameEdit')
			strong(v-else) {{ timelineData.name }}

			.timelineButtons
				button.refreshTimeline(@click='refresh({scrollTop: true, resetTimer: true}).then()' :disabled='!endpoint.ready || !enabled')
					FontAwesomeIcon(icon='sync-alt' inverse size='lg' :spin='refreshing' :class="{'slow-spin': !refreshing && isWaitingRefresh}")
				button.openTimelineOptions(@click='isOptionsOpen = !isOptionsOpen')
					FontAwesomeIcon(icon='ellipsis-v' inverse size='lg')

		b-collapse(:open='isOptionsOpen' animation='slide')
			TimelineSettings(
				:timeline-data='timelineData'
				:service='service'
				:name-edit='nameEdit'
				@update-data="$emit('update-data')"
			)
				.level
					.level-left: b-button.level-item(@click='clearPosts') Clear
					b-field.level-right(grouped horizontal)
						b-field.level-item
							b-input.autoScrollInput(type='number' min='1' v-model='autoScrollSpeed')
							b-button(@click='autoScrolling = true; isOptionsOpen = false;') AutoScroll
						b-button.level-item(@click='remove' type='is-danger') Remove

		TimelineArticles(
			ref='timelineArticles'
			:columns='timelineData.columns'
			:articles='filteredArticles'
			:refreshing='refreshing'
			:service='service'
			:enabled='enabled'
			:compact-media='timelineData.compactMedia'
			:scrolling.sync='autoScrolling'
			:scrollSpeed='scrollSpeed'
			@remove-article='removeArticle($event)'
			@load-bottom='tryLoadMoreBottom'
		)
</template>

<script lang='ts'>
import {Component, Prop, Ref, Vue, Watch} from 'vue-property-decorator';
import TimelineSettings from './TimelineSettings.vue';
import {TimelinePayload} from '../../../core/ServerResponses';
import {Article, ArticleType} from '../../../core/PostData';
import {TimelineData, TimelineFilter} from '../../../core/Timeline';
import {library} from '@fortawesome/fontawesome-svg-core';
import {faEllipsisV, faMinus, faPlus, faSyncAlt} from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import {Endpoint, Service} from '../../services/service';
import {SoshalState} from '../../store';
import TimelineArticles from './TimelineArticles.vue';

library.add(faEllipsisV, faSyncAlt, faPlus, faMinus);

@Component({components: {TimelineSettings, TimelineArticles}})
export default class Timeline extends Vue {
	@Prop({type: Object, required: true})
	readonly timelineData! : TimelineData;
	@Prop({type: Boolean, required: true})
	readonly shouldScroll! : string[];

	@Ref('timelineArticles') readonly timelineArticles! : TimelineArticles;

	interval = 0 as number | undefined;	//Initialized as 0 to enable reactivity
	timeout = 0 as number | undefined;
	articles = [] as Article[];
	isOptionsOpen = !(this.timelineData.name && this.timelineData.endpoint) as boolean;
	nameEdit = this.timelineData.name;
	lastBottomRefreshTime = moment();
	autoScrolling = false;
	oldestArticle = null as null | Article;
	loadingBottomTimeout = 0 as number | undefined;
	refreshing = false;
	scrollSpeed = 3;

	mounted() {
		if (this.enabled)
			this.resetAutoRefresh();

		if (this.shouldScroll)
			this.$el.scrollIntoView({
				behavior: 'smooth',
			});
	}

	beforeDestroy() {
		this.disableAutoRefresh();
	}

	log(...data : any[]) {
		console.log(`${this.timelineData.name}: `, ...data);
	}

	resetAutoRefresh({refresh = true, timeout = 0} = {}) {
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
		if (scrollTop)
			this.scrollTop();

		if (!this.enabled)
			return 0;
		try {
			let options = this.timelineData.options;
			if (this.filteredArticles.length) {
				if (bottom)
					options = {
						...options,
						max: this.oldestArticle ? this.oldestArticle.id : this.articles[this.articles.length - 1].id,
						count: count || this.endpoint.maxCount,
					};
				else
					options = {
						...options,
						since: this.articles[0].id,
						count: count || 25,
					};
			}else
				options = {
					...options,
					count: count || 25,
				};

			this.refreshing = true;
			const payload : TimelinePayload = await this.service.refreshEndpoint(
				this.timelineData.endpoint,
				options,
			);

			if (payload.oldestArticle)
				this.oldestArticle = payload.oldestArticle;

			const newArticles = this.filterNewArticles(payload.newArticles);

			if (newArticles.length) {
				this.articles.push(...newArticles);

				this.articles.sort((a : Article, b : Article) =>
					moment(this.service.getArticleData(b).creationTime).diff(moment(this.service.getArticleData(a).creationTime)),
				);
			}

			if (resetTimer)
				this.resetAutoRefresh({
					refresh: false,
					timeout: this.endpoint.timeout,
				});

			this.refreshing = false;
			return newArticles.length;
		}catch (e) {
			e.message = `Timeline ${this.timelineData.name}: ${e.message}`;
			this.refreshing = false;
			throw e;
		}
	}

	filterNewArticles(newArticles : Article[]) : Article[] {
		return newArticles.filter((a : Article) =>
			this.articles.findIndex(
				(b : Article) => b.id === a.id,
			) < 0,
		);
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

	scrollTop() {
		this.timelineArticles.$el.scroll({
			top: 0,
			left: 0,
			behavior: 'smooth',
		});
	}

	tryLoadMoreBottom() {
		if (this.autoScrolling || this.loadingBottomTimeout)
			return;

		const untilLoad = 1000 - moment().diff(this.lastBottomRefreshTime);

		if (untilLoad < 0)
			this.loadBottom();
		else
			this.loadingBottomTimeout = window.setTimeout(this.loadBottom, this.endpoint.timeout + untilLoad);
	}

	loadBottom() {
		this.refresh({bottom: true, resetTimer: true});

		this.lastBottomRefreshTime = moment();
		this.loadingBottomTimeout = undefined;
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

	get isWaitingRefresh() {
		return !!this.loadingBottomTimeout;
	}

	get autoScrollSpeed() {
		return this.scrollSpeed;
	}

	set autoScrollSpeed(value : any) {
		this.scrollSpeed = parseInt(value);
	}

	get filteredArticles() {
		return this.articles.filter((a : Article) => {
				const postData = this.service.getPostData(a);

				if (this.timelineData.showing.includes(TimelineFilter.All))
					return true;

				if (a.type === ArticleType.Repost && !this.timelineData.showing.includes(TimelineFilter.Reposts))
					return false;
				if (a.type === ArticleType.Quote && !this.timelineData.showing.includes(TimelineFilter.Quotes))
					return false;

				if (!postData.images && !postData.video) {
					if (!this.timelineData.showing.includes(TimelineFilter.TextOnly))
						return false;
				}else {
					if (postData.images && !this.timelineData.showing.includes(TimelineFilter.Images))
						return false;
					if (postData.video && !this.timelineData.showing.includes(TimelineFilter.Videos))
						return false;
				}

				return true;
			},
		);
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
@use '../../bulma_overrides' as *

@include pretty-scrollbar

.timeline
	height: 100%
	padding: 0 5px
	box-sizing: border-box

.simpleTimeline
	display: flex
	flex-flow: column

.timelineHeader
	height: 50px
	line-height: 50px
	padding-left: 25px
	background-color: $dark
	display: flex
	justify-content: space-between

	strong
		vertical-align: middle

	&.timelineInvalid
		background-color: $dark-error

.timelineButtons > button
	@include borderless-button(0 1.6rem)
	height: 100%

.slow-spin
	animation: fa-spin 6s infinite linear

.autoScrollInput
	width: 80px
</style>