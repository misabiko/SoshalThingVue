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
	max-height: 50vh
	overflow: hidden //TODO remove once layout is settled
	margin-top: 1rem
	text-align: center

.mediaHolder
	overflow: hidden
	display: inline-flex
	width: 100%
	max-width: unset
	justify-content: center

	img
		align-self: center

//.postMedia1 .mediaHolder
	width: 100%

//.postMedia3 .mediaHolder,
//.postMedia4 .mediaHolder
	height: 50%

//.portrait img
	width: 100%
//.landscape img
	height: 100%
</style>