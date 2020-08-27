<template lang='pug'>
	#timelineContainer
		Timeline(
			v-for='timeline in timelines'
			:key='timeline.id'
			:timeline-data='timeline'
			:endpoints='endpoints'
			:shouldScroll='shouldScroll'
			@remove-timeline="removeTimeline($event)"
			@update-data='onTimelinesChanged(timelines)'
		)
</template>

<script lang='ts'>
import Vue from 'vue';
import Component from 'vue-class-component';
import Timeline from "./Timeline.vue";
import {TimelineData} from '../../core/Timeline';
import {Watch} from 'vue-property-decorator';

@Component({
	components: {Timeline}
})
export default class TimelineContainer extends Vue {
	timelines : TimelineData[] = [];
	endpoints = ['home_timeline', 'search'];
	shouldScroll = false;

	mounted() {
		this.loadTimelines();
	}

	async loadTimelines() {
		this.timelines = await fetch('/timelines')
			.then(response => response.json());
	}

	addTimeline() : void {
		this.shouldScroll = true;

		const id = this.getUniqueId();
		this.timelines.push({
			id,
			name: 'Timeline #' + id,
			service: 'Twitter',
			endpoint: '',
			autoRefresh: true,
			enabled: true,
			compactMedia: true,
			options: {
				includeReposts: true,
			},
			refreshRate: 60000,
		});
	}

	removeTimeline(id : number) : void {
		const index = this.timelines.findIndex((timeline : TimelineData) => timeline.id === id);
		this.timelines.splice(index, 1);
	}

	getUniqueId() : number {
		if (!this.timelines.length)
			return 0;

		//Feels clunky
		let id = 0;
		const ids = this.timelines.map(timeline => timeline.id);
		while (ids.includes(id))
			id++;

		return id;
	}

	@Watch('timelines')
	async onTimelinesChanged(newTimelines: TimelineData[]) {
		try {
			await fetch('/timelines', {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify(newTimelines),
			});
		}catch (e) {
			console.error('Error while trying to save the timeline settings.');
			throw e;
		}
	}
};
</script>

<style scoped lang='sass'>
@use '../bulma_overrides' as *

@include pretty-scrollbar

#timelineContainer
	height: 100%
	overflow-x: scroll
	overflow-y: hidden
	display: flex
	flex-grow: 1
</style>