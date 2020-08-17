<template lang='pug'>
	video(controls)
		source(
			:src='source'
			type='video/mp4'
		)
</template>

<script lang='ts'>
import {Vue, Component, Prop} from 'vue-property-decorator';

@Component
export default class PostVideo extends Vue {
	@Prop({type: String, required: true})
	readonly source!: string;
}
</script>

<style scoped lang='sass'>
video
	outline: none
	border-radius: 8px
</style>