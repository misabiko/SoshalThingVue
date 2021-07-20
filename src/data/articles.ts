export interface Article {
	id : string
	index : number	//TODO Remove index from base Article
	hidden : boolean
	queried : boolean
}

export interface MediaArticle extends Article {
	media : (PlainMedia | QueriedMedia | LazyMedia)[]
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
	content : MediaData
}

export type LazyMedia
	= {
	type : MediaType.Image
	status : MediaLoadStatus.ThumbnailOnly
	thumbnail : MediaData
}
	| {
	type : MediaType
	status : MediaLoadStatus.ReadyToLoad
	thumbnail : MediaData
	content : MediaData
}
	| {
	type : MediaType
	status : MediaLoadStatus.Loading
	thumbnail : MediaData
	content : MediaData
}
	| {
	type : MediaType
	status : MediaLoadStatus.FullyLoaded
	content : MediaData
}

export type QueriedMedia
	= {
		type : MediaType
	status : MediaLoadStatus.NothingLoaded }
	| {
	type : MediaType
	status : MediaLoadStatus.FullyLoaded
	content : MediaData
}

type MediaSize = { width : number, height : number }

export enum MediaFormat {
	JPG,
	PNG,
	GIF,
	MP4,
	WEBM,
}

export interface MediaData {
	url : string
	size? : MediaSize
	format : MediaFormat
	autoplay? : boolean
	loop? : boolean
	mute? : boolean
}

export function getMediaType(format : MediaFormat) {
	switch (format) {
		case MediaFormat.JPG:
		case MediaFormat.PNG:
		case MediaFormat.GIF:
			return MediaType.Image
		case MediaFormat.MP4:
		case MediaFormat.WEBM:
			return MediaType.Video
	}
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