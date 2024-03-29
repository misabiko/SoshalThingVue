<template>
	<div class='masonryContainer' ref='root'>
		<div class='masonryColumn' v-for='(column, colI) in columns' :key='colI'>
			<component
				:is='service.articleComponent'
				v-for='a in column' :key='a.article.id'
				:article='a.article'
				:onArticleClick='onArticleClick'
				:inheritedCompact='compactArticles'
				:filtered='a.filtered'
				@loading-full-media='$emit("loadingFullMedia", $event)'
				@done-loading='$emit("doneLoading", $event)'
				@expand='$emit("expand", $event)'
			></component>
		</div>
	</div>
</template>

<script lang='ts'>
import {computed, defineComponent, onBeforeUpdate, PropType} from 'vue'
import {LazyMedia, PlainMedia, MediaArticle, MediaLoadStatus, QueriedMedia, ArticlePacket} from '@/data/articles'
import {MediaService, Service} from '@/services'

type RatioedArticle = [ArticlePacket<MediaArticle>, number]

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
			type: Array as PropType<ArticlePacket<MediaArticle>[]>,
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

		const service = computed(() => Service.instances[props.serviceName])
		const columns = computed(() => arrangeColumns(Math.min(props.columnCount, props.articles.length), service.value, props.articles, props.rightToLeft))

		return {
			columns,
			service,
		}
	},
})

function getColumnHeight(column : [number, RatioedArticle[]]) {
	if (column[1].length)
		return column[1].map(articles => articles[1]).reduce((acc, curr) => acc + curr)
	else
		return 0
}

function arrangeColumns(columnCount : number, service: Service, articles : ArticlePacket<MediaArticle>[], rightToLeft: boolean) {
	const ratioedArticles : RatioedArticle[] = articles.map((a : ArticlePacket<MediaArticle>) => [a, getRelativeHeight(service.getMedias(a.article.id))])

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

function getRelativeHeight(medias : (PlainMedia | LazyMedia | QueriedMedia)[]) : number {
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