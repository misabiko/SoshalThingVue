import {RateLimitStatus, StuffedResponse, TimelinePayload} from '../../core/ServerResponses';
import {TimelineOptions} from '../../core/Timeline';
import {Article, ArticleType, PostData, QuoteData, RepostData} from '../../core/PostData';
import Vue from 'vue';
import {SnackbarProgrammatic as Snackbar} from 'buefy';
import {store} from '../store';
import moment from 'moment';

export abstract class Service {
	endpoints : { [name : string] : Endpoint } = {};
	loggedIn = false;
	posts : { [id : string] : PostData } = {};
	reposts : { [id : string] : RepostData } = {};
	quotes : { [id : string] : QuoteData } = {};

	protected constructor(readonly name : string, readonly loginHref : string) {
	}

	addEndpoints(...endpoints : Endpoint[]) {
		for (const endpoint of endpoints)
			this.endpoints[endpoint.name] = endpoint;
	}

	refreshEndpoint(endpoint : string, timelineOptions : TimelineOptions) : Promise<TimelinePayload> {
		return this.endpoints[endpoint].refresh(this, timelineOptions);
	}

	addOrUpdatePosts(...posts : PostData[]) {
		for (const postData of posts) {
			if (!this.posts.hasOwnProperty(postData.id))
				Vue.set(this.posts, postData.id, postData);
			else
				this.updatePostData(postData);
		}
	}

	addOrUpdateReposts(...reposts : RepostData[]) {
		for (const repostData of reposts) {
			if (!this.reposts.hasOwnProperty(repostData.id))
				Vue.set(this.reposts, repostData.id, repostData);
			else
				this.updateArticleData({repost: repostData});
		}
	}

	addOrUpdateQuotes(...quotes : QuoteData[]) {
		for (const quoteData of quotes) {
			if (!this.quotes.hasOwnProperty(quoteData.id))
				Vue.set(this.quotes, quoteData.id, quoteData);
			else
				this.updateArticleData({quote: quoteData});
		}
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
			},
		});
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

		service.addOrUpdatePosts(...stuffedResponse.posts);
		service.addOrUpdateReposts(...stuffedResponse.reposts);
		service.addOrUpdateQuotes(...stuffedResponse.quotes);

		return stuffedResponse.timelinePosts;
	}

	get ready() {
		return this.rateLimitStatus.remaining > 0;
	}

	get timeout() {
		if (this.ready)
			return 0;
		else
			return moment.duration(
				moment.unix(this.rateLimitStatus.reset).diff(moment()),
			).asMilliseconds() + 100;
	}
}