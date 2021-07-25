<template>
	<div class='columnContainer' ref='root'>
		<component
			:is='service.articleComponent'
			v-for='a in articles' :key='a.id'
			:article='a'
			:onArticleClick='onArticleClick'
			:inheritedCompact='compactArticles'
			@loading-full-media='$emit("loadingFullMedia", $event)'
			@done-loading='$emit("doneLoading", $event)'
			@expand='$emit("expand", $event)'
		></component>
	</div>
</template>

<script lang='ts'>
import {defineComponent, onBeforeUpdate, PropType, markRaw, ref, computed} from 'vue'
import {Article} from '@/data/articles'
import {Service} from '@/services'

export default defineComponent({
	props: {
		serviceName: {
			type: String,
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
		compactArticles: {
			type: Boolean,
			default: true
		}
	},

	setup(props) {
		onBeforeUpdate(props.updateQueries)
		onBeforeUpdate(props.updateLoadings)

		return {
			service: computed(() => Service.instances[props.serviceName])
		}
	},
})
</script>