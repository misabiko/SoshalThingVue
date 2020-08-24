<template lang='pug'>
	article.article.repost(:article-id='repostData.id' @mouseover='hovered = true' @mouseleave='hovered = false')
		.repostLabel(v-if='repostData.reposterName')
			p {{ repostData.reposterName + ' retweeted' }}

		.media
			figure.media-left
				p.image.is-64x64: img(
					:alt=`postData.authorHandle + "'s avatar"`
					:src='postData.authorAvatar'
				)

			.media-content
				.content
					span.names
						strong {{ postData.authorName }}
						small {{'@' + postData.authorHandle}}
					span.timestamp: small(:title='creationTimeLong') {{ creationTimeShort }}
					p {{ postData.text }}

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
			//-.media-right
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
</template>

<script lang='ts'>
import Vue from 'vue';
import Component from 'vue-class-component';
import {PostData, RepostData} from '../../core/PostData';
import {Prop} from 'vue-property-decorator';
import {Action, Getter, Mutation} from 'vuex-class';
import moment from 'moment';
import {ExpandedPost} from '../store';
import PostVideo from './PostVideo.vue';
import PostImages from './PostImages.vue';

@Component({components: {PostImages, PostVideo}})
export default class Repost extends Vue {
	@Prop({type: String, required: true})
	readonly repostId!: string;
	@Prop({type: Boolean, default: true})
	readonly showMedia!: boolean;

	@Getter readonly getRepost!: (id: string) => RepostData;
	@Getter readonly getPost!: (id: string) => PostData;
	@Action('toggleLike') actionToggleLike!: (id : string) => void;
	@Action('repost') actionRepost!: (id : string) => void;

	@Mutation('expandPost') storeExpandPost!: (post : ExpandedPost) => void;

	get repostData() : RepostData {
		return this.getRepost(this.repostId);
	}

	get postId() : string {
		return this.repostData.repostedId;
	}

	get postData() : PostData {
		return this.getPost(this.postId);
	}

	get creationTimeShort() : string {
		const t = moment(this.repostData.creationTime).locale('twitter').fromNow(true);
		moment().locale('en');
		return  t;
	}

	get creationTimeLong() : string {
		return moment(this.repostData.creationTime).fromNow();
	}

	toggleLike() {
		this.actionToggleLike(this.postId);
	}

	repost() {
		this.actionRepost(this.postId);
	}

	expandPost(selectedMedia: number) {
		this.storeExpandPost({id: this.postId, selectedMedia});
	}
}
</script>

<style scoped lang='sass'>
@use '../bulma_overrides' as *

article.article
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