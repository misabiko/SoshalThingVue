<template lang='pug'>
	b-field(label='Query' custom-class='has-text-light')
		b-input(v-model='query' required)
</template>

<script lang='ts'>
import Vue from 'vue';
import Component from 'vue-class-component';

const TimelineSearchOptionsProps = Vue.extend({
	props: {
		options: {
			type: Object,
			required: true,
		}
	},
	watch: {
		query(newQuery, _oldQuery) {
			(this as any).$emit('update:options', {q: newQuery});
		},
		options(newOptions, _oldOptions) {
			(this as any).query = newOptions.q;
		}
	}
});

@Component
export default class TimelineSearchOptions extends TimelineSearchOptionsProps {
	query = (this as any).options ? (this as any).options.q : '';
}
</script>

<style scoped lang='sass'>

</style>