<template lang='pug'>
	nav.level.is-mobile
		.level-left
			template(v-if='!hidden')
				//a.level-item.commentButton
					span.icon.is-small: FontAwesomeIcon(icon='reply')
				RepostButton.level-item(
					:reposted='postData.reposted'
					:count='animatedRepostCount'
					@repost='service.repost(postData.id)'
				)

				LikeButton.level-item(
					:liked='postData.liked'
					:count='animatedLikeCount'
					@like='service.toggleLike(postData.id)'
				)

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
import {Vue, Component, Prop, Watch} from 'vue-property-decorator';
import LikeButton from './LikeButton.vue';
import RepostButton from './RepostButton.vue';
import {PostData} from '../../../../core/PostData';
import {CompactOverride} from '../ArticleSkeleton.vue';
import {library} from '@fortawesome/fontawesome-svg-core';
import {
	faCompress,
	faExpand,
	faReply,
	faEllipsisH,
	faEye,
} from '@fortawesome/free-solid-svg-icons';
import {Service} from '../../../services/service';
import gsap from 'gsap';

library.add(faReply, faExpand, faCompress, faEllipsisH, faEye);

@Component({components:{RepostButton, LikeButton}})
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

	tweenedLikeCount = this.likeCount;
	tweenedRepostCount = this.repostCount;

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
		//TODO Move to TwitterService
	}

	get likeCount() {
		return this.postData.likeCount;
	}

	get repostCount() {
		return this.postData.repostCount;
	}

	get animatedLikeCount() : number {
		return Math.round(this.tweenedLikeCount);
	}

	get animatedRepostCount() : number {
		return Math.round(this.tweenedRepostCount);
	}

	@Watch('likeCount')
	onLikeCountChange(newLikeCount : number) {
		gsap.to(this.$data, {duration: 0.5, ease:'power2.out', tweenedLikeCount: newLikeCount});
	}

	@Watch('repostCount')
	onRepostCountChange(newRepostCount : number) {
		gsap.to(this.$data, {duration: 0.5, ease:'power2.out', tweenedRepostCount: newRepostCount});
	}
}
</script>

<style scoped lang='sass'>
@use '../../../bulma_overrides' as *

.postButton
	color: $light

	&:hover span
		color: $primary

	&:hover.commentButton span
		color: $comment-color

.postMenu .dropdown-item:hover
	color: $white
	background-color: $primary

.svg-inline--fa.fa-w-14
	width: 0.875em

.svg-inline--fa.fa-w-18
	width: 1.125em
</style>