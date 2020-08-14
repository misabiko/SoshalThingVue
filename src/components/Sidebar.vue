<template>
	<nav>
		<ServiceMenu v-if='expanded'></ServiceMenu>
		<div id='sidebarButtons'>
			<button @click='expanded = !expanded'>
				<span>
					<FontAwesomeIcon
						:icon="expanded ? 'angle-double-left' : 'angle-double-right'"
						fixed-width
						inverse
						size='2x'
					/>
				</span>
			</button>
			<button @click="$emit('new-timeline')">
				<span>
					<FontAwesomeIcon
						icon='plus'
						fixed-width
						inverse
						size='2x'
					/>
				</span>
			</button>
		</div>
	</nav>
</template>

<script lang='ts'>
import Vue from 'vue';
import ServiceMenu from './ServiceMenu.vue';
import {library} from '@fortawesome/fontawesome-svg-core';
import {faPlus, faAngleDoubleLeft, faAngleDoubleRight} from '@fortawesome/free-solid-svg-icons';

library.add(faPlus, faAngleDoubleLeft, faAngleDoubleRight);

export default Vue.component('Sidebar', {
	data: function() {
		return {
			expanded: false,
		};
	},
	components: {
		ServiceMenu,
	}
});
</script>

<style lang='sass'>
@use '../variables' as *

nav
	background-color: $element-color
	z-index: 1
	display: flex

#sidebarButtons
	width: 2.6vw
	padding: 1rem 0
	text-align: center
	display: flex
	flex-direction: column

	button
		@include borderless-button
		height: 45px

		span
			vertical-align: middle
</style>