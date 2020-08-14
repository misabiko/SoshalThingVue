<template>
	<div :class="['postMedia', 'postMedia' + sources.length]">
		<div v-for='(source, index) of sources' class='mediaHolder'>
			<img
				@load='handleImageLoaded'
				:alt="'img' + index"
				:src='source'
			>
		</div>
	</div>
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
	height: 300px
	overflow: hidden //TODO remove once layout is settled

.mediaHolder
	overflow: hidden
	display: inline-flex
	height: 100%
	width: 50%
	justify-content: center

.postMedia1 .mediaHolder
	width: 100%

.postMedia3 .mediaHolder,
.postMedia4 .mediaHolder
	height: 50%

.mediaHolder img
	align-self: center

.portrait img
	width: 100%
.landscape img
	height: 100%
</style>