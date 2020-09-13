<template lang='pug'>
	.timelineOptions
		b-field(label='Endpoint')
			b-select(placeholder='Select an endpoint' v-model='endpoint' required)
				option(
					v-for='ep in service.endpoints'
					:value='ep.name'
					:key='ep.name'
				) {{ ep.name }}

		b-field: b-switch(v-model='enabled' @input='applySettings') Enabled
		b-field: b-switch(v-model='autoRefresh' @input='applySettings') Auto Refresh
		b-field: b-switch(v-model='compactMedia' @input='applySettings') Compact Media
		b-field(label='Showing')
			b-checkbox-button(v-model='showing' native-value='all') All
			b-checkbox-button(v-model='showing' native-value='reposts') Reposts
			b-checkbox-button(v-model='showing' native-value='quotes') Quotes
			b-checkbox-button(v-model='showing' native-value='text') Text Only
			b-checkbox-button(v-model='showing' native-value='images') Images
			b-checkbox-button(v-model='showing' native-value='videos') Videos

		TimelineSearchOptions(
			v-if="endpoint === 'search'"
			:options.sync='options'
		)
		TimelineUserOptions(
			v-if="endpoint === 'user_timeline'"
			:options.sync='options'
		)
		TimelineListOptions(
			v-if="endpoint === 'list'"
			:options.sync='options'
		)

		b-button(v-if='anyChanges' @click='applySettings') Save

		b-field(label='Columns'): b-numberinput(v-model='columns' min='1')
		b-field(label='Width'): b-numberinput(v-model='timelineData.columnWidth' min='1')

		slot
</template>

<script lang='ts'>
import {Component, Prop, Vue, Watch} from 'vue-property-decorator';
import TimelineSearchOptions from './TimelineSearchOptions.vue';
import {TimelineData, TimelineFilter} from '../../../core/Timeline';
import {Service} from '../../services/service';
import TimelineUserOptions from './TimelineUserOptions.vue';
import TimelineListOptions from './TimelineListOptions.vue';

//TODO Make endpoint parameter options dynamic
@Component({components: {TimelineSearchOptions, TimelineUserOptions, TimelineListOptions}})
export default class TimelineSettings extends Vue {
	@Prop({type: Object, required: true})
	readonly timelineData!: TimelineData;
	@Prop({type: Object, required: true})
	readonly service!: Service;
	@Prop({type: String, required: true})
	readonly nameEdit!: string;

	endpoint = this.timelineData.endpoint;
	enabled = this.timelineData.enabled;
	autoRefresh = this.timelineData.autoRefresh;
	compactMedia = this.timelineData.compactMedia;
	showing = this.timelineData.showing;
	options = this.timelineData.options;

	applySettings() {
		this.timelineData.name = this.nameEdit;
		this.timelineData.endpoint = this.endpoint;
		this.timelineData.enabled = this.enabled;
		this.timelineData.autoRefresh = this.autoRefresh;
		this.timelineData.compactMedia = this.compactMedia;
		this.timelineData.showing = this.showing;
		this.timelineData.options = this.options;
	}

	get showingChanges() {
		if (this.showing.length !== this.timelineData.showing.length)
			return true;

		return !(this.timelineData.showing.every(filter => this.showing.includes(filter)) &&
		this.showing.every(filter => this.timelineData.showing.includes(filter)));
	}

	get anyChanges() : boolean {
		return (
			this.nameEdit !== this.timelineData.name ||
			this.endpoint !== this.timelineData.endpoint ||
			this.showingChanges ||
			this.options !== this.timelineData.options
		);
	}

	get columns() : number {
		return this.timelineData.columns;
	}

	set columns(value : number) {
		this.timelineData.columns = value;
	}

	@Watch('columns')
	onColumnChange(newColumnCount : number, oldColumnCount : number) {
		if (newColumnCount < oldColumnCount) {
			if (this.timelineData.columnWidth > 1)
				this.timelineData.columnWidth--;
		}else if (newColumnCount > oldColumnCount)
			this.timelineData.columnWidth++;
	}

	@Watch('showing')
	onShowingChange(newShowing : TimelineFilter[], oldShowing : TimelineFilter[]) {
		const added = newShowing.filter(filter => !oldShowing.includes(filter));

		if (added.includes(TimelineFilter.All))
			this.showing = [TimelineFilter.All];
		else if (added.length)
			this.showing = newShowing.filter(filter => filter !== TimelineFilter.All);
	}

	@Watch('timelineData', {deep: true})
	onDataChange() {
		this.$emit('update-data');
	}
}
</script>

<style scoped lang='sass'>
@use '../../bulma_overrides' as *

.timelineOptions
	background-color: $scheme-main-ter
	padding: 1rem
</style>