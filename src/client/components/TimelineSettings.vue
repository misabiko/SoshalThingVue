<template lang='pug'>
	div
		b-field(label='Endpoint')
			b-select(placeholder='Select an endpoint' v-model='endpoint' required)
				option(
					v-for='ep in endpoints'
					:value='ep'
					:key='ep'
				) {{ ep }}

		b-field: b-switch(v-model='enabled' @input='applySettings') Enabled
		b-field: b-switch(v-model='autoRefresh' @input='applySettings') Auto Refresh
		b-field: b-switch(v-model='compactMedia' @input='applySettings') Compact Media
		b-field: b-switch(v-model='options.includeReposts' @input='applySettings') Include Reposts
		b-field: b-switch(v-model='options.onlyWithMedia' @input='applySettings') Only With Media

		TimelineSearchOptions(
			v-if="endpoint === 'search'"
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

export interface SettingsData {
	endpoint: string;
	enabled: boolean;
	autoRefresh: boolean;
	compactMedia: boolean;
	options: TimelineOptions;
}

@Component({
	components: {TimelineSearchOptions}
})
export default class TimelineSettings extends Vue {
	@Prop({type: Object, required: true})
	readonly timelineData!: TimelineData;
	@Prop({type: Array, required: true})
	readonly endpoints!: string[];
	@Prop({type: Boolean})
	readonly changesOutside!: boolean;

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