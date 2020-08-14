<template lang='pug'>
	nav
		b-collapse(:open='expanded' animation='slide-right')
			ServiceMenu
		#sidebarButtons
			button(@click='expanded = !expanded')
				span: FontAwesomeIcon(
						:icon="expanded ? 'angle-double-left' : 'angle-double-right'"
						fixed-width
						inverse
						size='2x'
				)
			button(@click="$emit('new-timeline')")
				span: FontAwesomeIcon(
						icon='plus'
						fixed-width
						inverse
						size='2x'
				)
</template>

<script lang='ts'>
import Vue from 'vue';
import ServiceMenu from './ServiceMenu';
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

<style scoped lang='sass'>
@use '../variables' as *

@include pretty-scrollbar

nav
	background-color: $element-color
	z-index: 1
	display: flex

#sidebarButtons
	width: 60px
	padding: 1rem 0
	text-align: center
	display: flex
	flex-direction: column

	button
		@include borderless-button
		height: 45px

		&:not(:last-child)
			margin-bottom: 1rem

		span
			vertical-align: middle
</style>

<style lang='sass'>
@use '../variables' as *

.slide-right-enter-active
	transition: 150ms ease-out

.slide-right-leave-active
	transition: 150ms ease-out
	transition-timing-function: cubic-bezier(0, 1, 0.5, 1)

.slide-right-enter-to, .slide-right-leave
	max-width: $sidebar-menu-width
	overflow: hidden

.slide-right-enter, .slide-right-leave-to
	max-width: 0
	overflow: hidden
</style>