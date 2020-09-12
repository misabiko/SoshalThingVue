import {RateLimitStatus, StuffedResponse, TimelinePayload} from '../../core/ServerResponses';
import {TimelineOptions} from '../../core/Timeline';
import {Article, ArticleType, PostData, QuoteData, RepostData} from '../../core/PostData';
import Vue from 'vue';
import {SnackbarProgrammatic as Snackbar} from 'buefy';
import {store} from '../store';

export abstract class Service {
	endpoints : { [name : string] : Endpoint } = {};
	loggedIn = false;
	posts : { [id : string] : PostData } = {};
	reposts : { [id : string] : RepostData } = {};
	quotes : { [id : string] : QuoteData } = {};

	protected constructor(readonly name : string, readonly loginHref : string) {}

	addEndpoints(...endpoints : Endpoint[]) {
		for (const endpoint of endpoints)
			this.endpoints[endpoint.name] = endpoint;
	}

	refreshEndpoint(endpoint : string, timelineOptions : TimelineOptions) : Promise<TimelinePayload> {
		return this.endpoints[endpoint].refresh(this, timelineOptions);
	}

	getArticleData(article : Article) {
		switch (article.type) {
			case ArticleType.Post:
				return this.posts[article.id];
			case ArticleType.Repost:
				return this.reposts[article.id];
			case ArticleType.Quote:
				return this.quotes[article.id];
		}
	}

	getPostData(article : Article) : PostData {
		switch (article.type) {
			case ArticleType.Post:
				return this.posts[article.id];
			case ArticleType.Repost:
				return this.posts[this.reposts[article.id].repostedId];
			case ArticleType.Quote:
				return this.posts[this.quotes[article.id].quotedId];
		}
	}

	updatePostData(postData : PostData) {
		if (!postData)
			throw new Error(`PostData ${postData} isn't valid.`);

		Object.assign(this.posts[postData.id], postData);
	}

	updateArticleData(payload : { post? : PostData, repost? : RepostData, quote? : QuoteData }) {
		if (payload.post && this.posts[payload.post.id])
			Object.assign(this.posts[payload.post.id], payload.post);
		if (payload.repost && this.reposts[payload.repost.id])
			Object.assign(this.reposts[payload.repost.id], payload.repost);
		if (payload.quote && this.quotes[payload.quote.id])
			Object.assign(this.quotes[payload.quote.id], payload.quote);
	}

	abstract async like(id : string) : Promise<void>;

	abstract async unlike(id : string) : Promise<void>;

	async toggleLike(id : string) {
		if (this.posts[id].liked)
			await this.unlike(id);
		else
			await this.like(id);
	}

	abstract async repost(id : string) : Promise<void>;

	lostConnection() {
		const message = 'Lost connection to ' + this.name;
		Snackbar.open({
			message,
			type: 'is-danger',
			indefinite: true,
			actionText: 'Open Menu',
			onAction() {
				store.commit('setSidebarExpanded', true);
			}
		})
		this.loggedIn = false;
		return new Error(message);
	}

	abstract getUserURL(handle : string) : string;
}

export class Endpoint {
	rateLimitStatus : RateLimitStatus;
	readonly maxCount : number;
	readonly parameterSets : string[][];

	constructor(
		readonly name : string,
		readonly url : string,
		rateLimit : number,
		{
			maxCount = 100,
			parameterSets = [] as string[][],
		} = {},
	) {
		this.rateLimitStatus = {
			remaining: rateLimit,
			limit: rateLimit,
			reset: 0,
		};

		this.maxCount = maxCount;
		this.parameterSets = parameterSets;
	}

	async refresh(service : Service, timelineOptions : TimelineOptions) : Promise<TimelinePayload> {
		let options = new URLSearchParams(timelineOptions as any).toString();
		if (options.length)
			options = '?' + options;

		const response = await fetch(this.url + options);

		if (response.status == 401)
			throw service.lostConnection();
		else if (!response.ok)
			throw new Error(`Server error on refresh`);

		const stuffedResponse : StuffedResponse = await response.json();

		this.rateLimitStatus = stuffedResponse.rateLimitStatus;

		for (const postData of stuffedResponse.posts)
			if (!service.posts.hasOwnProperty(postData.id))
				Vue.set(service.posts, postData.id, postData);
			else
				service.updatePostData(postData);

		for (const repostData of stuffedResponse.reposts)
			if (!service.reposts.hasOwnProperty(repostData.id))
				Vue.set(service.reposts, repostData.id, repostData);
			else
				service.updateArticleData({repost: repostData});

		for (const quoteData of stuffedResponse.quotes)
			if (!service.quotes.hasOwnProperty(quoteData.id))
				Vue.set(service.quotes, quoteData.id, quoteData);
			else
				service.updateArticleData({quote: quoteData});

		return stuffedResponse.timelinePosts;
	}
}