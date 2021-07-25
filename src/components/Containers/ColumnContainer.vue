<template>
	<div class='columnContainer' ref='root'>
		<component
			:is='service.articleComponent'
			v-for='a in articles' :key='a.article.id'
			:article='a.article'
			:onArticleClick='onArticleClick'
			:inheritedCompact='compactArticles'
			:filtered='a.filtered'
			@loading-full-media='$emit("loadingFullMedia", $event)'
			@done-loading='$emit("doneLoading", $event)'
			@expand='$emit("expand", $event)'
		></component>
	</div>
</template>

<script lang='ts'>
import {defineComponent, onBeforeUpdate, PropType, markRaw, ref, computed} from 'vue'
import {Article, ArticlePacket} from '@/data/articles'
import {Service} from '@/services'

export default defineComponent({
	props: {
		serviceName: {
			type: String,
			required: true,
		},
		onArticleClick: Function,
		articles: {
			type: Array as PropType<ArticlePacket[]>,
			default: []
		},
		updateQueries: {
			type: Function as PropType<() => any>,
		},
		updateLoadings: {
			type: Function as PropType<() => any>,
		},
		compactArticles: {
			type: Boolean,
			default: true
		}
	},

	setup(props) {
		if (props.updateQueries)
			onBeforeUpdate(props.updateQueries)
		if (props.updateLoadings)
			onBeforeUpdate(props.updateLoadings)

		return {
			service: computed(() => Service.instances[props.serviceName])
		}
	},
})
</script>