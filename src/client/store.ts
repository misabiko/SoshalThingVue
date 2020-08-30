import Vue from 'vue';
import Vuex, {ActionTree, GetterTree, MutationTree} from 'vuex';
import {ServiceStatuses, StuffedResponse, TimelinePayload} from '../core/ServerResponses';
import {Article, ArticleType, PostData, QuoteData, RepostData} from '../core/PostData';
import {TimelineOptions} from '../core/Timeline';
import TwitterService from './services/twitter';
import {Service} from './services/service';

Vue.use(Vuex);

export interface ExpandedPost {
	id : string
	selectedMedia : number
}

class State {
	services : { [name : string] : Service } = {Twitter: new TwitterService()};
	posts : { [id : string] : PostData } = {};
	reposts : { [id : string] : RepostData } = {};
	quotes : { [id : string] : QuoteData } = {};
	expandedPost : ExpandedPost = {
		id: '',
		selectedMedia: 0,
	};
}

const getters = <GetterTree<State, State>>{
	getService: state => (name : string) => state.services[name],
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

const mutations = <MutationTree<State>>{
	updateLogins(state, logins : { [service : string] : boolean }) {
		for (const service in logins) if (logins.hasOwnProperty(service))
			state.services[service].loggedIn = logins[service];
	},

	updateServices(state, statuses : ServiceStatuses) {
		for (const service in statuses) if (statuses.hasOwnProperty(service)) {
			if (!state.services.hasOwnProperty(service))
				console.error(`Service ${service} has not been added.`);
			else
				state.services[service].updateRates(statuses[service]);
		}
	},

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

const actions = <ActionTree<State, State>>{
	async refreshEndpoint({state, commit}, payload : { service : string, endpoint : string, options : TimelineOptions }) : Promise<TimelinePayload> {
		//TODO Use dynamic endpoint
		let options = new URLSearchParams(payload.options as any).toString();
		if (options.length)
			options = '?' + options;

		const response = await fetch(`/twitter/tweets/${payload.endpoint}${options}`);

		if (response.status == 401) {
			//TODO Alert the message
			console.error('Lost connection to Twitter');
			state.services['Twitter'].loggedIn = false;
			return {newArticles: []};
		}else if (!response.ok)
			throw new Error(`Server error on refresh`);

		const stuffedResponse : StuffedResponse = await response.json();
		commit('updateServices', stuffedResponse.services);

		commit('addPosts', stuffedResponse.posts);
		commit('addReposts', stuffedResponse.reposts);
		commit('addQuotes', stuffedResponse.quotes);

		return stuffedResponse.timelinePosts;
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
	state: new State(),
	getters,
	mutations,
	actions,
});