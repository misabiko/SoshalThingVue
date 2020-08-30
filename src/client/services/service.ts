import {RateLimitStatus} from '../../core/ServerResponses';

export abstract class Service {
	endpoints : { [name : string] : Endpoint } = {};
	loggedIn = false;

	protected constructor(public name : string, public loginHref : string) {}

	updateRates(rates : {[endpoint: string] : RateLimitStatus}) {
		for (const endpoint in rates) if (rates.hasOwnProperty(endpoint))
			this.endpoints[endpoint].rateLimitStatus = rates[endpoint];
	}
}

export class Endpoint {
	rateLimitStatus : RateLimitStatus;
	//postType :

	constructor(
		public name : string,
		rateLimit : number,
	) {
		this.rateLimitStatus = {
			remaining: rateLimit,
			limit: rateLimit,
			reset: 0,
		};
	}
}