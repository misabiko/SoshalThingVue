import Vue from 'vue';
import Vuex, {MutationTree} from 'vuex';
import TwitterService from './services/twitter';
import {Service} from './services/service';

Vue.use(Vuex);

export interface ExpandedPost {
	service? : Service;
	id : string;
	selectedMedia : number;
}

export class SoshalState {
	services : { [name : string] : Service } = {Twitter: new TwitterService()};
	expandedPost : ExpandedPost = {
		id: '',
		selectedMedia: 0,
	};
	currentModal = '';
	sidebarExpanded = false;
	userTimelineBuffer : string[] = [];
	timelineArticleRadius = 10;
	timelineUnloadMinimum = 35;
}

const mutations = <MutationTree<SoshalState>>{
	expandPost(state, post : ExpandedPost) {
		state.expandedPost = post;
		state.currentModal = 'PostCard';
	},

	setSidebarExpanded(state, expanded : boolean) {
		state.sidebarExpanded = expanded;
	},

	searchId(state) {
		state.currentModal = 'SearchId'
	},

	addUserTimeline(state, handle : string) {
		state.userTimelineBuffer.push(handle);
	},

	clearUserTimelines(state) {
		state.userTimelineBuffer = [];
	},

	clearModal(state) {
		state.currentModal = '';

		state.expandedPost.id = '';
	}
};

export const store = new Vuex.Store({
	state: new SoshalState(),
	mutations,
});