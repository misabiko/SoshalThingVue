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
import TimelineSearchOptions from './TimelineSearchOptions.vue';

export interface SettingsData {
	name: string,
	endpoint: string,
	options: TimelineOptions
}

export interface TimelineOptions {
	q?: string
}

export default Vue.component('TimelineSettings', {
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
	},
	data: function() {
		return {
			nameEdit: this.name,
			endpointEdit: this.endpoint,
			optionsEdit: this.options,
		}
	},
	computed: {
		changes() : {[setting : string] : boolean} {
			return {
				name: this.nameEdit !== this.name,
				endpoint: this.endpointEdit !== this.endpoint,
				options: this.optionsEdit !== this.options,
			};
		},
		anyChanges() : boolean {
			return Object.values(this.changes).some(change => change);
		}
	},
	methods: {
		applySettings() {
			this.$emit('apply-settings', {
				name: this.nameEdit,
				endpoint: this.endpointEdit,
				options: this.optionsEdit,
			});
		}
	},
	components: {
		TimelineSearchOptions,
	}
});
</script>

<style scoped lang='sass'>

</style>