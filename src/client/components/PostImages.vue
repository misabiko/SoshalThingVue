<template lang='pug'>
	.postImages
		.mediaHolder(v-for='(imageData, index) of images')
			img(
				:src='imageData.url'
				@load='handleImageLoaded'
				@click="$emit('expanded', index)"
			)
</template>

<script lang='ts'>
import {Vue, Component, Prop} from 'vue-property-decorator';
import {PostImageData} from '../../core/PostData';

@Component
export default class PostImages extends Vue {
	@Prop({type: Array, required: true})
	readonly images!: PostImageData[];

	handleImageLoaded(loadEvent : Event) {
		//TODO Redo with PostImageData
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