export interface Article {
	id : string
	index : number	//TODO Remove index from base Article
	hidden : boolean
	queried : boolean
}

export interface MediaArticle extends Article {
	media : PlainMedia[] | QueriedMedia[] | LazyMedia[]
}

export enum MediaType {
	Image,
	Video,
}

export enum MediaLoadStatus {
	Plain,
	ThumbnailOnly,
	NothingLoaded,
	ReadyToLoad,
	Loading,
	FullyLoaded,
}

export type PlainMedia = {
	type : MediaType
	status : MediaLoadStatus.Plain
	content : ImageData
}

export type LazyMedia
	= {
	type : MediaType.Image
	status : MediaLoadStatus.ThumbnailOnly
	thumbnail : ImageData
}
	| {
	type : MediaType
	status : MediaLoadStatus.ReadyToLoad
	thumbnail : ImageData
	content : ImageData
}
	| {
	type : MediaType
	status : MediaLoadStatus.Loading
	thumbnail : ImageData
	content : ImageData
}
	| {
	type : MediaType
	status : MediaLoadStatus.FullyLoaded
	content : ImageData
}

export type QueriedMedia
	= {
		type : MediaType
	status : MediaLoadStatus.NothingLoaded }
	| {
	type : MediaType
	status : MediaLoadStatus.FullyLoaded
	content : ImageData
}

type MediaSize = { width : number, height : number }

export enum MediaFormat {
	JPG,
	PNG,
	GIF,
	MP4,
	WEBM,
}

export interface ImageData {
	url : string
	size? : MediaSize
	format : MediaFormat
}

export function isVideo(image : ImageData) {
	return image.format == MediaFormat.MP4 || image.format == MediaFormat.WEBM
}

export function getImageFormat(url : string) : MediaFormat {
	const extension = url.split('.').pop()?.toLowerCase()

	switch (extension) {
		case 'jpeg':
		case 'jpg':
			return MediaFormat.JPG
		case 'png':
			return MediaFormat.PNG
		case 'gif':
			return MediaFormat.GIF
		case 'mp4':
			return MediaFormat.MP4
		case 'webm':
			return MediaFormat.WEBM
		default:
			console.error(`Couldn't find the format for extension "${extension}" in url "${url}"`)
			return MediaFormat.JPG
	}
}