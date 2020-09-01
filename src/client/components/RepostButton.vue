<template lang='pug'>
	a.postButton.repostButton(
		:class='{repostedPostButton: reposted}'
		@click="$emit('repost')"
	)
		span.icon: FontAwesomeIcon(icon='retweet' fixed-width)
		span {{ count }}
</template>

<script lang='ts'>
import {Vue, Component, Prop} from 'vue-property-decorator';
import {library} from '@fortawesome/fontawesome-svg-core';
import {faRetweet} from '@fortawesome/free-solid-svg-icons';

library.add(faRetweet);

@Component
export default class RepostButton extends Vue {
	@Prop({type: Boolean, required: true})
	readonly reposted!: number;
	@Prop({type: Number, required: true})
	readonly count!: number;
}
</script>

<style scoped lang='sass'>
@use '../bulma_overrides' as *

.svg-inline--fa.fa-w-20
	width: 1.25em

.repostButton
	color: $light

	&:hover, &.repostedPostButton
		span
			color: $repost-color

.icon > svg
	will-change: transform, color
	transition: all .5s ease-in-out

.repostedPostButton .icon > svg
	transform: rotate(360deg)
</style>