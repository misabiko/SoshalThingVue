<template>
	<div class='serviceSettings'>
		{{ name }}
		<div class='level'>
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
		name: String,
		loginHref: String,
	}
});
</script>

<style scoped lang='sass'>
@use '../variables' as *
@import '../../node_modules/bulma/bulma.sass'

.serviceSettings
	@extend .box
	@extend .has-text-white
	background-color: $element-color

.serviceLogin
	@extend .button
</style>