import Vue from 'vue';
import App from './App.vue';
import './style.sass';

Vue.config.productionTip = false;

new Vue({
	el: '#soshalThing',
	template: '<App/>',
	components: {App},
});