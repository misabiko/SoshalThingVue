<template lang='pug'>
	div
		b-field(label='Name' custom-class='has-text-light')
			b-input(v-model='nameEdit')

		b-field(label='Endpoint' custom-class='has-text-light')
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
import Vue from 'vue';
import Component from 'vue-class-component';
import TimelineSearchOptions from './TimelineSearchOptions.vue';

export interface SettingsData {
	name: string,
	endpoint: string,
	options: TimelineOptions
}

export interface TimelineOptions {
	q?: string
}

const TimelineSettingsProps = Vue.extend({
	props: {
		name: {
			type: String,
			required: true,
		},
		endpoint: {
			type: String,
			required: true,
		},
		options: {
			type: Object,
			required: true,
		},
		endpoints: {
			type: Array,
			required: true,
		},
	}
});

@Component({
	components: {TimelineSearchOptions}
})
export default class TimelineSettings extends TimelineSettingsProps {
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