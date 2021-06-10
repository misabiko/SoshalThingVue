import {Article, ImageFormat, isVideo, MediaLoadStatus} from '@/data/articles'
import {computed, getCurrentInstance, h, onUpdated, Ref, VNode} from 'vue'
import {Service} from '@/services'
import {useLoadManagerArticle} from '@/composables/LoadManager'

export function useLazyMedia(service: Ref<Service>, article: Ref<Article>, onArticleClick: Ref<(id: string) => void>) {
	const instance = getCurrentInstance()
	if (!instance)
		throw "No current instance"

	const {emit} = instance

	const {startLoading, doneLoading} = useLoadManagerArticle()

	const checkIfLoaded = () => {
		const video = document.querySelector(`.article${article.value.id} > video.articleMediaLoading`)
		if ((video as HTMLVideoElement)?.readyState) {
			emit('doneLoading', article.value.id)
		}
	}
	onUpdated(() => checkIfLoaded())

	const thumbnailUrl = computed(() => {
		switch (article.value.media.status) {
			case MediaLoadStatus.ThumbnailOnly:
			case MediaLoadStatus.ReadyToLoad:
			case MediaLoadStatus.Loading:
				return article.value.media.thumbnail.url
			default:
				return ''
		}
	})
	const imageUrl = computed(() => {
		switch (article.value.media.status) {
			case MediaLoadStatus.ReadyToLoad:
			case MediaLoadStatus.Loading:
			case MediaLoadStatus.FullyLoaded:
				return article.value.media.content.url
			default:
				return ''
		}
	})

	const medias = () => {
		switch (article.value.media.status) {
			case MediaLoadStatus.ThumbnailOnly:
			case MediaLoadStatus.ReadyToLoad:
				return [h('img', {
					src: thumbnailUrl.value,
					onClick: () => onArticleClick.value(article.value.id),
				})]
				break
			case MediaLoadStatus.Loading:
				if (isVideo(article.value.media.content)) {
					const withoutExt = imageUrl.value.substring(0, imageUrl.value.lastIndexOf('.') + 1)
					return [
						h('video', {
							controls: '',
							loop: '',
							autoplay: '',
							muted: 'true',
							class: 'articleMediaLoading',
							onLoadedData: () => doneLoading(article.value.id, service.value),
							onLoad: () => doneLoading(article.value.id, service.value),
							onClick: () => onArticleClick.value(article.value.id),
						}, [h('source', {
							src: withoutExt + 'webm',
							type: 'video/webm',
						}), h('source', {
							src: withoutExt + 'mp4',
							type: 'video/mp4',
						})]),
					]
				}else
					return [h('img', {
						class: 'articleMediaLoading',
						src: imageUrl.value,
						onLoad: () => doneLoading(article.value.id, service.value),
						onClick: () => onArticleClick.value(article.value.id),
					}), h('img', {
						class: 'articleThumb',
						src: thumbnailUrl.value,
						onClick: () => onArticleClick.value(article.value.id),
					}),
					]
				break
			case MediaLoadStatus.FullyLoaded:
				if (isVideo(article.value.media.content))
					return [
						h('video', {
							controls: '',
							loop: '',
							autoplay: '',
							muted: 'true',
						}, [h('source', {
							src: imageUrl.value,
							onClick: () => onArticleClick.value(article.value.id),
							type: article.value.media.content.format == ImageFormat.MP4 ? 'video/mp4' : 'video/webm',
						})]),
					]
				else
					return [h('img', {
						src: imageUrl.value,
						onClick: () => onArticleClick.value(article.value.id),
					})]
				break
		}
	}

	return {medias}
}