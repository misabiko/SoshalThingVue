<template lang='pug'>
	.postMedia
		.mediaHolder(v-for='(source, index) of sources')
			img(
				@load='handleImageLoaded'
				:alt="'img' + index"
				:src='source'
			)
</template>

<script lang='ts'>
import Vue from 'vue';

export default Vue.component('PostMedia', {
	props: {
		sources: Array
	},
	methods: {
		handleImageLoaded(loadEvent : Event) {
			const img = loadEvent.target as HTMLImageElement;
			if (img.parentElement)
				img.parentElement.classList.add(img.width > img.height ? 'landscape' : 'portrait');
		}
	}
});
</script>

<style scoped lang='sass'>
.postMedia
	margin-top: 1rem
	text-align: center

.mediaHolder
	overflow: hidden
	display: inline-flex
	width: 100%
	max-width: unset
	justify-content: center
	max-height: 50vh

	img
		align-self: center
		border-radius: 8px
</style>