import Vue from 'vue';
import Vuex, {ActionTree, GetterTree, MutationTree} from 'vuex';
import {ServiceStatuses, StuffedResponse} from '../core/ServerResponses';
import {PostData} from '../core/PostData';
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
	expandedPost : ExpandedPost = {
		id: '',
		selectedMedia: 0,
	};
}

const getters = <GetterTree<State, State>>{
	getPost: state => (id : string) => state.posts[id]
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
		for (const postData of postDatas) {
			if (!state.posts.hasOwnProperty(postData.id))
				Vue.set(state.posts, postData.id, postData);
		}
	},

	updatePostData(state, postData : PostData) {
		Object.assign(state.posts[postData.id], postData);
	},

	expandPost(state, post : ExpandedPost) {
		state.expandedPost = post;
	},

	clearExpandedPost(state) {
		state.expandedPost.id = '';
	}
};

const actions = <ActionTree<State, State>>{
	async refreshEndpoint({state, commit}, payload : { service : string, endpoint : string, options : TimelineOptions }) : Promise<string[]> {
		try {
			//TODO Use dynamic endpoint
			const response = await fetch('/twitter/tweets/' + payload.endpoint + (Object.keys(payload.options).length ? toURI(payload.options) : ''));

			if (response.status == 401) {
				//TODO Alert the message
				console.error('Lost connection to Twitter');
				commit('setLogin', {service: 'Twitter', login: false});
				return [];
			}else if (!response.ok)
				throw new Error(`Server error on refresh`);

			const json : StuffedResponse = await response.json();
			commit('updateServices', json.services);

			const newPosts = json.posts.reverse().filter(postData => !state.posts.hasOwnProperty(postData.id));
			commit('addPosts', newPosts);

			return newPosts.map(postData => postData.id);
		}catch (e) {
			throw e;
		}
	},

	async like({commit}, id : string) {
		const json = await fetch(`twitter/like/${id}`, {method: 'POST'}).then(response => response.json());

		commit('updatePostData', json.post);
	},

	async unlike({commit}, id : string) {
		const json = await fetch(`twitter/unlike/${id}`, {method: 'POST'}).then(response => response.json());

		commit('updatePostData', json.post);
	},

	toggleLike({state, dispatch}, id : string) {
		dispatch(state.posts[id].liked ? 'unlike' : 'like', id);
	},

	async repost({state, commit}, id : string) {
		if (state.posts[id].reposted)
			return;

		const json = await fetch(`twitter/retweet/${id}`, {method: 'POST'}).then(response => response.json());

		commit('updatePostData', json.post);
	}
};

//https://stackoverflow.com/a/57124645/2692695
function toURI(params : { [name : string] : any }) {
	return '?' + Object.entries(params)
		.map(
			([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`
		)
		.join('&');
}

export default new Vuex.Store({
	state: new State(),
	getters,
	mutations,
	actions,
});