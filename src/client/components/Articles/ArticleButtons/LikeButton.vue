<template lang='pug'>
	a.postButton.likeButton(
		:class='{likedPostButton: liked}'
		@click="$emit('like')"
	)
		span.icon
			transition(:name="liked ? 'heart' : ''" mode='out-in')
				FontAwesomeIcon(key=1 v-if='liked' :icon="['fas', 'heart']" fixed-width)
				FontAwesomeIcon(key=2 v-else :icon="['far', 'heart']" fixed-width)
		span {{ count }}
</template>

<script lang='ts'>
import {Vue, Component, Prop} from 'vue-property-decorator';
import {library} from '@fortawesome/fontawesome-svg-core';
import {faHeart as fasHeart} from '@fortawesome/free-solid-svg-icons';
import {faHeart as farHeart} from '@fortawesome/free-regular-svg-icons';

library.add(fasHeart, farHeart);

@Component
export default class LikeButton extends Vue {
	@Prop({type: Boolean, required: true})
	readonly liked!: number;
	@Prop({type: Number, required: true})
	readonly count!: number;
}
</script>

<style scoped lang='sass'>
@use '../../../bulma_overrides' as *

.svg-inline--fa.fa-w-16
	width: 1em

.likeButton
	color: $light

	&:hover, &.likedPostButton
		span
			color: $like-color

@keyframes heart
	0%, 17.5%
		width: 0

.heart-enter-active
	will-change: width
	animation: heart .5s cubic-bezier(.17, .89, .32, 1.49)

.heart-enter
	width: 0

$bubble-d: 2em
$bubble-r: .5 * $bubble-d

.icon > svg
	position: relative

	&:before, &:after
		position: absolute
		z-index: -1
		top: 50%
		left: 50%
		border-radius: 50%
		content: ''

	&::before
		margin: -$bubble-r
		width: $bubble-d
		height: $bubble-d
		background: gold
</style>