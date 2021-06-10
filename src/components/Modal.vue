<template>
	<div class='modal is-active' @click='$emit($event.target.className.includes("modal") ? "close" : "")'>
		<div class='modal-background'></div>
		<div class='modal-content' :style='{width: zoom + "%"}'>
			<div class='articleModal'>
				<component
					:is='service.articleComponent'
					:service='service'
					:article='article'
					:on-article-click='() => {}'
					@loading-full-media='$emit("loadingFullMedia", $event)'
					@done-loading='$emit("doneLoading", $event)'
				></component>
			</div>
			<div class='modalButtons'>
				<button class='button' @click='zoom = Math.max(zoom - 10, 10)'>
					<span class='icon'>
						<i class='fas fa-search-minus'></i>
					</span>
				</button>
				<button class='button' @click='zoom += 10'>
					<span class='icon'>
						<i class='fas fa-search-plus'></i>
					</span>
				</button>
			</div>
		</div>
		<button class='modal-close is-large' aria-label='close' @click='$emit("close")'></button>
	</div>
</template>

<script lang='ts'>
import {defineComponent, PropType, ref} from 'vue'
import {Service} from '@/services'

export default defineComponent({
	props: {
		service: {
			type: Object as PropType<Service>,
			required: true,
		},
		article: Object,
	},
	setup() {
		return {
			zoom: ref(90)
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