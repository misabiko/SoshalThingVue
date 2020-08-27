<template lang='pug'>
	nav.level.is-mobile
		.level-left
			//a.level-item.commentButton
				span.icon.is-small: FontAwesomeIcon(icon='reply')

			a.level-item.repostButton(
				:class='{repostedPostButton: postData.reposted}'
				@click='repost'
			)
				span.icon: FontAwesomeIcon(icon='retweet' fixed-width)
				span {{ postData.repostCount }}

			a.level-item.likeButton(
				:class='{likedPostButton: postData.liked}'
				@click='toggleLike'
			)
				span.icon: FontAwesomeIcon(:icon="[postData.liked ? 'fas' : 'far', 'heart']" fixed-width)
				span {{ postData.likeCount }}

			a.level-item.compactOverrideButton(
				v-if='postData.images'
				@click="toggleExpandOverride"
			)
				span.icon: FontAwesomeIcon(:icon='compactOverrideIcon' fixed-width)
</template>

<script lang='ts'>
import {Component, Prop, Vue} from 'vue-property-decorator';
import {Action} from 'vuex-class';
import {PostData} from '../../core/PostData';
import {CompactOverride} from './ArticleSkeleton.vue';

@Component
export default class ArticleButtons extends Vue {
	@Prop({type: Object, required: true})
	readonly postData!: PostData;
	@Prop({type: Boolean, required: true})
	readonly compactMedia!: boolean;
	@Prop({type: Number, required: true})
	readonly compactOverride!: CompactOverride;

	@Action('repost') actionRepost!: (id : string) => void;
	@Action('toggleLike') actionToggleLike!: (id : string) => void;

	repost() {
		this.actionRepost(this.postData.id);
	}

	toggleLike() {
		this.actionToggleLike(this.postData.id);
	}

	toggleExpandOverride() {
		if (this.compactOverride === CompactOverride.Inherit)
			this.$emit('update:compact-override', this.compactMedia ? CompactOverride.Expand : CompactOverride.Compact);
		else
			this.$emit('update:compact-override', this.compactOverride === CompactOverride.Compact ? CompactOverride.Expand : CompactOverride.Compact);
	}

	get compactOverrideIcon() : string | undefined {
		if (!this.postData.images)
			return;

		if (this.compactOverride === CompactOverride.Inherit)
			return this.compactMedia ? 'expand' : 'compress';
		else
			return this.compactOverride === CompactOverride.Compact ? 'expand' : 'compress';
	}
}
</script>

<style scoped lang='sass'>
@use '../bulma_overrides' as *

a
	color: $light

	&:hover span
		color: $link

	&:hover.likeButton, &.likedPostButton
		span
			color: $like-color

	&:hover.repostButton, &.repostedPostButton
		span
			color: $repost-color

	&:hover.commentButton span
		color: $comment-color

//TODO width: getFaW(.fa-w-14) * 0.0625em
.svg-inline--fa.fa-w-14
	width: 0.875em

.svg-inline--fa.fa-w-16
	width: 1em

.svg-inline--fa.fa-w-20
	width: 1.25em
</style>