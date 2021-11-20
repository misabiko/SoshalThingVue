<template>
	<nav id='sidebar'>
		<div v-if='expanded' class='sidebarMenu'>
			<div v-for='s in services' class='box'>
				{{s.name}}
				<component :is='s.optionComponent'/>
				<SidebarEndpointMenu v-for='e in s.endpoints' :endpoint='e'/>
			</div>
		</div>
		<div id='sidebarButtons'>
			<div>
				<button @click='expanded = !expanded' :title='expanded ? "Collapse sidebar" : "Expand sidebar"'>
					<span class='icon'>
						<FontAwesomeIcon :icon='expanded ? "angle-double-left" : "angle-double-right"' size='2x'/>
					</span>
				</button>
				<button id='addTimelineButton' @click='modal = "AddTimelineModal"' title='Add new timeline'>
					<span class='icon'>
						<FontAwesomeIcon icon='plus' size='2x'/>
					</span>
				</button>
				<button @click='modal = "ArticleListManager"' title='ArticleList Manager?'>
					<span class='icon'>
						<FontAwesomeIcon icon='list' size='2x'/>
					</span>
				</button>
				<button @click='modal = "TimelineManager"' title='Timeline Manager'>
					<span class='icon'>
						<FontAwesomeIcon icon='upload' size='2x'/>
					</span>
				</button>
				<button @click='pauseVideos' title='Pause videos'>
					<span class='icon'>
						<FontAwesomeIcon icon='pause' size='2x'/>
					</span>
				</button>
			</div>
			<div title='Github'>
				<a href='https://github.com/misabiko/SoshalThing'>
					<button>
						<span class='icon'>
							<FontAwesomeIcon :icon='["fab", "github"]' size='2x'/>
						</span>
					</button>
				</a>
			</div>
		</div>
	</nav>
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue'
import {library} from '@fortawesome/fontawesome-svg-core'
import {
	faAngleDoubleLeft,
	faAngleDoubleRight,
	faList,
	faPause,
	faPlus,
	faUpload,
} from '@fortawesome/free-solid-svg-icons'
import {Service} from '@/services'
import {faGithub} from '@fortawesome/free-brands-svg-icons'
import SidebarEndpointMenu from '@/components/SidebarEndpointMenu.vue'
import {modal} from '@/composables/ModalManager'

library.add(faAngleDoubleLeft, faAngleDoubleRight, faPlus, faGithub, faList, faUpload, faPause)

export default defineComponent({
	components: {SidebarEndpointMenu},
	setup() {
		const expanded = ref(false)

		function pauseVideos() {
			for (const video of document.getElementsByTagName('video'))
				video.pause()
		}

		return {expanded, services: Service.instances, modal, pauseVideos}
	}
})
</script>

<style scoped lang="sass">
@use '~@/sass/core' as *

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
