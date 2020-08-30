import {RateLimitStatus, StuffedResponse, TimelinePayload} from '../../core/ServerResponses';
import {Commit} from 'vuex';
import {TimelineOptions} from '../../core/Timeline';

export abstract class Service {
	endpoints : { [name : string] : Endpoint } = {};
	loggedIn = false;

	protected constructor(public name : string, public loginHref : string) {}

	addEndpoints(...endpoints : Endpoint[]) {
		for (const endpoint of endpoints)
			this.endpoints[endpoint.name] = endpoint;
	}
}

export class Endpoint {
	rateLimitStatus : RateLimitStatus;
	//postType :

	constructor(
		public name : string,
		public url : string,
		rateLimit : number,
	) {
		this.rateLimitStatus = {
			remaining: rateLimit,
			limit: rateLimit,
			reset: 0,
		};
	}

	async refresh(commit : Commit, timelineOptions : TimelineOptions) : Promise<TimelinePayload> {
		let options = new URLSearchParams(timelineOptions as any).toString();
		if (options.length)
			options = '?' + options;

		const response = await fetch(this.url + options);

		if (response.status == 401)
			throw new AuthError();
		else if (!response.ok)
			throw new Error(`Server error on refresh`);

		const stuffedResponse : StuffedResponse = await response.json();

		this.rateLimitStatus = stuffedResponse.rateLimitStatus;

		commit('addPosts', stuffedResponse.posts);
		commit('addReposts', stuffedResponse.reposts);
		commit('addQuotes', stuffedResponse.quotes);

		return stuffedResponse.timelinePosts;
	}
}

export class AuthError extends Error {}