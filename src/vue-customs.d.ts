// noinspection ES6UnusedImports
import Vue from 'vue'

declare module 'vue/types/vue' {
	interface Vue {
		$logins: {
			[service: string] : boolean
		}
	}
}