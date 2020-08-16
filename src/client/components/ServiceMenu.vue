<template lang='pug'>
	.sidebarMenu
		ServiceSettings(
			v-for='service of services'
			:key='service.name'
			:service='service'
		)
</template>

<script lang='ts'>
import Vue from 'vue';
import Component from 'vue-class-component';
import ServiceSettings from './ServiceSettings';

@Component({
	components: {ServiceSettings}
})
export default class ServiceMenu extends Vue {
	services = [
		{name: 'Twitter', loginHref: '/twitter/login', endpoints: ['home_timeline', 'search']},
		{name: 'Mastodon', loginHref: '' , endpoints: []},
		{name: 'Pixiv', loginHref: '' , endpoints: []},
	];
};
</script>

<style scoped lang='sass'>
@use '../variables' as *

.sidebarMenu
	width: $sidebar-menu-width
	height: 100%
	padding: 1rem
	background-color: $container-color
</style>