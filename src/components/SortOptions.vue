<template>
	<div class='field'>
		<label class='label'>Sort Method</label>
		<div class='control select'>
			<select v-model='sortConfig.method'>
				<option v-for='(_, method) in sortMethods' :value='method'>{{method}}</option>
			</select>
		</div>
		<div class='control'>
			<label class='checkbox'>
				<input type='checkbox' v-model='sortConfig.reversed'>
				Reversed
			</label>
		</div>
	</div>
</template>

<script lang='ts'>
import {defineComponent, PropType} from 'vue'
import {SortConfig, SortMethods} from '@/composables/useSortMethods'

export default defineComponent({
	props: {
		sortConfig: {
			type: Object as PropType<SortConfig>,
			required: true,
		},
		sortMethods: {
			type: Object as PropType<SortMethods<any>>,
			required: true,
		}
	}
})
</script>