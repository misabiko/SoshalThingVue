export interface PostData {
	id : string
	creationTime : string
	authorName : string
	authorHandle : string
	authorAvatar : string
	text : string
	images? : PostImageData[]
	video? : PostVideoData
	liked : boolean
	reposted : boolean
}

export interface RepostData extends PostData {
	reposterName : string
	reposterHandle : string
	reposterAvatar : string
}

export interface PostImageData {
	url : string
	sizes : {
		[name : string] : {
			w : number
			h : number
			resize : string
		}
	}
}

export interface PostVideoData extends PostImageData {
	type: string
	aspectRatio: number[]
	durationMillis?: number
	variants: PostVideoVariant[]
	autoplay: boolean
}

export interface PostVideoVariant {
	url: string
	contentType: string
	bitrate: number
}