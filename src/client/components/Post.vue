<template lang='pug'>
	article.post(:post-id='postData.id' @mouseover='hovered = true' @mouseleave='hovered = false')
		.repostLabel(v-if='postData.reposterName')
			p {{ postData.reposterName + ' retweeted' }}

		.media
			figure.media-left
				p.image.is-64x64: img(
					:alt=`postData.authorHandle + "'s avatar"`
					:src='postData.authorAvatar'
				)

			.media-content
				.content
					span.names
						strong.has-text-light {{ postData.authorName }}
						small {{'@' + postData.authorHandle}}
					span.timestamp: small(:title='creationTimeLong') {{ creationTimeShort }}
					p {{ postData.text }}

				nav.level.is-mobile
					.level-left
						a.level-item.commentButton
							span.icon.is-small: FontAwesomeIcon(icon='reply')

						a.level-item.repostButton(
							:class='{repostedPostButton: postData.reposted}'
							@click='repost'
						)
							span.icon.is-small: FontAwesomeIcon(icon='retweet')

						a.level-item.likeButton(
							:class='{likedPostButton: postData.liked}'
							@click='toggleLike'
						)
							span.icon.is-small: FontAwesomeIcon(:icon="[postData.liked ? 'fas' : 'far', 'heart']")
			//-.media-right
		PostMedia(
			v-if='postData.images'
			:sources='postData.images'
		)
</template>

<script lang='ts'>
import {Vue, Component, Prop} from 'vue-property-decorator';
import {PostData} from '../../core/PostData';
import PostMedia from './PostMedia';
import {library} from '@fortawesome/fontawesome-svg-core';
import {faHeart as fasHeart, faRetweet, faReply} from '@fortawesome/free-solid-svg-icons';
import {faHeart as farHeart} from '@fortawesome/free-regular-svg-icons';
import moment from 'moment';
import {Action, Getter} from 'vuex-class';

library.add(fasHeart, farHeart, faRetweet, faReply);

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
moment().locale('en');

@Component({
	components: {PostMedia}
})
export default class Post extends Vue {
	@Prop({type: String, required: true})
	readonly postId!: string;

	@Getter readonly getPost!: (id: string) => PostData;
	@Action('toggleLike') actionToggleLike!: (id : string) => void;
	@Action('repost') actionRepost!: (id : string) => void;

	hovered = false;

	get postData() : PostData {
		console.log('bleh');
		return this.getPost(this.postId);
	}

	get creationTimeShort() : string {
		const t = moment(this.postData.creationTime).locale('twitter').fromNow(true);
		moment().locale('en');
		return  t;
	}

	get creationTimeLong() : string {
		return moment(this.postData.creationTime).fromNow();
	}

	toggleLike() {
		this.actionToggleLike(this.postId);
	}

	repost() {
		this.actionRepost(this.postId);
	}
}
</script>

<style scoped lang='sass'>
@use '../variables' as *

article.post
	padding: 1rem
	background-color: $post-color
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
		color: $grey-text

	a
		color: $grey-text

		&:hover.likeButton, &.likedPostButton
			svg
				color: #e0245e

		&:hover.repostButton, &.repostedPostButton
			svg
				color: #17bf63

		&:hover.commentButton svg
			color: #1da1f2

.timestamp
	float: right

.repostLabel
	margin-left: 64px
	color: $grey-text
	font-size: smaller

	p
		margin-left: 1rem
</style>

<style lang='sass'>
@use '../variables' as *

.slide-left-enter-active
	transition: 150ms ease-out

.slide-left-leave-active
	transition: 150ms ease-out
	transition-timing-function: cubic-bezier(0, 1, 0.5, 1)

.slide-left-enter-to, .slide-left-leave
	//max-width: 40px
	opacity: 1
	overflow: hidden

.slide-left-enter, .slide-left-leave-to
	//max-width: 0
	opacity: 0
	overflow: hidden
</style>