<template lang='pug'>
	.postImages
		.mediaHolder(v-for='(source, index) of sources')
			img(
				@load='handleImageLoaded'
				:alt="'img' + index"
				:src='source'
			)
</template>

<script lang='ts'>
import {Vue, Component, Prop} from 'vue-property-decorator';

@Component
export default class PostImages extends Vue {
	@Prop(Array) readonly sources!: string[];

	handleImageLoaded(loadEvent : Event) {
		const img = loadEvent.target as HTMLImageElement;
		if (img.parentElement)
			img.parentElement.classList.add(img.width > img.height ? 'landscape' : 'portrait');
	}
}
</script>

<style scoped lang='sass'>
.mediaHolder
	overflow: hidden
	display: flex
	justify-content: center
	max-height: 50vh
	border-radius: 8px

	&:not(:last-child)
		margin-bottom: 2px

	img
		align-self: center
		width: 100%
</style>