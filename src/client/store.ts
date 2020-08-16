import Vue from 'vue';
import Vuex, {MutationTree} from 'vuex';
import {ServiceStatuses} from '../core/ServerResponses';

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

	services: ServiceStatuses = {};
}

const mutations = <MutationTree<State>>{
	updateLogins(state, payload) {
		for (const service in payload)
			if (payload.hasOwnProperty(service))
				state.logins[service] = payload[service];
	},

	setLogin(state, payload) {
		state.logins[payload.service] = payload.login;
	},

	updateServices(state, payload : ServiceStatuses) {
		for (const service in payload)
			if (payload.hasOwnProperty(service)) {
				if (!state.services.hasOwnProperty(service)) {
					Vue.set(state.services, service, payload[service]);
					continue;
				}

				for (const endpoint in payload[service])
					if (payload[service].hasOwnProperty(endpoint)) {
						if (!(state.services[service]).hasOwnProperty(endpoint))
							Vue.set(state.services[service], endpoint, payload[service][endpoint]);
						else
							state.services[service][endpoint] = payload[service][endpoint];
					}
			}
	}
};

export default new Vuex.Store({
	state: new State(),
	mutations,
});