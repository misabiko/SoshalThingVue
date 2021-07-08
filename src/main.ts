import { createApp } from 'vue'
import App from './App.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {Service} from '@/services'
import {TwitterService} from '@/services/twitter'
import {PixivService} from '@/services/pixiv'

Service.addService(new TwitterService())
Service.addService(new PixivService())

Service.initLocalStorage()
	.then(() => Service.fetchProxy('status'))
	.then(() =>
		createApp(App)
			.component('FontAwesomeIcon', FontAwesomeIcon)
			.mount('#app')
)
