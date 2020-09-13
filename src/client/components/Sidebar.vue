<template lang='pug'>
	nav.sidebar
		b-collapse(:open='expanded' animation='slide-right')
			ServiceMenu(v-if="current = 'ServiceMenu'")
		#sidebarButtons
			button#expandSidebar(@click='expanded = !expanded')
				span: FontAwesomeIcon(
						:icon="expanded ? 'angle-double-left' : 'angle-double-right'"
						fixed-width inverse size='2x')
			button#searchIdSidebar(@click='searchId()')
				span: FontAwesomeIcon(icon='search' fixed-width inverse size='2x')
			button#newTimelineSidebar(@click="$emit('new-timeline')")
				span: FontAwesomeIcon(icon='plus' fixed-width inverse size='2x')
</template>

<script lang='ts'>
import Vue from 'vue';
import Component from 'vue-class-component';
import {Mutation, State} from 'vuex-class';
import ServiceMenu from './ServiceMenu';
import {library} from '@fortawesome/fontawesome-svg-core';
import {faPlus, faAngleDoubleLeft, faAngleDoubleRight, faSearch} from '@fortawesome/free-solid-svg-icons';

library.add(faPlus, faAngleDoubleLeft, faAngleDoubleRight, faSearch);

@Component({components: {ServiceMenu}})
export default class Sidebar extends Vue {
	@State sidebarExpanded!: boolean;
	@Mutation searchId!: () => void;

	current = 'ServiceMenu';

	expand(sidebar : string) {
		this.current = sidebar;
		this.expanded = true;
	}

	get expanded() : boolean {
		return this.sidebarExpanded;
	}

	set expanded(value : boolean) {
		this.$store.commit('setSidebarExpanded', value);
	}
};
</script>

<style scoped lang='sass'>
@use '../bulma_overrides' as *

@include pretty-scrollbar

.sidebar
	background-color: $dark
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
@use '../bulma_overrides' as *

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

<style lang='sass'>
.sidebar .collapse-content
	height: 100%
</style>