declare module '*.vue' {
	import Vue from 'vue';
	export default Vue;
}

declare module 'memorystore' {
	type MemoryStore = any;
	const ConnectMemoryStore : (expressSession : any) => MemoryStore;

	export default ConnectMemoryStore;
}