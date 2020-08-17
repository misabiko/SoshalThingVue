<template lang='pug'>
	#timelineContainer
		Timeline(
			v-for='timeline of timelines'
			:key='timeline.id'
			:initial-data='timeline'
			:endpoints='endpoints'
			@remove-timeline="removeTimeline($event)"
		)
</template>

<script lang='ts'>
import Vue from 'vue';
import Component from 'vue-class-component';
import Timeline from "./Timeline.vue";

export interface TimelineData {
	id: number,
	name: string,
	service: string,
	endpoint: string,
	options?: {q: string},
	refreshRate?: number,
}

@Component({
	components: {Timeline}
})
export default class TimelineContainer extends Vue {
	timelines : TimelineData[] = [
		{id: 0, name: 'Home', service: 'Twitter', endpoint: 'home_timeline'},
	];
	endpoints = ['home_timeline', 'search'];

	addTimeline() : void {
		const id = this.getUniqueId();
		this.timelines.push({id, name: 'Timeline #' + id, service: 'Twitter', endpoint: ''});
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
};
</script>

<style scoped lang='sass'>
@use '../variables' as *

@include pretty-scrollbar

#timelineContainer
	height: 100%
	overflow-x: scroll
	overflow-y: hidden
	display: flex
	flex-grow: 1
</style>