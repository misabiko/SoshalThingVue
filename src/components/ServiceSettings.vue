<template>
	<div class='serviceSettings'>
		{{ name }}
		<div class='level' v-if='!loggedIn'>
			<div class='level-left'></div>
			<div class='level-right'>
				<a
					class='serviceLogin level-item'
					:href='loginHref'
				>Login</a>
			</div>
		</div>
	</div>
</template>

<script lang='ts'>
import Vue from 'vue';

export default Vue.component('ServiceSettings', {
	props: {
		name: {
			type: String,
			required: true,
		},
		loginHref: {
			type: String,
			required: true,
		},
	},
	computed: {
		loggedIn() : boolean {
			return this.$store.state.logins[this.name];
		}
	}
});
</script>

<style scoped lang='sass'>
@use '../variables' as *
@import '~bulma'

.serviceSettings
	@extend .box
	@extend .has-text-white
	background-color: $element-color

.serviceLogin
	@extend .button
</style>