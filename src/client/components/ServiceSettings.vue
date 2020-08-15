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
	get loggedIn() : boolean {
		//TODO resolve state in computed
		return (this.$store.state as any).logins[this.name];
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