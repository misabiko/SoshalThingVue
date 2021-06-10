import { createApp } from 'vue'
import App from './App.vue'
import {Service} from '@/services'
import {TwitterService} from '@/services/Twitter'

Service.instances.push(new TwitterService())


Service.initLocalStorage().then(() =>
	createApp(App).mount('#app')
)
