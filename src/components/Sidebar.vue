<template>
	<nav id='sidebar'>
		<div v-if='expanded' class='sidebarMenu'>
			<div class='box'>
				Twitter
			</div>
		</div>
		<div v-else id='sidebarButtons'>
			<button class='refreshTimeline'>
				<span class='icon'>
					<i
						class='fas fa-2x'
						:class='expanded ? "fa-angle-double-left" : "fa-angle-double-right"'
						@click='expanded = !expanded'
					></i>
				</span>
			</button>
		</div>
	</nav>
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue'

export default defineComponent({
	setup() {
		const expanded = ref(false)

		return {expanded}
	}
})
</script>

<style scoped lang="sass">
@use '../sass/core' as *

@include pretty-scrollbar

#sidebar
	background-color: $dark
	z-index: 1
	display: flex

	.collapse-content
		height: 100%

#sidebarButtons
	width: 60px
	padding: 1rem 0
	text-align: center
	display: flex
	flex-direction: column
	justify-content: space-between

	button
		@include borderless-button
		height: 45px

		&:not(:last-child)
			margin-bottom: 1rem

		span
			vertical-align: middle

.sidebarMenu
	width: $sidebar-menu-width
	height: 100%
	padding: 1rem
	background-color: $scheme-main-ter
</style>
