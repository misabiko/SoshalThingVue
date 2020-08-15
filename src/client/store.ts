import Vue from 'vue';
import Vuex, {MutationTree} from 'vuex';

Vue.use(Vuex);

export interface Logins {
	[service: string] : boolean
}

class State {
	logins: Logins = {
		Twitter: false,
		Mastodon: false,
		Pixiv: false,
	};
}

const mutations = <MutationTree<State>>{
	updateLogins(state, payload) {
		for (const service in payload)
			if (payload.hasOwnProperty(service))
				state.logins[service] = payload[service];
	},

	setLogin(state, payload) {
		state.logins[payload.service] = payload.login;
	}
};

export default new Vuex.Store({
	state: new State(),
	mutations,
});