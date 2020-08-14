<template lang='pug'>
	article.post(:post-id='data.id')
		.repostLabel(v-if='data.reposterName')
			p {{ data.reposterName + ' retweeted' }}

		.media
			figure.media-left
				p.image.is-64x64: img(
					:alt=`data.authorHandle + "'s avatar"`
					:src='data.authorAvatar'
				)

			.media-content
				.content: p
					strong.has-text-light {{ data.authorName }}
					small {{'@' + data.authorHandle}}
					small sometime
					br
					| {{ data.text }}

				nav.level.is-mobile
					.level-left
						a.level-item.commentButton
							span.icon.is-small: FontAwesomeIcon(icon='reply')

						a.level-item.repostButton(
							:class='{repostedPostButton: reposted}'
							@click='repost'
						)
							span.icon.is-small: FontAwesomeIcon(icon='retweet')

						a.level-item.likeButton(
							:class='{likedPostButton: liked}'
							@click='like'
						)
							span.icon.is-small: FontAwesomeIcon(:icon="[liked ? 'fas' : 'far', 'heart']")

			.media-right: button.delete
		PostMedia(
			v-if='data.images'
			:sources='data.images'
		)
</template>

<script lang='ts'>
import Vue, {PropType} from 'vue';
import {PostData} from '../../core/PostData';
import PostMedia from './PostMedia';
import {library} from '@fortawesome/fontawesome-svg-core';
import {faHeart as fasHeart, faRetweet, faReply} from '@fortawesome/free-solid-svg-icons';
import {faHeart as farHeart} from '@fortawesome/free-regular-svg-icons';

library.add(fasHeart, farHeart, faRetweet, faReply);

export default Vue.component('Post', {
	props: {
		data: {
			type: Object as PropType<PostData>,
			required: true,
		},
	},
	data: function() {
		return {
			liked: this.data.liked,
			reposted: this.data.reposted,
		}
	},
	methods: {
		async like() {
			const json = await fetch(`twitter/${this.liked ? 'unlike' : 'like'}/${this.data.id}`, {method: 'POST'})
				.then(response => response.json());
			const post = json.post as PostData;

			this.updateData(post);
		},
		async repost() {
			if (this.reposted)
				return;

			const json = await fetch(`twitter/retweet/${this.data.id}`, {method: 'POST'})
				.then(response => response.json());
			const post = json.post as PostData;
			this.updateData(post);
		},
		updateData(newPostData : PostData) {
			this.$emit('update-data', newPostData);

			this.liked = newPostData.liked;
			this.reposted = newPostData.reposted;
		}
	},
	components: {
		PostMedia,
	},
});
</script>

<style scoped lang='sass'>
@use '../variables' as *

article.post
	padding: 1rem
	background-color: $post-color
	margin-bottom: 2px

	figure img
		border-radius: 4px

	a
		color: #8899a6

		&:hover.likeButton, &.likedPostButton
			svg
				color: #e0245e

		&:hover.repostButton, &.repostedPostButton
			svg
				color: #17bf63

		&:hover.commentButton svg
			color: #1da1f2

.repostLabel
	margin-left: 64px
	color: #8899a6
	font-size: smaller

	p
		margin-left: 1rem
</style>