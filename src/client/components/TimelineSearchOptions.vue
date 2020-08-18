<template lang='pug'>
	b-field(label='Query')
		b-input(v-model='query' required)
</template>

<script lang='ts'>
import {Vue, Component, Prop, Watch} from 'vue-property-decorator';
import {TimelineOptions} from '../../core/Timeline';

@Component
export default class TimelineSearchOptions extends Vue {
	@Prop({type: Object, required: true})
	readonly options!: TimelineOptions;

	query : string = this.options.q || '';

	@Watch('query')
	onQueryChanged(newQuery: string) {
		this.$emit('update:options', {q: newQuery});
	}

	@Watch('options')
	onOptionsChanged(newOptions: TimelineOptions) {
		this.query = newOptions.q as string;
	}
}
</script>