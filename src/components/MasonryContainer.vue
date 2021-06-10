<template>
	<div class='timelineArticles timelineMasonry masonrySqueezed' ref='root'>
		<div class='masonryColumn' v-for='(column, colI) in columns' :key='colI'>
			<component
				:is='service.articleComponent'
				v-for='a in column' :key='a.id'
				:article='a'
				:service='service'
				:on-article-click='onArticleClick'
				@loading-full-media='$emit("loadingFullMedia", $event)'
				@done-loading='$emit("doneLoading", $event)'
				@expand='$emit("expand", $event)'
			></component>
		</div>
	</div>
</template>

<script lang='ts'>
import {computed, defineComponent, onBeforeUpdate, PropType} from 'vue'
import {Article, LazyMedia, Media, MediaLoadStatus} from '@/data/articles'
import {Service} from '@/services'

type RatioedArticle = [Article, number]

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

		const columns = computed(() => arrangeColumns(Math.min(props.columnCount, props.articles.length), props.articles, props.rightToLeft))

		return {columns}
	},
})

function getColumnHeight(column : [number, RatioedArticle[]]) {
	if (column[1].length)
		return column[1].map(articles => articles[1]).reduce((acc, curr) => acc + curr)
	else
		return 0
}

function arrangeColumns(columnCount : number, articles : Article[], rightToLeft: boolean) {
	const ratioedArticles : RatioedArticle[] = articles.map((a : Article) => [a, getAspectRatio(a.media)])

	const cols : [number, RatioedArticle[]][] = []
	for (let i = 0; i < columnCount; i++)
		cols.push([i, []])

	for (const ratioed of ratioedArticles) {
		cols.sort((f, s) => getColumnHeight(f) - getColumnHeight(s))
		cols[0][1].push(ratioed)
	}

	cols.sort(rightToLeft ? (f, s) => s[0] - f[0] : (f, s) => f[0] - s[0])

	return cols.map(column => column[1].map((ratioed : RatioedArticle) => ratioed[0]))
}

function getAspectRatio(media : Media | LazyMedia) : number {
	switch (media.status) {
		case MediaLoadStatus.NothingLoaded:
			return 1
		case MediaLoadStatus.ThumbnailOnly:
			return media.thumbnail.size ? media.thumbnail.size.height / media.thumbnail.size.width : 1
		case MediaLoadStatus.Plain:
		case MediaLoadStatus.ReadyToLoad:
		case MediaLoadStatus.Loading:
		case MediaLoadStatus.FullyLoaded:
			return media.content.size ? media.content.size.height / media.content.size.width : 1
	}
}
</script>

<style scoped lang='sass'>
.timelineArticles
	overflow-y: scroll
	overflow-x: hidden
	flex-grow: 1
	height: 100%
	width: 500px

.timelineArticles.timelineMasonry
	display: flex
	flex-wrap: nowrap
	align-items: flex-start
	align-content: flex-start
	position: relative
	width: fit-content

	&.masonrySqueezed
		width: 100%

.masonryColumn
	flex: 1 1 0
	width: 500px

.masonrySqueezed .masonryColumn
	width: unset

.masonryColumn img
	width: 100%
</style>