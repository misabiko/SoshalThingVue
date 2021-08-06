<template>
	<div>
		{{ endpoint.name }}
		<template v-if='rateLimitInfo'>
			<progress class='progress' :value='rateLimitInfo.remainingCalls' :max='(rateLimitInfo && rateLimitInfo.maxCalls) || 1'>
				{{Math.round(rateLimitInfo.remainingCalls / rateLimitInfo.maxCalls * 1000) / 10}}%
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
		const rateLimitInfo = computed(() => props.endpoint.rateLimitInfo.value)
		const timeLeft = computed(() => rateLimitInfo.value ? Math.ceil(((rateLimitInfo.value.secUntilNextReset * 1000) - Date.now()) / 1000 / 60) : undefined)

		return {
			rateLimitInfo,
			timeLeft,
		}
	}
})
</script>