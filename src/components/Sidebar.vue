<template>
	<nav>
		<ServiceMenu></ServiceMenu>
		<div id='sidebarButtons'>
			<button
				class='button'
			>
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
	top: 0
	bottom: 0
	background-color: $element-color
	position: fixed

#sidebarButtons
	width: 2.6vw
	height: 100%
	display: inline-block
</style>