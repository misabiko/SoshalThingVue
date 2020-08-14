import Vue from 'vue';
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome';
import Buefy from 'buefy';
import 'buefy/dist/buefy.css';
import App from './components/App.vue';
import store from './store';

Vue.component('FontAwesomeIcon', FontAwesomeIcon);

Vue.use(Buefy);

Vue.config.productionTip = false;

new Vue({
	el: '#soshalThing',
	template: '<App/>',
	components: {App},
	store,
});