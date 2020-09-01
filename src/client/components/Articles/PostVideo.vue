<template lang='pug'>
	video(
		controls
		:autoplay='video.autoplay'
		:loop='video.autoplay'
	)
		source(
			:src='firstVariant.url'
			:type='firstVariant.contentType'
		)
</template>

<script lang='ts'>
import {Vue, Component, Prop} from 'vue-property-decorator';
import {PostVideoData, PostVideoVariant} from '../../../core/PostData';

@Component
export default class PostVideo extends Vue {
	@Prop({type: Object, required: true})
	readonly video!: PostVideoData;

	get firstVariant() : PostVideoVariant | undefined {
		return this.video.variants.find(variant => variant.contentType === 'video/mp4');
	}
}
</script>

<style scoped lang='sass'>
video
	outline: none
	border-radius: 8px
	width: 100%
</style>