import {Endpoint, Service} from './service';

export default class TwitterService extends Service {
	constructor() {
		super('Twitter', '/twitter/login');

		this.addEndpoints(
			new Endpoint(
				'home_timeline',
				'/twitter/tweets/home_timeline',
				15,
			),
			new Endpoint(
				'search',
				'/twitter/tweets/search',
				180,
			),
		);
	}
}