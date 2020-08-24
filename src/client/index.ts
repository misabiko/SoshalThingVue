import Vue from 'vue';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
import './_bulma_overrides.sass';
import Buefy from 'buefy';
import App from './components/App.vue';
import store from './store';

Vue.component('FontAwesomeIcon', FontAwesomeIcon);

Vue.use(Buefy);

Vue.config.productionTip = false;

(window as any).app = new Vue({
	el: '#soshalThing',
	template: '<App/>',
	components: {App},
	store,
});