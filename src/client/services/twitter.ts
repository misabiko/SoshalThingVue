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

	async like(id : string) {
		const json = await fetch(`twitter/like/${id}`, {method: 'POST'}).then(response => response.json());

		this.updateArticleData(json);
	}

	async unlike(id : string) {
		const json = await fetch(`twitter/unlike/${id}`, {method: 'POST'}).then(response => response.json());

		this.updateArticleData(json);
	}

	async repost(id : string) {
		if (this.posts[id].reposted)
			return;

		const json = await fetch(`twitter/retweet/${id}`, {method: 'POST'}).then(response => response.json());

		this.updateArticleData(json);
	}

	getUserURL(handle : string) : string {
		return 'https://twitter.com/' + handle;
	}
}