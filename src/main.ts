import { createApp } from 'vue'
import App from './App.vue'
import {Service} from '@/services'
import {TwitterService} from '@/services/Twitter'

Service.instances.push(new TwitterService())

createApp(App).mount('#app')
