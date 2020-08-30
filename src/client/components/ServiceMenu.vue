<template lang='pug'>
	.sidebarMenu
		ServiceSettings(
			v-for='service in services'
			:key='service.name'
			:service='service'
		)
</template>

<script lang='ts'>
import Vue from 'vue';
import Component from 'vue-class-component';
import {State} from 'vuex-class';
import ServiceSettings from './ServiceSettings';
import {Service} from '../services/service';

@Component({
	components: {ServiceSettings}
})
export default class ServiceMenu extends Vue {
	@State services!: {[name : string] : Service}
}
</script>

<style scoped lang='sass'>
@use '../bulma_overrides' as *

.sidebarMenu
	width: $sidebar-menu-width
	height: 100%
	padding: 1rem
	background-color: $scheme-main-ter
</style>