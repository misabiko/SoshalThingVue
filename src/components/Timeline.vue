<template>
	<div class='timeline'>
		<div class='timelineHeader'>
			<strong>{{ timeline.title }}</strong>
			<div class='timelineButtons'>

			</div>
		</div>
		<div class='timelineArticles'>
			<div class='article' v-for='a in articles' key='a.id'>{{ a.id }}</div>
		</div>
	</div>
</template>

<script lang='ts'>
import {defineComponent, ref, toRefs, computed, PropType} from 'vue'
import {services} from '@/services'

export interface TimelineData {
	title: string
	serviceIndex: number
	articles: string[]
}

export default defineComponent({
	props: {
		timeline: {
			type: Object as PropType<TimelineData>,
			required: true
		},
	},
	setup(props) {
		const service = ref(services[props.timeline.serviceIndex])
		const articles = computed(() => props.timeline.articles.map((id: string) => service.value.articles[id]))

		return {service, articles}
	},
})
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang='scss'>
</style>
