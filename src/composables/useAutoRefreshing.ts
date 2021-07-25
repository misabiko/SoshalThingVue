import {Endpoint} from '@/services'
import {computed, ref, Ref, watch} from 'vue'

export function useAutoRefreshing(endpoint : Readonly<Ref<undefined | Endpoint<any>>>, getNewArticles : Function) {
	const intervalId = ref<undefined | number>()

	function startRefresh() {
		if (intervalId.value === undefined && endpoint.value !== undefined) {
			console.debug('Starting refresh for ' + endpoint.value.name)
			intervalId.value = setInterval(getNewArticles, endpoint.value.defaultRefreshIntervalMs)
		}
	}

	function stopRefresh() {
		console.debug('Stopping refresh for ' + endpoint.value?.name)
		clearInterval(intervalId.value)
		intervalId.value = undefined
	}

	function resetInterval() {
		stopRefresh()
		startRefresh()
	}

	const isRefreshing = computed( {
		get: () => intervalId.value !== undefined,
		set: val => {
			if (val)
				startRefresh()
			else
				stopRefresh()
		}
	})

	return {isRefreshing, resetInterval}
}