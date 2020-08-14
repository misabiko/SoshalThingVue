<template>
	<nav>
		<ServiceMenu></ServiceMenu>
		<div id='sidebarButtons'>
			<button	class='button'>
				<span class='icon is-small'>
					<FontAwesomeIcon icon='plus'></FontAwesomeIcon>
				</span>
			</button>
		</div>
	</nav>
</template>

<script lang='ts'>
import Vue from 'vue';
import ServiceMenu from './ServiceMenu.vue';

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
	height: 100%
	z-index: 1
	display: flex

#sidebarButtons
	width: 2.6vw
	height: 100%
</style>