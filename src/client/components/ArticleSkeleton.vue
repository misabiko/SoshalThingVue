<template lang='pug'>
	article.article(:article-id='articleId' @mouseover='hovered = true' @mouseleave='hovered = false')
		slot(name='header')

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
					ArticleParagraph(
						:article-id='articleId'
						:text='postData.text'
						:user-mentions='postData.userMentions'
						:hashtags='postData.hashtags'
						:external-links='postData.externalLinks'
						:images='postData.images'
						:video='postData.video'
					)

				slot(name='extra-content')

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
			//-.media-right
		slot(name='footer')
			PostImages.postMedia(
				v-if='showMedia && postData.images'
				:images='postData.images'
				:compact='compactOverride === null ? compactMedia : compactOverride'
				@expanded='expandPost($event)'
			)
			PostVideo.postMedia(
				v-if='showMedia && postData.video'
				:video='postData.video'
				@expanded='expandPost(0)'
			)
</template>

<script lang='ts'>
import {Vue, Component, Prop} from 'vue-property-decorator';
import {Action, Mutation} from 'vuex-class';
import {PostData} from '../../core/PostData';
import {library} from '@fortawesome/fontawesome-svg-core';
import {faCompress, faExpand, faHeart as fasHeart, faReply, faRetweet} from '@fortawesome/free-solid-svg-icons';
import {faHeart as farHeart} from '@fortawesome/free-regular-svg-icons';
import moment from 'moment';
import {ExpandedPost} from '../store';
import PostImages from './PostImages.vue';
import PostVideo from './PostVideo.vue';
import ArticleParagraph from './ArticleParagraph.vue';

library.add(fasHeart, farHeart, faRetweet, faReply, faExpand, faCompress);

//TODO Move this to external file
moment.defineLocale('twitter', {
	relativeTime: {
		future: "in %s",
		past:   "%s ago",
		s  : 'a few seconds',
		ss : '%ds',
		m:  "a minute",
		mm: "%dm",
		h:  "an hour",
		hh: "%dh",
		d:  "a day",
		dd: "%dd",
		M:  "a month",
		MM: "%dm",
		y:  "a year",
		yy: "%dy"
	}
});
//TODO Fix locale not switching back
moment().locale('en');

@Component({components: {ArticleParagraph, PostImages, PostVideo}})
export default class ArticleSkeleton extends Vue {
	@Prop({type: String, required: true})
	readonly articleId!: string;
	@Prop({type: Boolean, default: true})
	readonly showMedia!: boolean;
	@Prop({type: Object, required: true})
	readonly postData!: PostData;
	@Prop({type: Boolean})
	readonly compactMedia!: boolean;

	@Mutation('expandPost') storeExpandPost!: (post : ExpandedPost) => void;

	@Action('repost') actionRepost!: (id : string) => void;
	@Action('toggleLike') actionToggleLike!: (id : string) => void;

	hovered = false;
	compactOverride : boolean | null = null;

	repost() {
		this.actionRepost(this.postData.id);
	}

	toggleLike() {
		this.actionToggleLike(this.postData.id);
	}

	expandPost(selectedMedia: number) {
		this.storeExpandPost({id: this.postData.id, selectedMedia});
	}

	toggleExpandOverride() {
		if (this.compactOverride === null)
			this.compactOverride = !this.compactMedia;
		else
			this.compactOverride = !this.compactOverride;
	}

	get creationTimeShort() : string {
		const t = moment(this.postData.creationTime).locale('twitter').fromNow(true);
		moment().locale('en');
		return  t;
	}

	get creationTimeLong() : string {
		return moment(this.postData.creationTime).fromNow();
	}

	get compactOverrideIcon() : string | undefined {
		if (!this.postData.images)
			return;

		if (this.compactOverride === null)
			return this.compactMedia ? 'expand' : 'compress';
		else
			return this.compactOverride ? 'expand' : 'compress';
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

	small
		color: $light

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

.timestamp
	float: right

.postMedia
	margin-top: 1rem

//TODO width: getFaW(.fa-w-14) * 0.0625em
.svg-inline--fa.fa-w-14
	width: 0.875em

.svg-inline--fa.fa-w-16
	width: 1em

.svg-inline--fa.fa-w-20
	width: 1.25em
</style>