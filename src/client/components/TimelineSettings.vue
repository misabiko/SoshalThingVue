<template lang='pug'>
	div
		b-field(label='Name')
			b-input(v-model='nameEdit')

		b-field(label='Endpoint')
			b-select(placeholder='Select an endpoint' v-model='endpointEdit' required)
				option(
					v-for='ep in endpoints'
					:value='ep'
					:key='ep'
				) {{ ep }}

		TimelineSearchOptions(
			v-if="endpointEdit === 'search'"
			:options.sync='optionsEdit'
		)

		b-button(
			v-if='anyChanges'
			@click='applySettings'
		) Apply
</template>

<script lang='ts'>
import {Vue, Component, Prop} from 'vue-property-decorator';
import TimelineSearchOptions from './TimelineSearchOptions.vue';
import {TimelineOptions} from '../../core/Timeline';

export interface SettingsData {
	name: string,
	endpoint: string,
	options: TimelineOptions
}

@Component({
	components: {TimelineSearchOptions}
})
export default class TimelineSettings extends Vue {
	@Prop({type: String, required: true})
	readonly name!: string;
	@Prop({type: String, required: true})
	readonly endpoint!: string;
	@Prop({type: Object, required: true})
	readonly options!: TimelineOptions;
	@Prop({type: Array, required: true})
	readonly endpoints!: string[];

	nameEdit = this.name;
	endpointEdit = this.endpoint;
	optionsEdit = this.options;

	get changes() : {[setting : string] : boolean} {
		return {
			name: this.nameEdit !== this.name,
			endpoint: this.endpointEdit !== this.endpoint,
			options: this.optionsEdit !== this.options,
		};
	}

	get anyChanges() : boolean {
		return Object.values(this.changes).some(change => change);
	}

	applySettings() {
		this.$emit('apply-settings', {
			name: this.nameEdit,
			endpoint: this.endpointEdit,
			options: this.optionsEdit,
		});
	}
}
</script>