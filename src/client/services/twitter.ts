import {Endpoint, Service} from './service';
export default class TwitterService extends Service {
	constructor() {
		super('Twitter', '/twitter/login');

		this.addEndpoints(
			new Endpoint(
				'home_timeline',
				'/twitter/tweets/home_timeline',
				15,
				{maxCount: 200},
			),
			new Endpoint(
				'user_timeline',
				'/twitter/tweets/user_timeline',
				900,
				{
					maxCount: 200,
					parameterSets: [['userId'], ['userHandle']],
				},
			),
			new Endpoint(
				'mentions_timeline',
				'/twitter/tweets/mentions_timeline',
				900,
				{maxCount: 200},
			),
			new Endpoint(
				'list',
				'/twitter/tweets/list',
				900,
				{parameterSets: [['listId'], ['listSlug', 'userId'], ['listSlug', 'userHandle']]},
			),
			new Endpoint(
				'search',
				'/twitter/tweets/search',
				180,
				{
					parameterSets: [['q']]
				},
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