<template lang='pug'>
	nav.level.is-mobile
		.level-left
			template(v-if='!hidden')
				//a.level-item.commentButton
					span.icon.is-small: FontAwesomeIcon(icon='reply')

				a.level-item.postButton.repostButton(
					:class='{repostedPostButton: postData.reposted}'
					@click='service.repost(postData.id)'
				)
					span.icon: FontAwesomeIcon(icon='retweet' fixed-width)
					span {{ postData.repostCount }}

				a.level-item.postButton.likeButton(
					:class='{likedPostButton: postData.liked}'
					@click='service.toggleLike(postData.id)'
				)
					span.icon: FontAwesomeIcon(:icon="[postData.liked ? 'fas' : 'far', 'heart']" fixed-width)
					span {{ postData.likeCount }}

				a.level-item.postButton.compactOverrideButton(
					v-if='postData.images'
					@click="toggleExpandOverride"
				)
					span.icon: FontAwesomeIcon(:icon='compactOverrideIcon' fixed-width)

				b-dropdown.postMenu
					a.level-item.postButton.postMenuButton(slot='trigger')
						span.icon: FontAwesomeIcon(icon='ellipsis-h' fixed-width)

					b-dropdown-item(
						:focusable='false'
						v-clipboard:copy='postURL'
						v-clipboard:success='onCopySuccess'
						v-clipboard:error='onCopyError'
					) Copy link to this post
					b-dropdown-item(
						:focusable='false'
						@click="$emit('update:hidden', true)"
					) Hide this post
					b-dropdown-item(:focusable='false') Remove this post

		.level-right
			a.level-item.postButton.showButton(v-if='hidden' @click="$emit('update:hidden', false)")
				span.icon: FontAwesomeIcon(icon='eye' fixed-width)
</template>

<script lang='ts'>
import {Component, Prop, Vue} from 'vue-property-decorator';
import {PostData} from '../../core/PostData';
import {CompactOverride} from './ArticleSkeleton.vue';
import {library} from '@fortawesome/fontawesome-svg-core';
import {
	faCompress,
	faExpand,
	faHeart as fasHeart,
	faReply,
	faRetweet,
	faEllipsisH,
	faEye,
} from '@fortawesome/free-solid-svg-icons';
import {faHeart as farHeart} from '@fortawesome/free-regular-svg-icons';
import {Service} from '../services/service';

library.add(fasHeart, farHeart, faRetweet, faReply, faExpand, faCompress, faEllipsisH, faEye);

@Component
export default class ArticleButtons extends Vue {
	@Prop({type: Object, required: true})
	readonly service! : Service;
	@Prop({type: Object, required: true})
	readonly postData! : PostData;
	@Prop({type: Boolean, required: true})
	readonly compactMedia! : boolean;
	@Prop({type: Number, required: true})
	readonly compactOverride! : CompactOverride;
	@Prop({type: Boolean, required: true})
	readonly hidden! : boolean;

	toggleExpandOverride() {
		if (this.compactOverride === CompactOverride.Inherit)
			this.$emit('update:compact-override', this.compactMedia ? CompactOverride.Expand : CompactOverride.Compact);
		else
			this.$emit('update:compact-override', this.compactOverride === CompactOverride.Compact ? CompactOverride.Expand : CompactOverride.Compact);
	}

	onCopySuccess() {
		this.$buefy.toast.open('Link copied to clipboard!');
	}

	onCopyError() {
		this.$buefy.toast.open({type: 'is-danger', message: 'Failed to copy to clipboard'});
	}

	get compactOverrideIcon() : string | undefined {
		if (!this.postData.images)
			return;

		if (this.compactOverride === CompactOverride.Inherit)
			return this.compactMedia ? 'expand' : 'compress';
		else
			return this.compactOverride === CompactOverride.Compact ? 'expand' : 'compress';
	}

	get postURL() {
		return `https://twitter.com/${this.postData.authorHandle}/status/${this.postData.id}`;
	}
}
</script>

<style scoped lang='sass'>
@use '../bulma_overrides' as *

.postButton
	color: $light

	&:hover span
		color: $primary

	&:hover.likeButton, &.likedPostButton
		span
			color: $like-color

	&:hover.repostButton, &.repostedPostButton
		span
			color: $repost-color

	&:hover.commentButton span
		color: $comment-color

.postMenu .dropdown-item:hover
	color: $white
	background-color: $primary

//TODO width: getFaW(.fa-w-14) * 0.0625em
.svg-inline--fa.fa-w-14
	width: 0.875em

.svg-inline--fa.fa-w-16
	width: 1em

.svg-inline--fa.fa-w-18
	width: 1.125em

.svg-inline--fa.fa-w-20
	width: 1.25em
</style>