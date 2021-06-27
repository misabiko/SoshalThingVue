<template>
	<div class='rowContainer' ref='root' :style='{direction: rightToLeft ? "rtl" : "ltr"}'>
		<component
			:is='service.articleComponent'
			v-for='a in articles' :key='a.id'
			:article='a'
			:style='{width: (100 / columnCount) + "%"}'
			:service='service'
			:on-article-click='onArticleClick'
			@loading-full-media='$emit("loadingFullMedia", $event)'
			@done-loading='$emit("doneLoading", $event)'
			@expand='$emit("expand", $event)'
		></component>
	</div>
</template>

<script lang='ts'>
import {defineComponent, onBeforeUpdate, PropType} from 'vue'
import {Article} from '@/data/articles'
import {Service} from '@/services'

export default defineComponent({
	props: {
		service: {
			type: Object as PropType<Service>,
			required: true,
		},
		columnCount: {
			type: Number,
			default: 5,
		},
		rightToLeft: Boolean,
		onArticleClick: Function,
		articles: {
			type: Array as PropType<Article[]>,
			required: true,
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

<style scoped lang='sass'>
.articlesContainer.rowContainer
	display: flex
	flex-wrap: wrap
	align-items: flex-start
</style>