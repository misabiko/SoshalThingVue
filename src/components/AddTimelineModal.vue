<template>
	<div class='modal is-active' @click='$emit($event.target.className.includes("modal") ? "close" : "")'>
		<div class='modal-background'></div>
		<div class='modal-content' :style='{width: zoom + "%"}'>
			<div class='card'>
				<header class='card-header'>
					<p class='card-header-title'>
						Add Timeline
					</p>
					<button class='card-header-icon' aria-label='more options'>
						<span class='icon'>
							<FontAwesomeIcon icon='times' aria-hidden='true'/>
						</span>
					</button>
				</header>
				<div class='card-content'>
					<div class='content'>
						<select :value='timelineData.serviceIndex' v-model='timelineData.serviceIndex'>
							<option v-for='(s, i) in services' :value='i'>
								{{ s.name }}
							</option>
						</select>
					</div>
				</div>
				<footer class='card-footer'>
					<button class='button card-footer-item' @click='$emit("addTimeline", timelineData), $emit("close")'>Add</button>
					<button class='button card-footer-item' @click='$emit("close")'>Cancel</button>
				</footer>
			</div>
		</div>
	</div>
</template>

<script lang='ts'>
import {defineComponent, ref} from 'vue'
import {Service} from '@/services'
import {library} from '@fortawesome/fontawesome-svg-core'
import {faTimes} from '@fortawesome/free-solid-svg-icons'
import {TimelineData} from '@/data/timelines'

library.add(faTimes)

export default defineComponent({
	setup() {
		const firstService = Service.instances[0]
		const timelineData = ref<TimelineData>(firstService.initialTimelines(0)[0])

		return {timelineData, services: Service.instances}
	},
})
</script>

<style scoped lang='sass'>
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
</style>