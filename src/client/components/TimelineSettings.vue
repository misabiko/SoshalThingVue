<template lang='pug'>
	div
		b-field(label='Name')
			b-input(v-model='name')

		b-field(label='Endpoint')
			b-select(placeholder='Select an endpoint' v-model='endpoint' required)
				option(
					v-for='ep in endpoints'
					:value='ep'
					:key='ep'
				) {{ ep }}

		b-field: b-switch(v-model='enabled' @input='applySettings') Enabled
		b-field: b-switch(v-model='autoRefresh' @input='applySettings') Auto Refresh

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
	name: string;
	endpoint: string;
	enabled: boolean;
	autoRefresh: boolean;
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

	name = this.timelineData.name;
	endpoint = this.timelineData.endpoint;
	enabled = this.timelineData.enabled;
	autoRefresh = this.timelineData.autoRefresh;
	options = this.timelineData.options;

	get changes() : {[setting : string] : boolean} {
		return {
			name: this.name !== this.timelineData.name,
			endpoint: this.endpoint !== this.timelineData.endpoint,
			options: this.options !== this.timelineData.options,
		};
	}

	get anyChanges() : boolean {
		return Object.values(this.changes).some(change => change);
	}

	applySettings() {
		this.$emit('apply-settings', <TimelineSettings>{
			name: this.name,
			endpoint: this.endpoint,
			enabled: this.enabled,
			autoRefresh: this.autoRefresh,
			options: this.options,
		});
	}
}
</script>