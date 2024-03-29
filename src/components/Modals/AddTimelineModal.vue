<template>
	<div class='modal is-active' @click='$event.target.classList.contains("modal") && (modal = undefined)'>
		<div class='modal-background'/>
		<div class='modal-content'>
			<div class='card'>
				<header class='card-header'>
					<p class='card-header-title'>
						Add Timeline
					</p>
					<button class='card-header-icon' aria-label='more options' @click='modal = undefined'>
						<span class='icon'>
							<FontAwesomeIcon icon='times' aria-hidden='true'/>
						</span>
					</button>
				</header>
				<div class='card-content'>
					<div class='field'>
						<label class='label'>Title</label>
						<div class='control'>
							<input class='input' :class='{"is-danger": !validations.title}' type='text'
								   v-model='timelineData.title'>
						</div>
						<p v-if='!validations.title' class='help is-danger'>
							Timeline "{{ timelineData.title }}" already exists.
						</p>
					</div>
					<EndpointSelection v-model='timelineData'/>
					<div class='field'>
						<label class='label'>Container</label>
						<div class='control'>
							<div class='select'>
								<select v-model='timelineData.container'>
									<option v-for='c in containers' :value='c'>
										{{ c.replace('Container', '') }}
									</option>
								</select>
							</div>
						</div>
					</div>
					<SortOptions :sortConfig='sortConfig' :sortMethods='sortMethods'/>
					<FilterOptions :filterMethods='filterMethods' :filters='filters'/>
					<div class='field'>
						<div class='control'>
							<input type='checkbox' v-model='timelineData.rtl'/>
							Right to Left
						</div>
					</div>
					<div class='field'>
						<label class='label'>Column Count</label>
						<div class='control'>
							<input type='number' min='1' v-model.number='timelineData.columnCount'/>
						</div>
					</div>
					<div class='field'>
						<label class='label'>Width</label>
						<div class='control'>
							<input type='number' min='1' v-model.number='timelineData.size'/>
						</div>
					</div>
				</div>
				<footer class='card-footer'>
					<button
						class='button card-footer-item'
						@click='$emit("add", timelineData), timelineData = undefined, modal = undefined'
						:disabled='!valid'
					>Add
					</button>
					<button class='button card-footer-item' @click='modal = undefined'>Cancel</button>
				</footer>
			</div>
		</div>
	</div>
</template>

<script lang='ts'>
import {computed, defineComponent, onBeforeMount, PropType, ref} from 'vue'
import {HostPageService, Service} from '@/services'
import {library} from '@fortawesome/fontawesome-svg-core'
import {faTimes} from '@fortawesome/free-solid-svg-icons'
import {TimelineData} from '@/data/timelines'
import EndpointSelection from '@/components/EndpointSelection.vue'
import {getNewId} from '@/data/articleLists'
import {modal} from '@/composables/ModalManager'
import {useSortMethods} from '@/composables/useSortMethods'
import {useFilters} from '@/composables/useFilters'
import SortOptions from '@/components/SortOptions.vue'
import FilterOptions from '@/components/FilterOptions.vue'

library.add(faTimes)

const timelineData = ref<undefined | TimelineData>()

export function resetTimelineData(dataOverride? : any) {
	const serviceName = dataOverride?.serviceName
		?? Object.keys(Service.instances).find(s => (s as HostPageService).pageInfo)
		?? Object.keys(Service.instances)[0]

	const service = Service.instances[serviceName]

	timelineData.value = {
		endpointName: undefined,
		...service.initialTimelines()[0],
		title: 'New Timeline',
		articleList: getNewId(),
		serviceName,
		container: 'ColumnContainer',
		columnCount: 2,
		size: 1,
		filters: service.defaultFilters,
		sortConfig: {
			method: service.defaultSortMethod,
			reversed: false,
		},
		articleSection: {
			enabled: true,
			start: 0,
			end: 30,
			expandStep: 50,
		},
		...dataOverride,
	}

	const data = timelineData.value as TimelineData

	if (data.endpointName === undefined && data.endpointOptions === undefined) {
		if (Object.keys(service.endpoints).length)
			data.endpointName = Object.keys(service.endpoints)[0]
		else if (Object.keys(service.endpointTypes).length)
			data.endpointOptions = {endpointType: Object.keys(service.endpointTypes)[0]}
	}
}

export default defineComponent({
	components: {SortOptions, FilterOptions, EndpointSelection},
	props: {
		timelines: {
			type: Array as PropType<TimelineData[]>,
			required: true,
		},
	},

	setup() {
		//const {timelines} = toRefs(props)

		const service = computed(() => timelineData.value && Service.instances[timelineData.value.serviceName])

		//TODO Centralize containers
		const containers = [
			'ColumnContainer',
			'RowContainer',
			'MasonryContainer',
		]

		onBeforeMount(() => {
			if (!timelineData.value)
				resetTimelineData()
		})

		const validations = computed<{ [name : string] : boolean }>(() => ({title: true}))
		const valid = computed(() => Object.values(validations.value).every(isValid => isValid))

		const serviceSortMethods = computed(() => service.value?.sortMethods ?? {})
		const sortConfig = computed(() => timelineData.value?.sortConfig ?? {
			method: 'Unsorted',
			reversed: false,
		})
		const {sortMethods} = useSortMethods(sortConfig, serviceSortMethods)

		const serviceFitlers = computed(() => service.value?.filters ?? {})
		const filters = computed(() => timelineData.value?.filters ?? {})
		const {filterMethods} = useFilters(filters, serviceFitlers)

		return {
			modal,
			timelineData,
			services: Service.instances,
			service,
			containers,
			validations,
			valid,
			resetTimelineData,
			filters,
			filterMethods,
			sortMethods,
			sortConfig,
		}
	},
})
</script>

<style scoped lang='sass'>
@use '~@/sass/core' as *
@import "~bulma/sass/utilities/mixins"

.modal.is-active
	overflow: auto

.modalButtons
	position: fixed
	bottom: 20%
	left: 50%
	width: 0
	overflow: visible
	display: flex
	opacity: 0.5
	justify-content: center

	&:hover
		opacity: unset

//TODO Remove this when bulma is updated?
.card-header-icon
	background: 0 0
	border: 0
</style>