<template>
	<div class='modal is-active'>
		<div class='modal-background' @click='$emit($event.target.classList.contains("modal-background") ? "close" : "")'/>
		<div class='modal-content' :style='{width: zoom + "%"}'>
			<div class='articleModal'>
				<component
					:is='service.articleComponent'
					:article='article'
					:on-article-click='() => {}'
					@loading-full-media='$emit("loadingFullMedia", $event)'
					@done-loading='$emit("doneLoading", $event)'
				/>
			</div>
			<div class='modalButtons'>
				<button class='button' @click='zoom = Math.max(zoom - 10, 10)'>
					<span class='icon'>
						<FontAwesomeIcon icon='search-minus'/>
					</span>
				</button>
				<button class='button' @click='zoom += 10'>
					<span class='icon'>
						<FontAwesomeIcon icon='search-plus'/>
					</span>
				</button>
			</div>
		</div>
		<button class='modal-close is-large' aria-label='close' @click='$emit("close")'/>
	</div>
</template>

<script lang='ts'>
import {computed, defineComponent, PropType, ref} from 'vue'
import {Service} from '@/services'
import {library} from '@fortawesome/fontawesome-svg-core'
import {faSearchMinus, faSearchPlus} from '@fortawesome/free-solid-svg-icons'

library.add(faSearchMinus, faSearchPlus)

export default defineComponent({
	props: {
		serviceName: {
			type: String,
			required: true,
		},
		article: Object,
	},
	setup(props) {
		return {
			zoom: ref(90),
			service: computed(() => Service.instances[props.serviceName])
		}
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