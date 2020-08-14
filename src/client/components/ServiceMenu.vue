<template lang='pug'>
	.sidebarMenu
		ServiceSettings(
			v-for='service of services'
			:key='service.name'
			:name='service.name'
			:loginHref='service.loginHref'
		)
</template>

<script lang='ts'>
import Vue from 'vue';
import ServiceSettings from './ServiceSettings';

export default Vue.component('ServiceMenu', {
	data: function() {
		return {
			services: [
				{name: 'Twitter', loginHref: '/twitter/login'},
				{name: 'Mastodon', loginHref: ''},
				{name: 'Pixiv', loginHref: ''},
			]
		};
	},
	components: {
		ServiceSettings,
	}
});
</script>

<style scoped lang='sass'>
@use '../variables' as *

.sidebarMenu
	width: $sidebar-menu-width
	height: 100%
	padding: 1rem
	background-color: $container-color
</style>