export interface Article {
	id : string
	index : number	//TODO Remove index from base Article
	hidden : boolean
	queried : boolean
}

export interface MediaArticle extends Article {
	media : Media | QueriedMedia | LazyMedia | Media[] | QueriedMedia[] | LazyMedia[]
}

export interface SingleMediaArticle extends Article {
	media : Media | QueriedMedia | LazyMedia
}

export enum MediaLoadStatus {
	Plain,
	ThumbnailOnly,
	NothingLoaded,
	ReadyToLoad,
	Loading,
	FullyLoaded,
}

export type Media = {
	status : MediaLoadStatus.Plain
	content : ImageData
}

export type LazyMedia
	= { status : MediaLoadStatus.NothingLoaded }
	| {
	status : MediaLoadStatus.ThumbnailOnly
	thumbnail : ImageData
}
	| {
	status : MediaLoadStatus.ReadyToLoad
	thumbnail : ImageData
	content : ImageData
}
	| {
	status : MediaLoadStatus.Loading
	thumbnail : ImageData
	content : ImageData
}
	| {
	status : MediaLoadStatus.FullyLoaded
	content : ImageData
}

export type QueriedMedia
	= { status : MediaLoadStatus.NothingLoaded }
	| {
	status : MediaLoadStatus.FullyLoaded
	content : ImageData
}

type MediaSize = { width : number, height : number }

export enum ImageFormat {
	JPG,
	PNG,
	GIF,
	MP4,
	WEBM,
}

export interface ImageData {
	url : string
	size? : MediaSize
	format : ImageFormat
}

export function isVideo(image : ImageData) {
	return image.format == ImageFormat.MP4 || image.format == ImageFormat.WEBM
}

export function getImageFormat(url : string) : ImageFormat {
	const extension = url.split('.').pop()?.toLowerCase()

	switch (extension) {
		case 'jpeg':
		case 'jpg':
			return ImageFormat.JPG
		case 'png':
			return ImageFormat.PNG
		case 'gif':
			return ImageFormat.GIF
		case 'mp4':
			return ImageFormat.MP4
		case 'webm':
			return ImageFormat.WEBM
		default:
			console.error(`Couldn't find the format for extension "${extension}" in url "${url}"`)
			return ImageFormat.JPG
	}
}