<template>
	<div class='field'>
		<label class='label'>Sort Method</label>
		<div class='control select'>
			<select v-model='sortConfig.method'>
				<option v-for='(_, method) in sortMethods' :value='method'>{{method}}</option>
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
	<div v-if='articleList' class='field'>
		<div v-if='sortConfig.method !== "Unsorted" || sortConfig.reversed' class='control'>
			<button class='button' @click='applySorting'>Apply</button>
		</div>
	</div>
</template>

<script lang='ts'>
import {defineComponent, PropType} from 'vue'
import {SortConfig, SortMethods} from '@/composables/useSortMethods'
import {sortArticleList} from '@/data/articleLists'

export default defineComponent({
	props: {
		sortConfig: {
			type: Object as PropType<SortConfig>,
			required: true,
		},
		sortMethods: {
			type: Object as PropType<SortMethods<any>>,
			required: true,
		},
		articleList: String,
	},

	setup(props) {
		function applySorting() {
			if (props.articleList)
				sortArticleList(props.sortMethods[props.sortConfig.method], props.sortConfig.reversed, props.articleList)
		}

		return {applySorting}
	}
})
</script>