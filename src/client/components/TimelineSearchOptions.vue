<template lang='pug'>
	b-field(label='Query' custom-class='has-text-light')
		b-input(v-model='query' required)
</template>

<script lang='ts'>
import Vue from 'vue';

export default Vue.component('TimelineSearchOptions', {
	props: ['options'],
	data: function() {
		return {
			query: (this as any).options ? (this as any).options.q : '',
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
</script>

<style scoped lang='sass'>

</style>