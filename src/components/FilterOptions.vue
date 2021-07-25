<template>
	<h4>Filters</h4>
	<div class='field has-addons'>
		<div class='control'>
			<div class='select'>
				<select v-model='newFilter'>
					<template v-for='(method, methodName) in filterMethods'>
						<option v-if='!Object.keys(filters).includes(methodName)' :value='methodName'>
							{{ methodName }}
						</option>
					</template>
				</select>
			</div>
		</div>
		<div class='control'>
			<button class='button' @click='filters[newFilter] = filterMethods[newFilter].defaultConfig'>
				Add Filter
			</button>
		</div>
	</div>
	<div v-for='(filter, methodName) in filters' class='field'>
		<label class='label'>{{ methodName }}</label>
		<div class='control has-addons'>
			<button class='button' @click='filter.enabled = !filter.enabled'>
				{{ filter.enabled ? 'On' : 'Off' }}
			</button>
			<button class='button' @click='filter.inverted = !filter.inverted'>
				{{ filter.inverted ? 'Inverted' : 'Normal' }}
			</button>
			<button class='button' @click='delete filters[methodName]'>
				Remove
			</button>
		</div>
		<component v-if='filter.option' :is='filter.option(filters)'/>
	</div>
</template>

<script lang='ts'>
import {defineComponent, PropType, ref} from 'vue'
import {FilterConfigs, Filters} from '@/composables/useFilters'
import {Article} from '@/data/articles'

export default defineComponent({
	props: {
		filterMethods: {
			type: Object as PropType<Filters<Article>>,
			required: true,
		},
		filters: {
			type: Object as PropType<FilterConfigs>,
			required: true,
		},
	},

	setup(props) {
		return {
			newFilter: ref(['Hidden', ...Object.keys(props.filterMethods)].filter(methodName => !Object.keys(props.filters).includes(methodName))[0]),
		}
	},
})
</script>

<style scoped lang='sass'>

</style>