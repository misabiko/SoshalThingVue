<template>
	<div class='modal is-active' @click='$emit($event.target.className.includes("modal") ? "close" : "")'>
		<div class='modal-background'/>
		<div class='modal-content'>
			<div class='card'>
				<header class='card-header'>
					<p class='card-header-title'>
						Add Timeline
					</p>
					<button class='card-header-icon' aria-label='more options' @click='$emit("close")'>
						<span class='icon'>
							<FontAwesomeIcon icon='times' aria-hidden='true'/>
						</span>
					</button>
				</header>
				<div class='card-content'>
					<div class='field'>
						<label class='label'>Title</label>
						<div class='control'>
							<input class='input' :class='{"is-danger": !validations.title}' type='text' v-model='timelineData.title'>
						</div>
						<p v-if='!validations.title' class='help is-danger'>
							Timeline "{{ timelineData.title }}" already exists.
						</p>
					</div>
					<div class='field'>
						<label class='label'>Service</label>
						<div class='control'>
							<div class='select'>
								<select v-model='timelineData.serviceIndex'>
									<option v-for='(s, i) in services' :value='i'>
										{{ s.name }}
									</option>
								</select>
							</div>
						</div>
					</div>
					<div class='field' v-if='Object.values(service.endpointTypes).length'>
						<div class='control'>
							<input type='checkbox' v-model='newEndpoint'/>
							New Endpoint?
						</div>
					</div>
					<div class='field' v-if='newEndpoint'>
						<label class='label'>Endpoint Type</label>
						<div class='control'>
							<div class='select'>
								<select v-model='endpointType'>
									<option v-for='(e, i) in service.endpointTypes' :value='i'>
										{{ i }}
									</option>
								</select>
							</div>
						</div>
					</div>
					<div class='field' v-else>
						<label class='label'>Endpoint</label>
						<div class='control'>
							<div class='select'>
								<select v-model='timelineData.endpointIndex'>
									<option v-for='(e, i) in service.endpoints' :value='i'>
										{{ e.name }}
									</option>
								</select>
							</div>
						</div>
					</div>
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
					<div class='field'>
						<label class='label'>Defaults</label>
						<div class='control'>
							<input type='checkbox' v-model='timelineData.defaults.rtl'/>
							Right to Left
						</div>
					</div>
				</div>
				<footer class='card-footer'>
					<button
						class='button card-footer-item'
						@click='$emit("add", timelineData), $emit("close")'
						:disabled='!valid'
					>Add</button>
					<button class='button card-footer-item' @click='$emit("close")'>Cancel</button>
				</footer>
			</div>
		</div>
	</div>
</template>

<script lang='ts'>
import {computed, defineComponent, PropType, ref, toRefs, watch} from 'vue'
import {HostPageService, Service} from '@/services'
import {library} from '@fortawesome/fontawesome-svg-core'
import {faTimes} from '@fortawesome/free-solid-svg-icons'
import {TimelineData} from '@/data/timelines'

library.add(faTimes)

export default defineComponent({
	props: {
		timelines: {
			type: Array as PropType<TimelineData[]>,
			required: true,
		}
	},

	setup(props) {
		const {timelines} = toRefs(props)

		let firstServiceIndex = Service.instances.findIndex(s => (s as HostPageService).pageInfo)
		if (firstServiceIndex < 0)
			firstServiceIndex = 0

		const timelineData = ref<{endpointType? : string, endpointOptions? : any} & TimelineData>(Service.instances[firstServiceIndex].initialTimelines(0)[0] || {
			title: 'New Timeline',
			serviceIndex: firstServiceIndex,
			endpointIndex: 0,
			container: 'ColumnContainer',
			defaults: {
				rtl: false,
			}
		})

		const baseTitle = timelineData.value.title
		let title = baseTitle
		const titles = timelines.value.map(t => t.title)
		for (let i = 2; titles.includes(title); i++)
			title = `${baseTitle} ${i}`
		timelineData.value.title = title

		const service = computed(() => Service.instances[timelineData.value.serviceIndex])

		//TODO Centralize containers
		const containers = [
			'ColumnContainer',
			'RowContainer',
			'MasonryContainer',
		]

		const validations = computed<{[name:string]:boolean}>(() => ({
			title: !timelines.value.some(t => t.title === timelineData.value.title)
		}))
		const valid = computed(() => Object.values(validations.value).every(isValid => isValid))

		const newEndpoint = ref(false)
		const endpointType = ref('')

		watch(
			newEndpoint,
			(value, oldValue) => {
				//I will regret this, setting endpointIndex to length + typeIndex so it can be created later
				if (value && value != oldValue)
					timelineData.value.endpointType = endpointType.value
			}
		)

		return {timelineData, services: Service.instances, service, containers, validations, valid, newEndpoint, endpointType}
	},
})
</script>

<style scoped lang='sass'>
@use '../../sass/core' as *
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

.timeline .modal-content
	width: 100%
	display: flex
	justify-content: center
	overflow-y: scroll

	& .articleModal
		width: 80%

//TODO Remove this when bulma is updated?
.card-header-icon
	background: 0 0
	border: 0
</style>