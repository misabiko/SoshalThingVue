<template lang='pug'>
	div
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

		b-button(
			v-if='anyChanges'
			@click='applySettings'
		) Save
</template>

<script lang='ts'>
import {Vue, Component, Prop} from 'vue-property-decorator';
import TimelineSearchOptions from './TimelineSearchOptions.vue';
import {TimelineData, TimelineOptions} from '../../core/Timeline';
import {Service} from '../services/service';
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
	@Prop({type: Boolean})
	readonly changesOutside!: boolean;
	@Prop({type: Object, required: true})
	readonly service!: Service;

	endpoint = this.timelineData.endpoint;
	enabled = this.timelineData.enabled;
	autoRefresh = this.timelineData.autoRefresh;
	compactMedia = this.timelineData.compactMedia;
	options = this.timelineData.options;

	get changes() : {[setting : string] : boolean} {
		return {
			endpoint: this.endpoint !== this.timelineData.endpoint,
			options: this.options !== this.timelineData.options,
		};
	}

	get anyChanges() : boolean {
		return this.changesOutside || Object.values(this.changes).some(change => change);
	}

	applySettings() {
		this.$emit('apply-settings', <TimelineSettings>{
			endpoint: this.endpoint,
			enabled: this.enabled,
			autoRefresh: this.autoRefresh,
			compactMedia: this.compactMedia,
			options: this.options,
		});
	}
}
</script>