<template>
	<div class='masonryContainer' ref='root'>
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
import {LazyMedia, PlainMedia, MediaArticle, MediaLoadStatus, QueriedMedia} from '@/data/articles'
import {MediaService, Service} from '@/services'

type RatioedArticle = [MediaArticle, number]

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
			type: Array as PropType<MediaArticle[]>,
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

		return {
			columns,
			service: computed(() => Service.instances[props.serviceName])
		}
	},
})

function getColumnHeight(column : [number, RatioedArticle[]]) {
	if (column[1].length)
		return column[1].map(articles => articles[1]).reduce((acc, curr) => acc + curr)
	else
		return 0
}

function arrangeColumns(columnCount : number, articles : MediaArticle[], rightToLeft: boolean) {
	const ratioedArticles : RatioedArticle[] = articles.map((a : MediaArticle) => [a, getRelativeHeight(a.media)])

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

function getRelativeHeight(medias : PlainMedia[] | LazyMedia[] | QueriedMedia[]) : number {
	let sum = 1
	for (const media of (medias ?? []))
		switch (media.status) {
			case MediaLoadStatus.NothingLoaded:
				sum += 0
				break
			case MediaLoadStatus.ThumbnailOnly:
				sum += media.thumbnail.size ? media.thumbnail.size.height / media.thumbnail.size.width : 1
				break
			case MediaLoadStatus.Plain:
			case MediaLoadStatus.ReadyToLoad:
			case MediaLoadStatus.Loading:
			case MediaLoadStatus.FullyLoaded:
				sum += media.content.size ? media.content.size.height / media.content.size.width : 1
				break
		}

	return sum
}
</script>

<style scoped lang='sass'>
.masonryContainer
	display: flex
	flex-wrap: nowrap
	align-items: flex-start
	align-content: flex-start
	position: relative

.masonryColumn
	flex: 1 1 0
	min-width: 200px

.masonryColumn img
	width: 100%

.mainTimeline .masonryColumn
	width: unset
</style>