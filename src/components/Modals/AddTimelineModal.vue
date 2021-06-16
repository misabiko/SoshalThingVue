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
					<div class='content'>
						<div class='field'>
							<label class='label'>Title</label>
							<div class='control'>
								<input class='input' type='text' v-model='timelineData.title'>
							</div>
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
						<div class='field'>
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
				</div>
				<footer class='card-footer'>
					<button class='button card-footer-item' @click='$emit("add", timelineData), $emit("close")'>Add</button>
					<button class='button card-footer-item' @click='$emit("close")'>Cancel</button>
				</footer>
			</div>
		</div>
	</div>
</template>

<script lang='ts'>
import {computed, defineComponent, ref} from 'vue'
import {Service} from '@/services'
import {library} from '@fortawesome/fontawesome-svg-core'
import {faTimes} from '@fortawesome/free-solid-svg-icons'
import {TimelineData} from '@/data/timelines'

library.add(faTimes)

export default defineComponent({
	setup() {
		const firstService = Service.instances[0]
		const timelineData = ref<TimelineData>(firstService.initialTimelines(0)[0])
		const service = computed(() => Service.instances[timelineData.value.serviceIndex])

		//TODO Centralize this
		const containers = [
			'ColumnContainer',
			'RowContainer',
			'MasonryContainer',
		]

		return {timelineData, services: Service.instances, service, containers}
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