import Vue from 'vue'

declare module 'vue/types/vue' {
	interface VueConstructor {
		$logins: {
			[service: string] : boolean
		}
	}
}