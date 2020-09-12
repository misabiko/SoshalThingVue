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
		b-field: b-switch(v-model='options.includeReposts' @input='applySettings') Include Reposts
		b-field: b-switch(v-model='options.onlyWithMedia' @input='applySettings') Only With Media

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
import {Vue, Component, Prop, Watch} from 'vue-property-decorator';
import TimelineSearchOptions from './TimelineSearchOptions.vue';
import {TimelineData, TimelineOptions} from '../../../core/Timeline';
import {Service} from '../../services/service';
import TimelineUserOptions from './TimelineUserOptions.vue';
import TimelineListOptions from './TimelineListOptions.vue';

export interface SettingsData {
	endpoint: string;
	enabled: boolean;
	autoRefresh: boolean;
	compactMedia: boolean;
	options: TimelineOptions;
}

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
	options = this.timelineData.options;

	applySettings() {
		this.timelineData.name = this.nameEdit;
		this.timelineData.endpoint = this.endpoint;
		this.timelineData.enabled = this.enabled;
		this.timelineData.autoRefresh = this.autoRefresh;
		this.timelineData.compactMedia = this.compactMedia;
		this.timelineData.options = this.options;
	}

	get changes() : {[setting : string] : boolean} {
		return {
			name: this.nameEdit !== this.timelineData.name,
			endpoint: this.endpoint !== this.timelineData.endpoint,
			options: this.options !== this.timelineData.options,
		};
	}

	get anyChanges() : boolean {
		return Object.values(this.changes).some(change => change);
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

	@Watch('timelineData', {deep: true})
	onDataChange() {
		this.$emit('update-data');
	}
}
</script>