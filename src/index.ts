import Vue from 'vue';
import App from './App.vue';
import './style.sass';

Vue.config.productionTip = false;

const soshalThing = new Vue({
	el: '#soshalThing',
	template: '<App/>',
	components: {App},
});