<template>
	<div class='columnContainer' ref='root'>
		<component
			:is='service.articleComponent'
			v-for='a in articles' :key='a.id'
			:article='a'
			:service='service'
			:on-article-click='onArticleClick'
			@loading-full-media='$emit("loadingFullMedia", $event)'
			@done-loading='$emit("doneLoading", $event)'
			@expand='$emit("expand", $event)'
		></component>
	</div>
</template>

<script lang='ts'>
import {defineComponent, onBeforeUpdate, PropType, markRaw} from 'vue'
import {Article} from '@/data/articles'
import {Service} from '@/services'

export default defineComponent({
	props: {
		service: {
			type: Object as PropType<Service>,
			required: true,
		},
		onArticleClick: Function,
		articles: {
			type: Array as PropType<Article[]>,
			default: []
		},
		updateQueries: {
			type: Function as PropType<() => any>,
			required: true,
		},
		updateLoadings: {
			type: Function as PropType<() => any>,
			required: true,
		},
	},

	setup(props) {
		onBeforeUpdate(props.updateQueries)
		onBeforeUpdate(props.updateLoadings)
	},
})
</script>