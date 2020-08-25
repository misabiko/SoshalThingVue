<template lang='pug'>
	.postImages(:class='{postImagesCompact: compact}')
		.mediaHolder(
			v-for='(imageData, index) of images'
			:class="[compact ? 'mediaHolderCompact' : '', imageFormatClass(index), images.length === 3 && index === 2 ? 'thirdImage' : '']"
		)
			img(
				:src='imageData.url'
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
	@Prop({type: Boolean})
	readonly compact!: boolean;

	imageFormatClass(index : number) : string {
		const sizeIndex = Object.keys(this.images[index].sizes).find(sizeName => sizeName !== 'thumb');
		if (!sizeIndex)
			return 'portrait';

		const size : {w : number; h : number; resize : string;} = this.images[index].sizes[sizeIndex];

		return size.w > size.h ? 'landscape' : 'portrait';
	}
}
</script>

<style scoped lang='sass'>
.postImagesCompact
	display: flex
	flex-wrap: wrap

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

	&.mediaHolderCompact
		max-height: 16vh
		width: 100%

		&:not(:only-child)
			margin: 2px
			max-width: 49%

			&.landscape img
				width: unset
				height: 110%

			&.portrait img
				width: 110%
				height: unset

		img
			object-fit: cover

		&.thirdImage
			max-width: unset

			&.landscape img
				width: unset
				height: 175%

			&.portrait img
				width: 175%
				height: unset
</style>