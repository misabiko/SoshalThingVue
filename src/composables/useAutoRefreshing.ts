import {computed, ref, Ref} from 'vue'
import {EndpointPackage, EndpointPackageType} from '@/components/Timeline.vue'

export function useAutoRefreshing(endpointPackages : Readonly<Ref<EndpointPackage[]>>, getNewArticles : Function) {
	const intervalIds = ref<undefined | {[endpointName : string] : number}>()

	const isRefreshing = computed( {
		get: () => intervalIds.value !== undefined,
		set: val => {
			if (val)
				startRefresh()
			else
				stopRefresh()
		}
	})

	function startRefresh() {
		if (intervalIds.value !== undefined)
			return

		console.debug('Starting refresh')
		intervalIds.value = {}
		for (const ePackage of endpointPackages.value) {
			if (ePackage.type === EndpointPackageType.NoEndpoint)
				continue

			intervalIds.value[ePackage.endpoint.name] = setInterval(getNewArticles, ePackage.endpoint.defaultRefreshIntervalMs)
		}
	}

	function stopRefresh() {
		if (intervalIds.value === undefined)
			return

		console.debug('Stopping refresh')
		for (const id of Object.values(intervalIds.value))
			clearInterval(id)

		intervalIds.value = undefined
	}

	function resetInterval() {
		stopRefresh()
		startRefresh()
	}

	return {isRefreshing, resetInterval}
}