import Vue from 'vue';
import Vuex, {ActionTree, GetterTree, MutationTree} from 'vuex';
import {TimelinePayload} from '../core/ServerResponses';
import {Article, ArticleType, PostData, QuoteData, RepostData} from '../core/PostData';
import {TimelineOptions} from '../core/Timeline';
import TwitterService from './services/twitter';
import {AuthError, Service} from './services/service';

Vue.use(Vuex);

export interface ExpandedPost {
	id : string
	selectedMedia : number
}

export class SoshalState {
	services : { [name : string] : Service } = {Twitter: new TwitterService()};
	posts : { [id : string] : PostData } = {};
	reposts : { [id : string] : RepostData } = {};
	quotes : { [id : string] : QuoteData } = {};
	expandedPost : ExpandedPost = {
		id: '',
		selectedMedia: 0,
	};
}

const getters = <GetterTree<SoshalState, SoshalState>>{
	getPost: state => (id : string) => state.posts[id],
	getRepost: state => (id : string) => state.reposts[id],
	getQuote: state => (id : string) => state.quotes[id],
	getArticleData: state => (article : Article) => {
		switch (article.type) {
			case ArticleType.Post:
				return state.posts[article.id];
			case ArticleType.Repost:
				return state.reposts[article.id];
			case ArticleType.Quote:
				return state.quotes[article.id];
			default:
				return undefined;
		}
	},
};

const mutations = <MutationTree<SoshalState>>{
	addPosts(state, postDatas : PostData[]) {
		for (const postData of postDatas)
			if (!state.posts.hasOwnProperty(postData.id))
				Vue.set(state.posts, postData.id, postData);
	},

	addReposts(state, repostDatas : RepostData[]) {
		for (const repostData of repostDatas)
			if (!state.reposts.hasOwnProperty(repostData.id))
				Vue.set(state.reposts, repostData.id, repostData);
	},

	addQuotes(state, quoteDatas : QuoteData[]) {
		for (const quoteData of quoteDatas)
			if (!state.quotes.hasOwnProperty(quoteData.id))
				Vue.set(state.quotes, quoteData.id, quoteData);
	},

	updatePostData(state, postData : PostData) {
		if (!postData)
			throw new Error(`PostData ${postData} isn't valid.`);

		Object.assign(state.posts[postData.id], postData);
	},

	updateArticleData(state, payload : { post? : PostData, repost? : RepostData, quote? : QuoteData }) {
		if (payload.post && state.posts[payload.post.id])
			Object.assign(state.posts[payload.post.id], payload.post);
		if (payload.repost && state.reposts[payload.repost.id])
			Object.assign(state.reposts[payload.repost.id], payload.repost);
		if (payload.quote && state.quotes[payload.quote.id])
			Object.assign(state.quotes[payload.quote.id], payload.quote);
	},

	expandPost(state, post : ExpandedPost) {
		state.expandedPost = post;
	},

	clearExpandedPost(state) {
		state.expandedPost.id = '';
	},
};

const actions = <ActionTree<SoshalState, SoshalState>>{
	async refreshEndpoint({state, commit}, payload : { service : string, endpoint : string, options : TimelineOptions }) : Promise<TimelinePayload> {
		try {
			return await state.services[payload.service].endpoints[payload.endpoint].refresh(commit, payload.options);
		}catch (e) {
			if (e instanceof AuthError) {
				//TODO Alert the message
				console.error('Lost connection to ' + payload.service);
				state.services[payload.service].loggedIn = false;
				return {newArticles: []};
			}else
				throw e;
		}
	},

	async like({commit}, id : string) {
		const json = await fetch(`twitter/like/${id}`, {method: 'POST'}).then(response => response.json());

		commit('updateArticleData', json);
	},

	async unlike({commit}, id : string) {
		const json = await fetch(`twitter/unlike/${id}`, {method: 'POST'}).then(response => response.json());

		commit('updateArticleData', json);
	},

	toggleLike({state, dispatch}, id : string) {
		dispatch(state.posts[id].liked ? 'unlike' : 'like', id);
	},

	async repost({state, commit}, id : string) {
		if (state.posts[id].reposted)
			return;

		const json = await fetch(`twitter/retweet/${id}`, {method: 'POST'}).then(response => response.json());

		commit('updateArticleData', json);
	},
};

export default new Vuex.Store({
	state: new SoshalState(),
	getters,
	mutations,
	actions,
});