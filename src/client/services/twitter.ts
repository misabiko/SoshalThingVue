import {Endpoint, Service} from './service';

export default class TwitterService extends Service {
	constructor() {
		super('Twitter', '/twitter/login');

		this.endpoints['home_timeline'] = new Endpoint(
			'home_timeline',
			15,
		);
		this.endpoints['search'] = new Endpoint(
			'search',
			180,
		);
	}
}