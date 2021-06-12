import { createApp } from 'vue'
import App from './App.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {Service} from '@/services'
import {TwitterService} from '@/services/Twitter'

Service.instances.push(new TwitterService())


Service.initLocalStorage().then(() =>
	createApp(App)
		.component('FontAwesomeIcon', FontAwesomeIcon)
		.mount('#app')
)
