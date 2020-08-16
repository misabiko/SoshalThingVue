import {PostData} from './PostData';

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

export interface StuffedResponse {
	services: ServiceStatuses;

	posts: PostData[];
}