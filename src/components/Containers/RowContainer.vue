<template>
	<div class='rowContainer' ref='root' :style='{direction: rightToLeft ? "rtl" : "ltr"}'>
		<component
			:is='service.articleComponent'
			v-for='a in articles' :key='a.article.id'
			:article='a.article'
			:style='{width: (100 / columnCount) + "%"}'
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
import {computed, defineComponent, onBeforeUpdate, PropType} from 'vue'
import {Article, ArticlePacket} from '@/data/articles'
import {Service} from '@/services'

export default defineComponent({
	props: {
		serviceName: {
			type: String,
			required: true,
		},
		columnCount: {
			type: Number,
			default: 5,
		},
		rightToLeft: Boolean,
		onArticleClick: Function,
		articles: {
			type: Array as PropType<ArticlePacket[]>,
			required: true,
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

<style scoped lang='sass'>
.articlesContainer.rowContainer
	display: flex
	flex-wrap: wrap
	align-items: flex-start
</style>