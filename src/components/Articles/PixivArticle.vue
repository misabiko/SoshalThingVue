<template>
	<article class='article' :class='{hiddenArticle: filtered}' :articleId='article.id'>
		<component :is='medias'></component>
		<component :is='holderBoxes'></component>
	</article>
</template>

<script lang='ts'>
import {computed, defineComponent, h, PropType, toRefs} from 'vue'
import {PixivArticle, PixivService} from '@/services/pixiv'
import {useFavViewerButtons} from '@/composables/useFavViewerButtons'
import {useLazyMedia} from '@/composables/useLazyMedia'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import {library} from '@fortawesome/fontawesome-svg-core'
import {faSmile} from '@fortawesome/free-regular-svg-icons'
import {faHeart} from '@fortawesome/free-solid-svg-icons'
import {Service} from '@/services'

library.add(faSmile, faHeart)

export default defineComponent({
	name: 'PixivArticle',
	props: {
		onArticleClick: {
			type: Function as PropType<(id : string) => void>,
			required: true,
		},
		article: {
			type: Object as PropType<PixivArticle>,
			required: true,
		},
		filtered: Boolean,
	},

	setup(props) {
		const {article, onArticleClick} = toRefs(props)
		const bottomButtons = []

		const service = computed(() => Service.instances.Pixiv as PixivService)
		bottomButtons.push(
			() => {
				if (!article.value.liked)
					return h('button', {
							class: 'button',
							onClick: () => service.value.like(article.value.id),
						}, [
							h('span', {class: 'icon darkIcon is-small'},
								h(FontAwesomeIcon, {icon: ['far', 'smile']})
							)
						],
					)
			},
			() => {
				if (!article.value.bookmarked)
					return h('button', {
							class: 'button',
							onClick: () => service.value.bookmark(article.value.id, false),
						}, [
							h('span', {class: 'icon darkIcon is-small'},
								h(FontAwesomeIcon, {icon: ['fas', 'heart']})
							)
						],
					)
			},
		)

		const {medias} = useLazyMedia(<any>service, article, onArticleClick)
		const {holderBoxes} = useFavViewerButtons(<any>service, article, [], bottomButtons)

		return {medias, holderBoxes}
	},
})
</script>

<style lang='sass'>
.article
	position: relative

	& img, & video
		width: 100%

	&.hiddenArticle
		opacity: 0.1

article:hover .holderBox
	display: flex

.holderBox
	justify-content: space-between
	flex-wrap: nowrap
	position: absolute
	height: 45px
	width: 100%
	opacity: 0.5
	display: none

	& > *
		height: inherit
		padding-top: unset
		padding-bottom: unset

.holderBoxTop
	top: 0px

.holderBoxBottom
	bottom: 0px

img.articleMediaLoading
	position: absolute

.articleThumb
	z-index: -1

ul.articleTags
	list-style-type: none
</style>