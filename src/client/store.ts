import Vue from 'vue';
import Vuex, {ActionTree, GetterTree, MutationTree} from 'vuex';
import {ServiceStatuses, StuffedResponse, TimelinePayload} from '../core/ServerResponses';
import {Article, ArticleType, PostData, QuoteData, RepostData} from '../core/PostData';
import {TimelineOptions} from '../core/Timeline';

Vue.use(Vuex);

export interface Logins {
	[service : string] : boolean
}

export interface ExpandedPost {
	id : string
	selectedMedia : number
}

class State {
	logins : Logins = {
		Twitter: false,
		Mastodon: false,
		Pixiv: false,
	};
	services : ServiceStatuses = {};
	posts : { [id : string] : PostData } = {};
	reposts : { [id : string] : RepostData } = {};
	quotes : { [id : string] : QuoteData } = {};
	expandedPost : ExpandedPost = {
		id: '',
		selectedMedia: 0,
	};
}

const getters = <GetterTree<State, State>>{
	getPost: state => (id : string) => state.posts[id],
	getRepost: state => (id : string) => state.reposts[id],
	getQuote: state => (id : string) => state.quotes[id],
	getArticleData: state => (article : Article) => {
		switch(article.type) {
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
	updateLogins(state, logins : Logins) {
		for (const service in logins)
			if (logins.hasOwnProperty(service))
				state.logins[service] = logins[service];
	},

	setLogin(state, login : { service : string, login : boolean }) {
		state.logins[login.service] = login.login;
	},

	updateServices(state, statuses : ServiceStatuses) {
		for (const service in statuses)
			if (statuses.hasOwnProperty(service)) {
				if (!state.services.hasOwnProperty(service)) {
					Vue.set(state.services, service, statuses[service]);
					continue;
				}

				for (const endpoint in statuses[service])
					if (statuses[service].hasOwnProperty(endpoint)) {
						if (!(state.services[service]).hasOwnProperty(endpoint))
							Vue.set(state.services[service], endpoint, statuses[service][endpoint]);
						else
							state.services[service][endpoint] = statuses[service][endpoint];
					}
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

	updateArticleData(state, payload: {post?: PostData, repost?: RepostData, quote?: QuoteData}) {
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
		const response = await fetch('/twitter/tweets/' + payload.endpoint + (Object.keys(payload.options).length ? toURI(payload.options) : ''));

		if (response.status == 401) {
			//TODO Alert the message
			console.error('Lost connection to Twitter');
			commit('setLogin', {service: 'Twitter', login: false});
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

//TODO Remove this
//https://stackoverflow.com/a/57124645/2692695
function toURI(params : { [name : string] : any }) {
	return '?' + Object.entries(params)
		.map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
		.join('&');
}

export default new Vuex.Store({
	state: new State(),
	getters,
	mutations,
	actions,
});