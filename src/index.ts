import Vue from 'vue';
import App from './App.vue';
import './style.sass';

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