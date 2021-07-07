<template>
	<div>
		{{ endpoint.name }}
		<template v-if='endpoint.rateLimitInfo'>
			<progress class='progress' :value='endpoint.rateLimitInfo.remainingCalls' :max='(endpoint.rateLimitInfo && endpoint.rateLimitInfo.maxCalls) || 1'>
				{{Math.round(endpoint.rateLimitInfo.remainingCalls / endpoint.rateLimitInfo.maxCalls * 1000) / 10}}%
			</progress>
			{{timeLeft}} minutes until reset
		</template>
	</div>
</template>

<script lang='ts'>
import {computed, defineComponent, PropType} from 'vue'
import {Endpoint} from '@/services'

export default defineComponent({
	props: {
		endpoint: {
			type: Object as PropType<Endpoint<any>>,
			required: true,
		}
	},

	setup(props) {
		const timeLeft = computed(() => props.endpoint.rateLimitInfo ? Math.ceil(((props.endpoint.rateLimitInfo.secUntilNextReset * 1000) - Date.now()) / 1000 / 60) : undefined)

		return {
			timeLeft,
		}
	}
})
</script>

<style scoped lang='sass'>

</style>