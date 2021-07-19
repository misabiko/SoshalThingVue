<template>
	<div class='field is-horizontal'>
		<div class='field-label'>
			<label class='label'>Sort Method</label>
		</div>
		<div class='field-body'>
			<div class='field'>
				<div class='control select'>
					<select v-model='sortConfig.method'>
						<option v-for='method in sortMethods' :value='method'>{{method}}</option>
					</select>
				</div>
			</div>
			<div class='field'>
				<div class='control'>
					<label class='checkbox'>
						<input type='checkbox' v-model='sortConfig.reversed'>
						Reversed
					</label>
				</div>
			</div>
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