import {Article, PostData, QuoteData, RepostData} from './PostData';

export interface RateLimitStatus {
	remaining: number;
	limit: number;
	reset: number;	//In seconds
}

export interface ServiceStatuses {
	[service: string]: {
		[endpoint: string] : RateLimitStatus;
	}
}

export interface TimelinePayload {
	newArticles: Article[],
	//modifiedArticles: Article[],
	//removedArticles: Article[],
}

export interface StuffedResponse {
	services: ServiceStatuses;
	posts: PostData[];
	reposts: RepostData[];
	quotes: QuoteData[];
	timelinePosts: TimelinePayload;
}