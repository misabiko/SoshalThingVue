export interface PostData {
	id : string,
	creationTime : string,
	authorName : string,
	authorHandle : string,
	authorAvatar : string,
	text : string,
	images? : string[],
	liked : boolean,
	reposted : boolean,
}

export interface RepostData extends PostData {
	reposterName : string,
	reposterHandle : string,
	reposterAvatar : string
}