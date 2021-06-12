<template>
	<div class='timelineArticles'>
		<template v-for='a in articles' key='a.id'>
			<ArticleComponent
				:article='a'
				v-if='showHidden || !a.hidden'
				:on-article-click='onArticleClick'
				@expand='$emit("expand", $event)'
			></ArticleComponent>
		</template>
	</div>
</template>

<script lang='ts'>
import {defineComponent, PropType} from 'vue'
import {Article} from '@/data/articles'
import ArticleComponent from '@/components/Articles/TweetArticle.vue'

export default defineComponent({
	components: {ArticleComponent},
	props: {
		articles: {
			type: Array as PropType<Article[]>,
			default: []
		},
		showHidden: Boolean,
		onArticleClick: Function
	}
})
</script>

<style scoped lang='sass'>
.timelineArticles
	overflow-y: scroll
	overflow-x: hidden
	flex-grow: 1
	height: 100%
	width: 500px
</style>