import Vue from 'vue';
import Vuex, {MutationTree} from 'vuex';
import TwitterService from './services/twitter';
import {Service} from './services/service';

Vue.use(Vuex);

export interface ExpandedPost {
	id : string
	selectedMedia : number
}

export class SoshalState {
	services : { [name : string] : Service } = {Twitter: new TwitterService()};
	expandedPost : ExpandedPost = {
		id: '',
		selectedMedia: 0,
	};
}

const mutations = <MutationTree<SoshalState>>{
	expandPost(state, post : ExpandedPost) {
		state.expandedPost = post;
	},

	clearExpandedPost(state) {
		state.expandedPost.id = '';
	},
};

export default new Vuex.Store({
	state: new SoshalState(),
	mutations,
});