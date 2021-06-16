import {MediaFormat, MediaArticle, MediaLoadStatus, MediaType} from '@/data/articles'
import {computed, getCurrentInstance, h, onUpdated, Ref, VNode} from 'vue'
import {MediaService} from '@/services'
import {loadManager} from '@/composables/LoadManager'

export function useLazyMedia(service: Ref<MediaService>, article: Ref<MediaArticle>, onArticleClick: Ref<(id: string) => void>) {
	const instance = getCurrentInstance()
	if (!instance)
		throw "No current instance"

	const {emit} = instance

	const checkIfLoaded = () => {
		const video = document.querySelector(`.article${article.value.id} > video.articleMediaLoading`)
		if ((video as HTMLVideoElement)?.readyState) {
			emit('doneLoading', article.value.id)
		}
	}
	onUpdated(() => checkIfLoaded())

	const thumbnailUrl = computed(() => {
		switch (article.value.media[0].status) {
			case MediaLoadStatus.ThumbnailOnly:
			case MediaLoadStatus.ReadyToLoad:
			case MediaLoadStatus.Loading:
				return article.value.media[0].thumbnail.url
			default:
				return ''
		}
	})
	const imageUrl = computed(() => {
		switch (article.value.media[0].status) {
			case MediaLoadStatus.ReadyToLoad:
			case MediaLoadStatus.Loading:
			case MediaLoadStatus.FullyLoaded:
				return article.value.media[0].content.url
			default:
				return ''
		}
	})

	const medias = () => {
		switch (article.value.media[0].status) {
			case MediaLoadStatus.ThumbnailOnly:
			case MediaLoadStatus.ReadyToLoad:
				return [h('img', {
					src: thumbnailUrl.value,
					onClick: () => onArticleClick.value(article.value.id),
				})]
			case MediaLoadStatus.Loading:
				if (article.value.media[0].type == MediaType.Video) {
					const withoutExt = imageUrl.value.substring(0, imageUrl.value.lastIndexOf('.') + 1)
					return [
						h('video', {
							controls: '',
							loop: '',
							autoplay: '',
							muted: 'true',
							class: 'articleMediaLoading',
							mediaIndex: 0,
							onLoadedData: () => loadManager.doneLoadingArticle(article.value.id, 0, service.value),
							onLoad: () => loadManager.doneLoadingArticle(article.value.id, 0, service.value),
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
						mediaIndex: 0,
						src: imageUrl.value,
						onLoad: () => loadManager.doneLoadingArticle(article.value.id, 0, service.value),
						onClick: () => onArticleClick.value(article.value.id),
					}), h('img', {
						class: 'articleThumb',
						src: thumbnailUrl.value,
						onClick: () => onArticleClick.value(article.value.id),
					}),
					]
			case MediaLoadStatus.FullyLoaded:
				if (article.value.media[0].type == MediaType.Video)
					return [
						h('video', {
							controls: '',
							loop: '',
							autoplay: '',
							muted: 'true',
						}, [h('source', {
							src: imageUrl.value,
							onClick: () => onArticleClick.value(article.value.id),
							type: article.value.media[0].content.format == MediaFormat.MP4 ? 'video/mp4' : 'video/webm',
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