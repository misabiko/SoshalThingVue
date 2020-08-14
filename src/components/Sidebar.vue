<template>
	<nav>
		<ServiceMenu></ServiceMenu>
		<div id='sidebarButtons'>
			<button>
				<span class='icon is-small'>
					<FontAwesomeIcon icon='angle-double-right' fixed-width inverse size='2x'></FontAwesomeIcon>
				</span>
			</button>
			<button>
				<span class='icon is-small'>
					<FontAwesomeIcon icon='plus' fixed-width inverse size='2x'></FontAwesomeIcon>
				</span>
			</button>
		</div>
	</nav>
</template>

<script lang='ts'>
import Vue from 'vue';
import ServiceMenu from './ServiceMenu.vue';
import {library} from '@fortawesome/fontawesome-svg-core';
import {faPlus, faAngleDoubleRight} from '@fortawesome/free-solid-svg-icons';

library.add(faPlus, faAngleDoubleRight);

export default Vue.component('Sidebar', {
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
		padding: 0
		border: none
		background: none
		height: 45px

		span
			vertical-align: middle
</style>