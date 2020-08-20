<template lang='pug'>
	article.post(:article-id='quoteData.id' @mouseover='hovered = true' @mouseleave='hovered = false')
		.media
			figure.media-left
				p.image.is-64x64: img(
					:alt=`quoteData.reposterHandle + "'s avatar"`
					:src='quoteData.reposterAvatar'
				)

			.media-content
				.content
					span.names
						strong {{ quoteData.reposterName }}
						small {{'@' + quoteData.reposterHandle}}
					span.timestamp: small(:title='creationTimeLong') {{ creationTimeShort }}
					p {{ quoteData.text }}

				.quotedPost
					span.names
						strong {{ postData.authorName }}
						small {{'@' + postData.authorHandle}}
					p {{ postData.text }}

					PostImages.postMedia(
						v-if='showMedia && postData.images'
						:images='postData.images'
						@expanded='expandPost($event)'
					)
					PostVideo.postMedia(
						v-if='showMedia && postData.video'
						:video='postData.video'
						@expanded='expandPost(0)'
					)

				nav.level.is-mobile
					.level-left
						//a.level-item.commentButton
							span.icon.is-small: FontAwesomeIcon(icon='reply')

						a.level-item.repostButton(
							:class='{repostedPostButton: quoteData.reposted}'
							@click='repost'
						)
							span.icon: FontAwesomeIcon(icon='retweet' fixed-width)
							span {{ quoteData.repostCount }}

						a.level-item.likeButton(
							:class='{likedPostButton: quoteData.liked}'
							@click='toggleLike'
						)
							span.icon: FontAwesomeIcon(:icon="[quoteData.liked ? 'fas' : 'far', 'heart']" fixed-width)
							span {{ quoteData.likeCount }}
			//-.media-right
</template>

<script lang='ts'>
import Vue from 'vue';
import Component from 'vue-class-component';
import {PostData, QuoteData} from '../../core/PostData';
import {Prop} from 'vue-property-decorator';
import {Action, Getter, Mutation} from 'vuex-class';
import moment from 'moment';
import {ExpandedPost} from '../store';

@Component
export default class Quote extends Vue {
	@Prop({type: String, required: true})
	readonly quoteId!: string;
	@Prop({type: Boolean, default: true})
	readonly showMedia!: boolean;

	@Getter readonly getQuote!: (id: string) => QuoteData;
	@Getter readonly getPost!: (id: string) => PostData;
	@Action('toggleLike') actionToggleLike!: (id : string) => void;
	@Action('repost') actionRepost!: (id : string) => void;

	@Mutation('expandPost') storeExpandPost!: (post : ExpandedPost) => void;

	get quoteData() : QuoteData {
		return this.getQuote(this.quoteId);
	}

	get postId() : string {
		return this.quoteData.repostedId;
	}

	get postData() : PostData {
		return this.getPost(this.postId);
	}

	get creationTimeShort() : string {
		const t = moment(this.quoteData.creationTime).locale('twitter').fromNow(true);
		moment().locale('en');
		return  t;
	}

	get creationTimeLong() : string {
		return moment(this.quoteData.creationTime).fromNow();
	}

	toggleLike() {
		this.actionToggleLike(this.quoteId);
	}

	repost() {
		this.actionRepost(this.quoteId);
	}

	expandPost(selectedMedia: number) {
		this.storeExpandPost({id: this.quoteId, selectedMedia});
	}
}
</script>

<style scoped lang='sass'>
@use '../bulma_overrides' as *

article.post
	padding: 1rem
	background-color: $scheme-main-bis
	margin-bottom: 2px

	figure img
		border-radius: 4px

	.content
		.names
			text-overflow: ellipsis
			white-space: nowrap
			overflow: hidden
			display: inline-block
			max-width: 300px

		span
			*
				vertical-align: middle

			strong
				margin-right: 0.5rem

		p
			white-space: pre-line

	small
		color: $light

	a
		color: $light

		&:hover.likeButton, &.likedPostButton
			span
				color: $like-color

		&:hover.repostButton, &.repostedPostButton
			span
				color: $repost-color

		&:hover.commentButton span
			color: $comment-color

.timestamp
	float: right

.repostLabel
	margin-left: 64px
	color: $light
	font-size: smaller

	p
		margin-left: 1rem

.postMedia
	margin-top: 1rem

.svg-inline--fa.fa-w-16
	width: 1em

.svg-inline--fa.fa-w-20
	width: 1.25em
</style>