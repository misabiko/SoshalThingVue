<template lang='pug'>
	b-field(label='Query' custom-class='has-text-light')
		b-input(v-model='query' required)
</template>

<script lang='ts'>
import {Vue, Component, Prop, Watch} from 'vue-property-decorator';
import {TimelineOptions} from './TimelineSettings.vue';

@Component
export default class TimelineSearchOptions extends Vue {
	@Prop({type: Object, required: true})
	readonly options!: TimelineOptions;

	query = this.options ? this.options.q : '';

	@Watch('query')
	onQueryChanged(newQuery: string, _oldQuery: string) {
		this.$emit('update:options', {q: newQuery});
	}

	@Watch('options')
	onOptionsChanged(newOptions: TimelineOptions, _oldOptions: TimelineOptions) {
		this.query = newOptions.q;
	}
}
</script>