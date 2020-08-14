import Vue from 'vue';
import App from './App.vue';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
import Buefy from 'buefy';
import 'buefy/dist/buefy.css';

Vue.component('FontAwesomeIcon', FontAwesomeIcon);

Vue.use(Buefy);

Vue.config.productionTip = false;

Vue.prototype.$logins = {
	twitter: false,
	mastodon: false,
	pixiv: false,
};

new Vue({
	el: '#soshalThing',
	template: '<App/>',
	components: {App},
});