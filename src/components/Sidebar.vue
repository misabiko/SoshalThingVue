<template>
	<nav id='sidebar'>
		<div v-if='expanded' class='sidebarMenu'>
			<div class='box'>
				Twitter
			</div>
		</div>
		<div id='sidebarButtons'>
			<div>
				<button @click='expanded = !expanded'>
					<span class='icon'>
						<FontAwesomeIcon :icon='expanded ? "angle-double-left" : "angle-double-right"' size='2x'/>
					</span>
				</button>
				<button @click='$emit("addTimeline")'>
					<span class='icon'>
						<FontAwesomeIcon icon='plus' size='2x'/>
					</span>
				</button>
			</div>
			<div/>
		</div>
	</nav>
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue'
import {library} from '@fortawesome/fontawesome-svg-core'
import {faAngleDoubleLeft, faAngleDoubleRight, faPlus} from '@fortawesome/free-solid-svg-icons'

library.add(faAngleDoubleLeft, faAngleDoubleRight, faPlus)

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

	& > div
		display: flex
		flex-direction: column

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
