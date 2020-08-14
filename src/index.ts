import Vue from 'vue';
import App from './App.vue';
import {library} from '@fortawesome/fontawesome-svg-core';
import {faHeart as fasHeart, faPlus, faRetweet} from '@fortawesome/free-solid-svg-icons';
import {faHeart as farHeart} from '@fortawesome/free-regular-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';

library.add(fasHeart, farHeart, faRetweet, faPlus);

Vue.component('FontAwesomeIcon', FontAwesomeIcon);

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