<template lang='pug'>
	.serviceSettings {{ name }}
		.level(v-if='!loggedIn')
			.level-left
			.level-right
				a.button.level-item(:href='loginHref') Login
</template>

<script lang='ts'>
import Vue from 'vue';
import Component from 'vue-class-component';
import {State} from 'vuex-class';
import {Logins} from '../store';

const ServiceSettingsProps = Vue.extend({
	props: {
		name: {
			type: String,
			required: true,
		},
		loginHref: {
			type: String,
			required: true,
		},
	}
});

@Component
export default class ServiceSettings extends ServiceSettingsProps {
	@State('logins') readonly logins!: Logins;

	get loggedIn() : boolean {
		return this.logins[this.name];
	}
};
</script>

<style scoped lang='sass'>
@use '../variables' as *
@import '~bulma'

.serviceSettings
	@extend .box
	@extend .has-text-white
	background-color: $element-color
</style>